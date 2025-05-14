import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import { Router } from '@angular/router';
import { SessionStorageService } from '../shared/util/sessionStorage.service';

import { formatDate } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  templateUrl: './loyalty.component.html'
})
export class LoyaltyComponent extends BaseComponent implements OnInit {
  locations: any = [];
  modalReference: any;
  location_id: any = null;
  currentMember: any = null;
  config: any;
  from: any = '';
  title: any = '';
  to: any = '';
  type: any = '';
  locationId: any = '';
  repeatPurchases: any = [];
  members: any = [];
  earnBurns: any = [];
  categoryWiseSales: any = [];
  total: any = 0;
  totalPoints: any = 0;
  totalPurchaseAmount: any = 0;
  gainPoints = 0;
  constructor(public recipeService: RecipeService,public router: Router, public sessionStorageService: SessionStorageService, private modalService: NgbModal) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.from = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    this.to = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    this.config = {
      displayKey: 'name',
      search: true,
      height: 'auto',
      placeholder: 'Search',
      customComparator: ()=>{},
      moreText: 'more',
      noResultsFound: 'No results found!',
      searchPlaceholder: 'Search',
      searchOnKey: 'name'
    };
    this.getLocations();
    this.setTitle();
  }
  cancel() {
    this.from = '';
    this.to = '';
  }
  setTitle() {
    if (this.router.url.includes('/repeat-purchases')) {
      this.title = 'Repeat Purchases';
    } else if (this.router.url.includes('/members')) {
      this.title = 'Members';
    } else if (this.router.url.includes('/earn-burn')) {
      this.title = 'Earn Burn';
    } else {
      this.title = 'Category Wise Analysis';
    }
  }
  getRecords() {
    this.showLoading();
    if (this.router.url.includes('/repeat-purchases')) {
      this.getRepeatPurchases();
    } else if (this.router.url.includes('/members')) {
      this.getMembers();
    } else if (this.router.url.includes('/earn-burn')) {
      this.getEarnBurn();
    } else {
      this.getCategoryWiseAnalysis();
    }
  }
  getRepeatPurchases() {
    this.recipeService.getRepeatPurchases({
      from: this.from,
      to: this.to,
      location_id: this.location_id
    })
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          this.repeatPurchases = response.data;
          this.total = this.repeatPurchases.reduce(
            (accumulator: any, current: any) =>
              accumulator + parseFloat(current.discount_amount),
            0
          );
        } else {
          this.total = 0;
          this.repeatPurchases = [];
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  getMembers() {
    this.totalPoints = 0;
    this.totalPurchaseAmount = 0;
    this.recipeService.getMembers({
      from: this.from,
      to: this.to,
      location_id: this.location_id
    })
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          this.members = response.data;
          this.total = this.repeatPurchases.reduce(
            (accumulator: any, current: any) =>
              accumulator + parseFloat(current.discount_amount),
            0
          );
        } else {
          this.members = [];
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
      });
  }
  getEarnBurn() {
    this.gainPoints = 0;
    this.totalPoints = 0;
    this.totalPurchaseAmount = 0;
    this.recipeService.getEarnBurn({
      from: this.from,
      to: this.to,
      location_id: this.location_id
    })
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          this.earnBurns = response.data;
          this.earnBurns.forEach((element: any) => {
            this.gainPoints = this.gainPoints + element.gain_point;
            this.totalPoints = this.totalPoints + element.discount_amount;
            this.totalPurchaseAmount = this.totalPurchaseAmount + element.net_sale;
          });
        } else {
          this.earnBurns = [];
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
      });
  }
  getCategoryWiseAnalysis() {
    this.recipeService.getCategoryWiseAnalysis({
      from: this.from,
      to: this.to,
      location_id: this.location_id
    })
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          this.categoryWiseSales = response.data;
          this.categoryWiseSales.forEach((element: any) => {
            this.gainPoints = this.gainPoints + element.gain_point;
            this.totalPoints = this.totalPoints + element.discount_amount;
          });
        } else {
          this.categoryWiseSales = [];
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
      });
  }
  getLocations() {
    this.recipeService.getLocations({
      q: 'all'
    }, null)
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
         this.locations = response.data;
        } else {
          this.locations = [];
        }
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  locationSelectionChanged(e: any) {
    if (e && e.value && e.value.id) {
      this.location_id = e.value.id;
    } else {
      this.location_id = '';
    }
  }
  openModal(member: any, content: any) {
    this.totalPoints = 0;
    this.totalPurchaseAmount = 0;
    this.currentMember = member;
    this.currentMember.data.forEach((e: any) => {
      this.totalPoints = this.totalPoints + e.points;
      this.totalPurchaseAmount = this.totalPurchaseAmount + e.purchase_amount;
    });
    this.modalReference = this.modalService.open(content);
    let popUp = document.querySelector(".modal-dialog");
    if (popUp) {
      popUp.classList.remove("modal-dialog");
    }
    this.modalReference.result.then(() => {});
  }
  cancelPop() {
    this.currentMember = null;
  }
}
