import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-print-invoice',
  templateUrl: './print-invoice.component.html'
})
export class PrintInvoiceComponent {
  @Input() data: any;
  @Input() translations: any;
}
