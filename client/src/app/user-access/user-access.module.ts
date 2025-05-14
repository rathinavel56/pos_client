import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { UserAccessComponent } from './user-access.component';
import { SharedModule } from '../shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DataTablesModule } from "angular-datatables";
import { TreeViewModule } from '../tree-view/tree-view.module';
const routes: Routes = [
  {
    path: '',
    component: UserAccessComponent
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
    TreeViewModule
  ],
  declarations: [UserAccessComponent]
})
export class UserAccessModule {

}
