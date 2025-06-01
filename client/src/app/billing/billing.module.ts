import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { BillingComponent } from './billing.component';
import { SharedModule } from '../shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DataTablesModule } from "angular-datatables";
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { FilterPipe } from '../shared/util/filter.pipe';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { BillingNewComponent } from '../billing-new/billing-new.component';
const routes: Routes = [
  {
    path: '',
    component: BillingNewComponent
  },
  {
    path: 'new',
    component: BillingComponent
  }
];
@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    SweetAlert2Module.forChild(),
    DataTablesModule,
    SelectDropDownModule,
    NgbModule,
    ReactiveFormsModule
  ],
  declarations: [
    FilterPipe,
    BillingComponent,
    BillingNewComponent
  ]
})
export class BillingModule {

}
