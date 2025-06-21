import { paginationComponent } from './pagination/pagination.component';
import { AmountToWordPipe  } from './amount_to_number';
import { TwoDigitDecimaNumberDirective } from './app_two_digit_decima_number';
import { NgModule } from '@angular/core';
import { RecipeService } from './service/recipe.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { PhoneMaskPipe } from './phone_maske';
import { NumberToWordsPipe } from './util/number-to-words.pipe';
import { CategoryPipe } from './util/category.pipe';
import { PrintInvoiceComponent } from '../print-invoice/print-invoice.component';
@NgModule({
  imports: [
    NgbModule,
    CommonModule
  ],
  declarations: [
    paginationComponent,
    PrintInvoiceComponent,
    TwoDigitDecimaNumberDirective,
    AmountToWordPipe,
    PhoneMaskPipe,
    NumberToWordsPipe,
    CategoryPipe
  ],
  exports: [
    paginationComponent,
    PrintInvoiceComponent,
    TwoDigitDecimaNumberDirective,
    AmountToWordPipe,
    PhoneMaskPipe,
    NumberToWordsPipe,
    CategoryPipe
  ],
  providers: [
    RecipeService
  ]
})
export class SharedModule {}
