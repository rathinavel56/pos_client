import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SubCategoryTicketComponent } from './sub-category-ticket.component';
import { SharedModule } from '../../shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
const routes: Routes = [
  {
    path: '',
    component: SubCategoryTicketComponent
  }
];

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    SweetAlert2Module.forChild({})
  ],
  declarations: [SubCategoryTicketComponent]
})
export class SubCategoryTicketModule {

}
