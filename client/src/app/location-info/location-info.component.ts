import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './location-info.component.html'
})
export class LocationInfoComponent extends BaseComponent implements OnInit {
  from: any = '';
  to: any = '';
  name: any = '';
  code: any = '';
  locations = [];
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.from = this.getCurrentDate();
    this.to = this.getCurrentDate();
    this.showLoading();
    this.getRecords();
  }
  cancel(): void {
    this.from = this.getCurrentDate();
    this.to = this.getCurrentDate();
    this.name = '';
    this.code = '';
    this.locations = [];
    this.showLoading();
    this.getRecords();
  }
  getRecords() {
    if (this.from && this.to) {
      this.locations = [];
      this.recipeService.locationInfo({
          name: this.name,
          code: this.code,
          from: this.from,
          to: this.to
        })
        .subscribe((response: any) => {
            if (response.data && response.data.length > 0) {
              this.locations = response.data;
              if (this.locations && this.locations.length > 0) {
                this.locations.forEach((e: any) => {
                  if (e.detail) {
                    const currentTime = new Date(e.detail.login_time);
                    e.detail.afterMorning = (currentTime.getHours() > 8 || (currentTime.getHours() === 8 && currentTime.getMinutes() > 0));
                  }
                });
              }
            }
            this.clearLoading();
          },
          (err: any) => {
            this.networkIssue();
        });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill from and to date'
      });
    }
  }
  getCurrentDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm: any = today.getMonth() + 1;
    let dd: any = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return yyyy + '-' + mm + '-' + dd;
  }
}
