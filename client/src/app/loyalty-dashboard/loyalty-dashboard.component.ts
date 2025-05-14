import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import { Router } from '@angular/router';
import { SessionStorageService } from './../shared/util/sessionStorage.service';

@Component({
  templateUrl: './loyalty-dashboard.component.html'
})
export class LoyaltyDashboardComponent extends BaseComponent implements OnInit {
  isLoaded: boolean = false;
  results: any = [];
  chooseDateFrom: any;
  chooseDateTo: any;
  constructor(public recipeService: RecipeService,public router: Router, public sessionStorageService: SessionStorageService) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.chooseDateFrom = this.getCurrentDate();
    this.chooseDateTo = this.getCurrentDate();
    this.getRecords();
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
  getRecords() {
    this.showLoading();
      this.isLoaded = false;
      this.results = [];
      this.recipeService.loyaltyDashboard({
          dateFrom: this.chooseDateFrom,
          dateTo: this.chooseDateTo
      })
        .subscribe((response: any) => {
            if (response.data && response.data.length > 0) {
              this.results = response.data;
            }
            this.isLoaded = true;
            this.clearLoading();
          },
          (err: any) => {
            this.networkIssue();
        });
  }
}
