import { filter } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';

import { TableUtil } from '../shared/util/tableUtil';
@Component({
  templateUrl: './outlet-stocks-history.component.html'
})
export class OutletStocksHistoryComponent extends BaseComponent implements OnInit {
  stocks: any = [];
  locations: any = [];
  location_id: any = null;
  config: any;
  from: any = '';
  to: any = '';
  type: any = '';
  lastPage: any;
  page: any;
  currentPage: any = 1;
  sortBy: any = 'date';
  sortOrder: any = 'DESC';
  locationId: any = '';
  isSearch: any = false;
  isShowLocation: any = false;
  products: any = [];
  uom: any;
  productId: any = '';
  q: any = '';
  brandId: any = '';
  q1: any = '';
  isExport: any = false;
  constructor(public recipeService: RecipeService,
    public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.from = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    this.to = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    let userDetail: any = sessionStorage.getItem('retail_pos') ? JSON.parse(sessionStorage.getItem('retail_pos') || '{}') : null;
    this.isShowLocation = (userDetail.session_detail.location_id== 0);
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
    this.getProductList();
  }

  productChanged(e: any) {
    if (e.value) {
      this.q = e.value.ogname ? e.value.ogname : e.value.name;
      this.brandId = e.value.brand_id ? e.value.brand_id: '';
    } else {
      this.q = '';
      this.brandId = '';
    }
  }
  getProductList() {
    this.recipeService.getProductList()
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          let prod: any = [];
          prod.push({
            id: 0,
            name: 'All'
          });
          response.data.forEach((element: any) => {
            if (element.name && element.brand && element.brand.name) {
              element.ogname = element.name;
              element.name = element.name + ' (' + element.brand.name + ')';
              prod.push({
                id: element.id,
                ogname: element.ogname,
                name: element.name,
                brand_id: element.brand.id
              });
            }
          });
          this.products = prod;
          this.getRecipes();
        }
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  getRecipes() {
    this.recipeService.getRecipes({
      q: 'all'
    }, null)
    .subscribe((response: any) => {
      if (response.data && response.data.length > 0) {
          response.data.forEach((ele: any)=> {
            ele.name = ele.name.toLowerCase().replace(/(^|\s)\S/g, function(t: any) {
              return t.toUpperCase();
            });
            this.products.push({
              id: ele.id,
              name: ele.name
            });
          });
          this.products.sort((a : any, b : any) => a.name - b.name);
          this.products = JSON.parse(JSON.stringify(this.products));
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  cancel() {
    this.locationId = '';
    this.from = '';
    this.to = '';
    this.stocks = [];
    this.isSearch = false;
    this.q = [];
    this.uom = '';
    this.q1 = [];
    this.brandId = '';
  }
  sorting(sort: any) {
    this.sortOrder = (this.sortBy === sort) ? ((this.sortOrder === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords();
  }
  setPagination(currentPage : any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords();
  }
  export() {
    this.getRecords(true);
  }
  getRecords(isExport?: any) {
    this.isExport = isExport;
    this.showLoading();
    this.recipeService.getStocksOutletHistory({
        from: this.from,
        to: this.to,
        type: this.type,
        brand_id: this.brandId,
        location_id: this.location_id,
        uom: this.uom,
        sort_by: this.sortBy,
        sort_order: this.sortOrder,
        isExport: this.isExport,
        q: this.q === 'All' ? undefined : this.q
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data.data.length > 0) {
            this.stocks = response.data.data;
            if (this.isExport) {
              TableUtil.exportTableToExcel("history-data", "Outlet Stocks Report", true);
            } else {
              this.page = response.data.current_page;
              this.lastPage = response.data.total;
            }
          } else {
            this.stocks = [];
            this.page = 0;
            this.lastPage = 0;
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  checkQuantity(stock: any) {
    if(stock.quantityUsed > stock.quantity) {
      stock.quantityUsed = '';
    }
  }
  editStock(stock: any) {
    stock.isEdit = true;
    stock.quantityUsed = JSON.parse(stock.quantity);
  }
  cancelStock(stock: any) {
    stock.quantityUsed = '';
    stock.isEdit = false;
  }
  submitStock(stock: any) {
    stock.quantity = (stock.quantity && stock.quantity < -1) ? stock.quantity : 0;
    this.showLoading();
    this.recipeService.saveStocksOutlets(stock)
    .subscribe((response: any) => {
        if (response.status && response.status === 'success') {
          stock.quantity = JSON.parse(stock.quantityUsed);
        } else {
          stock.quantity = response.quantity;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Retry again'
          });
        }
        stock.isEdit = false;
        this.stocks = this.stocks.filter((e: any) => e.quantity > 0);
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
    }
  }
}
