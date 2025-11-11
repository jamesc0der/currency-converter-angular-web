import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { ConversionRecord } from './currency.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'conversion_history';
  private historySubject = new BehaviorSubject<ConversionRecord[]>([]);
  public history$ = this.historySubject.asObservable();
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadHistory();
  }

  private loadHistory() {
    if (!this.isBrowser) return;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const history = JSON.parse(stored);
        this.historySubject.next(history);
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }

  addConversion(record: Omit<ConversionRecord, 'id' | 'timestamp'>) {
    const newRecord: ConversionRecord = {
      ...record,
      id: this.generateId(),
      timestamp: new Date()
    };
    
    const currentHistory = this.historySubject.value;
    const updatedHistory = [newRecord, ...currentHistory];
    
    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
    }
    this.historySubject.next(updatedHistory);
  }

  clearHistory() {
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.historySubject.next([]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
