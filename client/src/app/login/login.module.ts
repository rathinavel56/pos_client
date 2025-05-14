import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  }
];

@NgModule({
  imports: [
      FormsModule,
      CommonModule,
      RouterModule.forChild(routes),
      SweetAlert2Module.forChild()
  ],
  declarations: [
    LoginComponent
  ]
})
export class LoginModule {

}
