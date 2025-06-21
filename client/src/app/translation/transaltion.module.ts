import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { TranslationComponent } from './translation.component';
import { DataTablesModule } from "angular-datatables";
const routes: Routes = [
  {
    path: '',
    component: TranslationComponent
  }
];

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    SweetAlert2Module.forChild(),
    DataTablesModule
  ],
  declarations: [TranslationComponent]
})
export class TranslationModule {

}
