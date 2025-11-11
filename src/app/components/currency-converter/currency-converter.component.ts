import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyService, Currency } from '../../services/currency.service';
import { StorageService } from '../../services/storage.service';
import { CurrencyInputDirective } from '../../directives/currency-input.directive';

@Component({
  selector: 'app-currency-converter',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    CurrencyInputDirective
  ],
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss']
})
export class CurrencyConverterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private currencyService = inject(CurrencyService);
  private storageService = inject(StorageService);

  converterForm!: FormGroup;
  currencies: Currency[] = [];
  convertedAmount: number | null = null;
  exchangeRate: number | null = null;
  loading$ = this.currencyService.loading$;
  maxDate = new Date();

  ngOnInit() {
    this.initForm();
    this.loadCurrencies();
  }

  private initForm() {
    this.converterForm = this.fb.group({
      fromCurrency: ['USD', Validators.required],
      toCurrency: ['EUR', Validators.required],
      amount: [100, [Validators.required, Validators.min(0.01)]],
      date: [null]
    });
  }

  private loadCurrencies() {
    this.currencyService.getCurrencies().subscribe({
      next: (response) => {
        this.currencies = Object.values(response.data).sort((a, b) => 
          a.code.localeCompare(b.code)
        );
      },
      error: (error) => {
        console.error('Failed to load currencies', error);
      }
    });
  }

  swapCurrencies() {
    const from = this.converterForm.get('fromCurrency')?.value;
    const to = this.converterForm.get('toCurrency')?.value;
    this.converterForm.patchValue({
      fromCurrency: to,
      toCurrency: from
    });
    if (this.convertedAmount) {
      this.convert();
    }
  }

  convert() {
    if (this.converterForm.invalid) return;

    const { fromCurrency, toCurrency, amount, date } = this.converterForm.value;

    if (date) {
      this.convertHistorical(date, fromCurrency, toCurrency, amount);
    } else {
      this.convertLatest(fromCurrency, toCurrency, amount);
    }
  }

  private convertLatest(fromCurrency: string, toCurrency: string, amount: number) {
    this.currencyService.getLatestRates(fromCurrency, toCurrency).subscribe({
      next: (response) => {
        const rate = response.data[toCurrency];
        this.exchangeRate = rate;
        this.convertedAmount = amount * rate;
        this.saveConversion(fromCurrency, toCurrency, amount, this.convertedAmount, rate, new Date().toISOString().split('T')[0]);
      },
      error: (error) => {
        console.error('Conversion failed', error);
        this.convertedAmount = null;
        this.exchangeRate = null;
      }
    });
  }

  private convertHistorical(date: Date, fromCurrency: string, toCurrency: string, amount: number) {
    const dateStr = date.toISOString().split('T')[0];
    this.currencyService.getHistoricalRates(dateStr, fromCurrency, toCurrency).subscribe({
      next: (response) => {
        const rate = response.data[dateStr][toCurrency];
        this.exchangeRate = rate;
        this.convertedAmount = amount * rate;
        this.saveConversion(fromCurrency, toCurrency, amount, this.convertedAmount, rate, dateStr);
      },
      error: (error) => {
        console.error('Historical conversion failed', error);
        this.convertedAmount = null;
        this.exchangeRate = null;
      }
    });
  }

  private saveConversion(fromCurrency: string, toCurrency: string, fromAmount: number, toAmount: number, rate: number, date: string) {
    this.storageService.addConversion({
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
      rate,
      date
    });
  }
}
