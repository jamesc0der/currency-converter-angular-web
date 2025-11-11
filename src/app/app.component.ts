import { Component } from '@angular/core';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';
import { ConversionHistoryComponent } from './components/conversion-history/conversion-history.component';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    CurrencyConverterComponent,
    ConversionHistoryComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Currency Converter';
}
