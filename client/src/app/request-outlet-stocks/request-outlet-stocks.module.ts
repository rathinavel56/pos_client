import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DataTablesModule } from "angular-datatables";
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { RequestOutletStocksComponent } from './request-outlet-stocks.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
const routes: Routes = [
  {
    path: '',
    component: RequestOutletStocksComponent
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
    NgbModule
  ],
  declarations: [RequestOutletStocksComponent]
})
export class RequestOutletStocksModule {

}
