import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LocationMenuComponent } from './location-menu.component';
import { SharedModule } from '../shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { DataTablesModule } from "angular-datatables";
const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Location',
      urls: [
        { title: 'Menus', url: '/menus' },
        { title: 'Menus' }
      ]
    },
    component: LocationMenuComponent
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
    SelectDropDownModule
  ],
  declarations: [LocationMenuComponent]
})
export class LocationMenuModule {

}
