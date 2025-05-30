import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { DashboardTicketComponent } from './dashboard-ticket.component';
import { SharedModule } from '../../shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SelectDropDownModule } from 'ngx-select-dropdown';
const routes: Routes = [
  {
    path: '',
    component: DashboardTicketComponent
  }
];

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    SweetAlert2Module.forChild(),
    SelectDropDownModule
  ],
  declarations: [DashboardTicketComponent]
})
export class DashboardTicketModule {

}
