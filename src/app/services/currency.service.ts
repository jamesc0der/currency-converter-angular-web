import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Currency {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

export interface ConversionRecord {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  date: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/currency';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  getCurrencies(): Observable<{ data: { [key: string]: Currency } }> {
    this.setLoading(true);
    return this.http.get<{ data: { [key: string]: Currency } }>(`${this.apiUrl}/currencies`)
      .pipe(tap(() => this.setLoading(false)));
  }

  getLatestRates(baseCurrency: string, targetCurrency: string): Observable<any> {
    this.setLoading(true);
    return this.http.get(`${this.apiUrl}/latest`, {
      params: {
        base_currency: baseCurrency,
        currencies: targetCurrency
      }
    }).pipe(tap(() => this.setLoading(false)));
  }

  getHistoricalRates(date: string, baseCurrency: string, targetCurrency: string): Observable<any> {
    this.setLoading(true);
    return this.http.get(`${this.apiUrl}/historical`, {
      params: {
        date,
        base_currency: baseCurrency,
        currencies: targetCurrency
      }
    }).pipe(tap(() => this.setLoading(false)));
  }
}
