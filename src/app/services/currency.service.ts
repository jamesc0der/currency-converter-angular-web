import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  private apiUrl = environment.apiUrl;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private currenciesCache: { data: { [key: string]: Currency } } | null = null;

  setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  getCurrencies(): Observable<{ data: { [key: string]: Currency } }> {
    if (this.currenciesCache) {
      return new Observable(observer => {
        observer.next(this.currenciesCache!);
        observer.complete();
      });
    }
    
    this.setLoading(true);
    return this.http.get<{ data: { [key: string]: Currency } }>(`${this.apiUrl}/currencies`)
      .pipe(
        finalize(() => this.setLoading(false)),
        tap(response => this.currenciesCache = response)
      );
  }

  getLatestRates(baseCurrency: string, targetCurrency: string): Observable<any> {
    this.setLoading(true);
    return this.http.get(`${this.apiUrl}/latest`, {
      params: {
        base_currency: baseCurrency,
        currencies: targetCurrency
      }
    }).pipe(finalize(() => this.setLoading(false)));
  }

  getHistoricalRates(date: string, baseCurrency: string, targetCurrency: string): Observable<any> {
    this.setLoading(true);
    return this.http.get(`${this.apiUrl}/historical`, {
      params: {
        date,
        base_currency: baseCurrency,
        currencies: targetCurrency
      }
    }).pipe(finalize(() => this.setLoading(false)));
  }
}
