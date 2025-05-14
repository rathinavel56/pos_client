import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CalculatorComponent } from './calculator.component';
import { SelectDropDownModule } from 'ngx-select-dropdown'
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { TreeviewModule } from 'ngx-treeview';
const routes: Routes = [
  {
    path: '',
    component: CalculatorComponent
  }
];

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    SelectDropDownModule,
    SweetAlert2Module.forChild(),
    TreeviewModule.forRoot()
  ],
  declarations: [CalculatorComponent]
})
export class CalculatorModule {

}
