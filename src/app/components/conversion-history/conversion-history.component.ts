import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { StorageService } from '../../services/storage.service';
import { ConversionRecord } from '../../services/currency.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-conversion-history',
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './conversion-history.component.html',
  styleUrls: ['./conversion-history.component.scss']
})
export class ConversionHistoryComponent implements OnInit {
  private storageService = inject(StorageService);
  history$!: Observable<ConversionRecord[]>;

  ngOnInit() {
    this.history$ = this.storageService.history$;
  }

  clearHistory() {
    if (confirm('Are you sure you want to clear all conversion history?')) {
      this.storageService.clearHistory();
    }
  }

  formatDate(timestamp: Date): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
