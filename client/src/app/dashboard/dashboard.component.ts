import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { TableUtil } from './../shared/util/tableUtil';
import { interval } from 'rxjs';
import { Router } from '@angular/router';
import { SessionStorageService } from './../shared/util/sessionStorage.service';

@Component({
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent extends BaseComponent implements OnInit {
  sales: any = [];
  sectionSales: any = [];
  currentCase: any;
  chooseDateFrom: any;
  chooseDateTo: any;
  chooseDateFromCopy: any;
  chooseDateToCopy: any;
  title: string = '';
  isAutoRefresh: boolean = false;
  totalQuantity: any;
  netAmount: any;
  taxAmount: any;
  discountAmount: any;
  grossAmount: any;
  updateSubscription: any;
  is_new: boolean = true;
  is_time_sale: boolean = false;
  isLoaded: boolean = false;
  constructor(public recipeService: RecipeService,public router: Router, public sessionStorageService: SessionStorageService) {
    super(recipeService, router);
  }
  ngOnInit() {
    //this.dateChange();
    this.chooseDateFrom = this.getCurrentDate();
    this.chooseDateTo = this.getCurrentDate();
    this.clearLoading();
    this.updateSubscription = interval(300000).subscribe((val: any) => {
        if (this.isAutoRefresh && this.sectionSales.length === 0) {
          this.dateChange();
        }
    });
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
  exportTable() {
    this.showLoading();
    this.recipeService.getSales({
        dateFrom: this.chooseDateFrom,
        dateTo: this.chooseDateTo,
        case: 'excel',
        is_new: this.is_new,
        is_time_sale: this.is_time_sale,
        filter: {
          case: 'excel'
        }
      })
      .subscribe((response: any) => {
          //this.downloadFile(response);
          if (response.data && response.data.length > 0) {
            let isDownload = TableUtil.exportJsonToExcel("from_" + response.dateFrom + "_To_" + response.dateTo , response.data);
            if (isDownload) {
              this.clearLoading();
            }
          } else {
            this.clearLoading();
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'No Data Found'
            });
          }
        },
        (err: any) => {
          this.networkIssue();
      });
  }
  downloadFile(data: any) {
    const blob: any = new Blob([data], { type: 'text/csv' });
    const url: any = window.URL.createObjectURL(blob);
    window.open(url);
  }
  dateChange() {
    this.showLoading();
    this.getRecords();
  }
  clearView() {
    this.sales = [];
    if (!this.is_time_sale) {
      this.populateToDate();
    } else {
      this.chooseDateTo = null;
    }
  }
  populateToDate() {
    this.sales = [];
    this.chooseDateTo = this.chooseDateFrom ? JSON.parse(this.chooseDateFrom) : null;
  }
  getRecords() {
    if (this.router.url.includes('/fulfilment-report')) {
      this.getFulfilmentReport();
    } else {
      this.isLoaded = false;
      this.recipeService.getSales({
          dateFrom: this.chooseDateFrom,
          dateTo: this.chooseDateTo,
          is_new: this.is_new,
          is_time_sale: this.is_time_sale,

        })
        .subscribe((response: any) => {
            if (response.data && response.data.length > 0) {
              this.sales = response.data;
              this.chooseDateFrom = response.dateFrom;
              this.chooseDateTo = response.dateTo;
            } else {
              this.sales = [];
            }
            this.isLoaded = true;
            this.clearLoading();
          },
          (err: any) => {
            this.networkIssue();
        });
      }
  }
  getFulfilmentReport() {
    this.isLoaded = false;
    this.recipeService.getFulfilmentReport({
        dateFrom: this.chooseDateFrom,
        dateTo: this.chooseDateTo
      })
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            response.data.forEach((ele: any) => {
              if (ele.data && ele.data.length > 0) {
                ele.data.forEach((element: any) => {
                  element.fulfillment_rate_per = ((+element.pickup_quantity/+element.approved_quantity)
                  * 100);
                });
                ele.data.sort((a: any,b: any) => (a.fulfillment_rate_per > b.fulfillment_rate_per) ? 1 : ((b.fulfillment_rate_per > a.fulfillment_rate_per) ? -1 : 0))
              }
            });
            this.sales = response.data;
            this.chooseDateFrom = response.dateFrom;
            this.chooseDateTo = response.dateTo;
          } else {
            this.sales = [];
          }
          this.isLoaded = true;
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getdishRecords(sale: any, cardData: any) {
    if ((cardData.amount || cardData.discount_amount) && (sale.isClickable === true || cardData.isClickable === true)) {
      this.showLoading();
      this.title = cardData.title;
      this.currentCase = (sale.case) ? sale.case : cardData.case;
      this.recipeService.getSales({
          dateFrom: this.chooseDateFrom,
          dateTo: this.chooseDateTo,
          is_new: this.is_new,
          saleTitle: sale.title,
          case: (sale.case) ? sale.case : cardData.case,
          filter: cardData
        })
        .subscribe((response: any) => {
            if (response.data && response.data.length > 0) {
              this.sectionSales = response.data;
              this.chooseDateFromCopy = response.dateFrom;
              this.chooseDateToCopy = response.dateTo;
              this.totalQuantity = this.sectionSales.reduce((accumulator: any, current: any) => accumulator + parseFloat(current.quantity), 0);
              this.netAmount = this.sectionSales.reduce((accumulator: any, current: any) => accumulator + parseFloat(current.amount), 0);
              this.taxAmount = this.sectionSales.reduce((accumulator: any, current: any) => accumulator + parseFloat(current.tax), 0);
              this.discountAmount = this.sectionSales.reduce((accumulator: any, current: any) => accumulator + parseFloat((current.discount_amount ? current.discount_amount: 0)), 0);
              this.grossAmount = this.sectionSales.reduce((accumulator: any, current: any) => accumulator + parseFloat(current.amount) + parseFloat(current.tax), 0);
            } else {
              this.sectionSales = [];
            }
            window.scrollTo(0, 0);
            this.clearLoading();
          },
          (err: any) => {
            this.networkIssue();
        });
    } else if (cardData.count && cardData.isClickable === true) {
      this.sessionStorageService.stocksData = {
        from: this.chooseDateFrom.toString(),
        to: this.chooseDateTo.toString(),
        title: cardData.title
      };
      if (cardData.title === 'Requested' || cardData.title === 'Accepted' || cardData.title === 'Cancelled' ||cardData.title === 'Rejected') {
          this.router.navigate(['/request-outlet-stocks']);
      } else if (cardData.title === 'Approved') {
          this.router.navigate(['/approve-outlet-stocks']);
      } else if (cardData.title === 'Pickup') {
          this.router.navigate(['/pickup-outlet-stocks']);
      }
    }
  }
  clearDish() {
    this.sectionSales = [];
    window.scrollTo(0, 0);
  }
}
