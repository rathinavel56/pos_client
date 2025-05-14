import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import { Router } from '@angular/router';
import { SessionStorageService } from './../shared/util/sessionStorage.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
@Component({
  templateUrl: './member-dashboard.component.html'
})
export class MemberDashboardComponent extends BaseComponent implements OnInit {
  isLoaded: boolean = false;
  results: any = [];
  details: any;
  chooseDateFrom: any;
  chooseDateTo: any;
  modalReference: any;
  customer_name: any;
  lastPage: any;
  page: any;
  currentPage: any = 1;
  name: any;
  constructor(public recipeService: RecipeService,public router: Router, public sessionStorageService: SessionStorageService, private modalService: NgbModal) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.chooseDateFrom = this.getCurrentDate();
    this.chooseDateTo = this.getCurrentDate();
    this.getRecords(false);
  }
  setPagination(currentPage : any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords(false);
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
  openModal(content: any, customer: any) {
    this.customer_name = customer.customer_name;
    if (customer.purchase_amount === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No Purchase'
      });
    }
    this.modalReference = this.modalService.open(content);
    let popUp = document.querySelector(".modal-dialog");
    if (popUp) {
      popUp.classList.remove("modal-dialog");
    }

    this.modalReference.result.then(() => {});
    this.getRecords(customer.id);
  }
  getRecords(customer_id: any) {
    this.showLoading();
      this.isLoaded = false;
      if (!customer_id) {
        this.results = [];
      } else {
        this.details = [];
      }
      this.recipeService.memberDashboard({
          dateFrom: this.chooseDateFrom,
          dateTo: this.chooseDateTo,
          customer_id: customer_id,
          name: this.name
      }, this.currentPage)
        .subscribe((response: any) => {
          if (customer_id) {
            if (response.data && response.data.length > 0) {
              this.details = response.data;
            } else {
              this.details = [];
            }
          } else {
            if (response.data && response.data.data && response.data.data.length > 0) {
                this.results = response.data.data;
                this.page = response.data.current_page;
                this.lastPage = response.data.total;
            } else if (!customer_id) {
              this.page = 0;
              this.lastPage = 0;
            }
          }
          this.isLoaded = true;
          this.clearLoading();
          },
          (err: any) => {
            this.networkIssue();
        });
  }
}
