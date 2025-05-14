import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LoyaltyDashboardComponent } from './loyalty-dashboard.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DataTablesModule } from "angular-datatables";
import { SharedModule } from '../shared/shared.module';
const routes: Routes = [
  {
    path: '',
    component: LoyaltyDashboardComponent
  }
];

@NgModule({
  imports: [
      FormsModule,
      CommonModule,
      RouterModule.forChild(routes),
      SweetAlert2Module.forChild(),
      DataTablesModule,
      SharedModule
  ],
  declarations: [
    LoyaltyDashboardComponent
  ]
})
export class LoyaltyDashboardModule {

}
