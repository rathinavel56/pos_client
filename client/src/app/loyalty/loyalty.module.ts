import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LoyaltyComponent } from './loyalty.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DataTablesModule } from "angular-datatables";
import { SharedModule } from '../shared/shared.module';
import { SelectDropDownModule } from 'ngx-select-dropdown';
const routes: Routes = [
  {
    path: '',
    component: LoyaltyComponent
  }
];

@NgModule({
  imports: [
      FormsModule,
      CommonModule,
      RouterModule.forChild(routes),
      SweetAlert2Module.forChild(),
      DataTablesModule,
      SharedModule,
      SelectDropDownModule
  ],
  declarations: [
    LoyaltyComponent
  ]
})
export class LoyaltyModule {

}
