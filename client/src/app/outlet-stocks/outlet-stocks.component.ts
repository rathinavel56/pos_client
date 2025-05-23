import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { TableUtil } from '../shared/util/tableUtil';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-outlet-stocks',
  templateUrl: './outlet-stocks.component.html'
})
export class OutletStocksComponent extends BaseComponent implements OnInit {
  stocks: any = [];
  locations: any = [];
  location_id: any = null;
  isCloseStocks: any = false;
  closeStocks: any = false;
  closeStocksEdit: any = false;
  detailProduct: any = null;
  detailProductsTotal: any = 0;
  modalReference: any;
  choose_date: any;
  price: any = 0;
  config: any;
  isShowLocation: any;
  userDetail: any;
  locationName: any;
  isExport: boolean = false;
  constructor(public recipeService: RecipeService, public router: Router, public datepipe: DatePipe,
    private modalService: NgbModal) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.userDetail = sessionStorage.getItem('hotbread') ? JSON.parse(sessionStorage.getItem('hotbread') || '{}') : null;
    if (this.userDetail) {
      this.isShowLocation = (this.userDetail.session_detail.location_id == 0);
      if (!this.isShowLocation) {
        this.locationName = this.userDetail.session_detail.location.name;
        this.location_id = this.userDetail.session_detail.location.id;
      }
      this.config = {
        displayKey: 'name',
        search: true,
        height: 'auto',
        placeholder: 'Search',
        customComparator: ()=>{},
        moreText: 'more',
        noResultsFound: 'No results found!',
        searchPlaceholder: 'Search',
        searchOnKey: 'name',
        aLengthMenu: [[25, 50, 75, -1], [25, 50, 75, "All"]]
      };
      if (this.isShowLocation) {
        this.getLocations();
      } else {
        this.getRecords();
      }
    } else {
      this.getRecords();
    }
  }
  cancelPop() {
    this.detailProduct = null;
  }
  getRecords() {
    this.detailProduct = null;
    this.detailProductsTotal = 0;
    this.showLoading();
    this.stocks = [];
    this.price = 0;
    this.closeStocks = false;
    let inputDate = new Date(this.choose_date);
    let todaysDate = new Date();
    this.closeStocksEdit = (inputDate.setHours(0,0,0,0) === todaysDate.setHours(0,0,0,0));
    if(inputDate > todaysDate) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Date should be less than or today',
        timer: 1000
      });
      return;
    }
    this.recipeService.getStocksOutlets({
        q: 'all',
        location_id: this.location_id,
        isStockSplit: true,
        is_close_stock : this.isCloseStocks,
        date: this.choose_date
      })
      .subscribe((response: any) => {
          if (response.close  && response.close.length > 0) {
            this.closeStocks = true;
            if (!this.closeStocksEdit) {
              this.stocks = [{}];
              this.clearLoading();
              return;
            } else {
              response.data = response.close;
              response.data.forEach((element: any) => {
                if (element.detail_products && element.detail_products.length > 0) {
                  let detailProducts = element.detail_products.filter((e: any) => (element.unit_size === e.unit_size));
                  detailProducts.forEach((child: any) => {
                    if(child.product.id == 283) {
                      console.log(child.product);
                    }
                    let price = +child.product.purchase_price;
                    element.totalCost = (price > 0) ? (price * +element.quantity) : 0;
                    this.price += parseFloat(element.totalCost);
                  });
                  let price = ((+element.purchase_price > 0) ? element.purchase_price: 0);
                  element.totalCost = (+price > 0) ? (+price * +element.quantity) : 0;
                } else {
                  let price = ((element.receipe.prices && element.receipe.prices.length > 0) ? element.receipe.prices[0].selling_price: 0);
                  element.totalCost = (+price > 0) ? (+price * +element.quantity) : 0;
                  this.price += parseFloat(element.totalCost);
                }
              });
              this.closeStocksEdit = false;
            }
          }
          if (response.data && response.data.length > 0) {
            this.price = 0;
            let stocks: any = [];
            response.data.forEach((element: any) => {
              let details: any = [];
              let totalCost = 0;
              if (element.product) {
                if (element.detail_products && element.detail_products.length > 0) {
                  element.detail_products.forEach((ele: any, index: number) => {
                    if(ele.product.id == 283) {
                      console.log(ele.product);
                    }
                    let pr = ele.price ? ele.price : element.product.purchase_price;
                    totalCost = totalCost + (pr * ele.quantity);
                    details.push({
                      sNo: index +1,
                      price: pr,
                      quantity: ele.quantity,
                      totalCost: (pr * ele.quantity)
                    });
                  });
                }
                stocks.push({
                  product_id: element.product_id,
                  name: element.product.name,
                  brand_name: element.product.brand.name,
                  category_name: element.product.category.name,
                  unit_size: element.unit_size,
                  unit_name: element.product.unit ? element.product.unit.name : '',
                  quantity: element.quantity,
                  isRed: (element.product.is_active === 0),
                  totalCost: (totalCost && totalCost > 0) ? totalCost : (element.quantity * element.product.purchase_price),
                  details
                });
              } else {
                let pr = 0;
                if (element.receipe.prices && element.receipe.prices.length > 0) {
                  let lopr = element.receipe.prices.find((e: any) => this.location_id === e.location_id);
                  if (lopr) {
                    pr = lopr.selling_price;
                  } else {
                    lopr = element.receipe.prices.find((e: any) => 0 === e.location_id);
                    if (lopr) {
                      pr = lopr.selling_price;
                    }
                  }
                }
                stocks.push({
                  receipe_id: element.receipe_id,
                  name: element.receipe.name,
                  brand_name: '',
                  category_name: element.receipe.category.name,
                  unit_size: element.unit_size,
                  unit_name: element.receipe.unit.name,
                  quantity: element.quantity,
                  isRed: (element.receipe.is_active === 0),
                  totalCost: (element.quantity * pr),
                  details
                });
              }
            });
            this.price = stocks.reduce(
              (accumulator: any, current: any) =>
                accumulator + parseFloat(current.totalCost),
              0
            );
            if (response.requestDetails && response.requestDetails.length > 0) {
              response.requestDetails.forEach((element: any) => {
                let currentStockIndex: any;
                if (element.product_id) {
                  element.price = element.price ? element.price : element.product.purchase_price;
                  currentStockIndex = stocks.findIndex((e: any) => (e.product_id === element.product_id && (element.unit_size === e.unit_size)));
                  if (currentStockIndex > -1) {
                    stocks[currentStockIndex].quantity = stocks[currentStockIndex].quantity + element.approved_quantity;
                    stocks[currentStockIndex].totalCost = stocks[currentStockIndex].totalCost + (element.approved_quantity * element.price);
                    stocks[currentStockIndex].location_name = element.request_outlet.location.name;
                    stocks[currentStockIndex].details.push({
                      quantity: element.approved_quantity,
                      price: element.price,
                      location_name: element.request_outlet.location.name,
                      totalCost: (element.approved_quantity * element.price)
                    });
                  } else {
                    let details = [{
                      quantity: element.approved_quantity,
                      price: element.price,
                      location_name: element.request_outlet.location.name,
                      totalCost: (element.approved_quantity * element.price)
                    }];
                    stocks.push({
                      product_id: element.product_id,
                      name: element.product.name,
                      brand_name: element.product.brand.name,
                      category_name: element.product.category.name,
                      unit_size: element.unit_size,
                      unit_name: element.product.unit.name,
                      quantity: element.approved_quantity,
                      totalCost: (element.approved_quantity * element.price),
                      isRed: (element.product.is_active === 0),
                      details
                    });
                  }
                } else {
                  currentStockIndex = stocks.findIndex((e: any) => (e.receipe_id === element.receipe_id && (element.unit_size === e.unit_size)));
                  if (currentStockIndex > -1) {
                    stocks[currentStockIndex].quantity = stocks[currentStockIndex].quantity + element.approved_quantity;
                    stocks[currentStockIndex].totalCost = stocks[currentStockIndex].totalCost + (element.approved_quantity * element.price);
                    stocks[currentStockIndex].location_name = element.request_outlet.location.name;
                    stocks[currentStockIndex].details.push({
                      quantity: element.approved_quantity,
                      price: element.price,
                      location_name: element.request_outlet.location.name,
                      totalCost: (element.approved_quantity * element.price)
                    });
                  } else {
                    let details = [{
                      quantity: element.approved_quantity,
                      price: element.price,
                      location_name: element.request_outlet.location.name,
                      totalCost: (element.approved_quantity * element.price)
                    }];
                    stocks.push({
                      receipe_id: element.receipe_id,
                      name: element.receipe.name,
                      brand_name: '',
                      category_name: element.receipe.category.name,
                      unit_size: element.unit_size,
                      unit_name: element.receipe.unit.name,
                      quantity: element.approved_quantity,
                      isRed: (element.receipe.is_active === 0),
                      totalCost: (element.approved_quantity * element.price),
                      details
                    });
                  }
                }
              });
            }
            stocks.forEach((element: any, index: number) => {
              element.sNo = index + 1;
            });
            this.stocks = stocks;
          } else {
            this.stocks = [{}];
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
  submitStock(stock: any, isAll: any) {
    let request: any = stock;
    if (!isAll) {
      stock.quantity = (stock.quantity && stock.quantity < -1) ? stock.quantity : 0;
    } else {
      request = {
        stocks: stock,
        is_close_stock: true,
        location_id: this.location_id
      };
    }
    this.showLoading();
    this.recipeService.saveStocksOutlets(request)
    .subscribe((response: any) => {
        if (isAll) {
          Swal.fire(
            'Saved!',
            'Saved Successfully.',
            'success'
          );
          this.closeStocksEdit = false;
          this.getRecords();
        } else {
          if (response.status && response.status === 'success') {
            stock.quantity = (stock.quantity-JSON.parse(stock.quantityUsed));
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
      this.locationName = e.value.name;
    }
  }
  exportTable() {
    this.isExport = true;
    this.showLoading();
    let dataTableSelect: any = document.querySelector('#stocksInHand_length select');
    let ogValue: any = dataTableSelect.value;
    dataTableSelect.value = -1;
    dataTableSelect.dispatchEvent(new Event("change"));
    setTimeout(() => {
      let currentDateTime = this.datepipe.transform((new Date), 'dd/MM/yyyy h:mm:ss');
      TableUtil.exportTableToExcel("stocksInHand", this.locationName + " Stocks In Hand Report " + currentDateTime, true);
      this.clearLoading();
      setTimeout(() => {
        this.isExport = false;
      }, 3000);
      setTimeout(() => {
        dataTableSelect.value = ogValue;
        dataTableSelect.dispatchEvent(new Event("change"));
      }, 1000);
    }, 1000);
  }
}
