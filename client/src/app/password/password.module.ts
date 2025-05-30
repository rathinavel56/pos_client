import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { PasswordComponent } from './password.component';
import { SharedModule } from '../shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
const routes: Routes = [
  {
    path: '',
    component: PasswordComponent
  }
];

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    SweetAlert2Module.forChild(),
    NgbModule
  ],
  declarations: [PasswordComponent]
})
export class PasswordModule {

}
