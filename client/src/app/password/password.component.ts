import { Component } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './password.component.html'
})
export class PasswordComponent extends BaseComponent {
  currentPassword: any;
  password: any;
  confirmPassword: any;
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  submit() {
    if (!this.currentPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please Enter Current Password'
      });
      return;
    } else if (!this.password) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please Enter Password'
      });
      return;
    } else if (!this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please Enter Confirm Password'
      });
      return;
    } else if (this.password !== this.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please Match Password and Confirm Password'
      });
      return;
    }
    this.showLoading();
    this.recipeService.changePassword({
          current_password: this.currentPassword,
          password: this.password
        })
        .subscribe((response: any) => {
          if (response && response.status !== 'fail') {
            this.clearLoading();
            Swal.fire(
              'Saved',
              'Your Password has been updated.',
              'success'
            );
            this.currentPassword = '';
            this.password = '';
            this.confirmPassword = '';
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: response.message
            });
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
}
