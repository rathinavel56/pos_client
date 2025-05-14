import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { MenusComponent } from './menus.component';
import { SharedModule } from '../shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { DataTablesModule } from "angular-datatables";
import { DragulaModule } from "ng2-dragula";
const routes: Routes = [
  {
    path: '',
    component: MenusComponent
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
    DragulaModule.forRoot()
  ],
  declarations: [MenusComponent]
})
export class MenusModule {

}
