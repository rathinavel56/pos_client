import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-outlet-stocks-close',
  templateUrl: './outlet-stocks-close.component.html'
})
export class OutletStocksCloseComponent extends BaseComponent implements OnInit {
  stocks: any = [];
  selectedLocation: any;
  wasteDetails: any = [];
  locations: any = [];
  location_id: any = null;
  isCloseStocks: any = true;
  closeStocks: any = false;
  closeStocksEdit: any = false;
  isYesterday: boolean = false;
  choose_date: any;
  price: any = 0;
  wastePrice: any = 0;
  wasteQty: any = 0;
  config: any;
  printCopies: any = [ 1, 2 ];
  isShowLocation: any;
  categoryLoading: any = false;
  categories: any = [];
  selectedCategories: any = [];
  modalReference: any;
  userDetail: any;
  isNext: boolean = false;
  isPreview: boolean = false;
  constructor(public recipeService: RecipeService, public router: Router, private modalService: NgbModal) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.userDetail = sessionStorage.getItem('retail_pos') ? JSON.parse(sessionStorage.getItem('retail_pos') || '{}') : null;
    if (this.userDetail) {
      this.isShowLocation = (this.userDetail.session_detail.location_id == 0);
      if (!this.isShowLocation) {
        this.selectedLocation = this.userDetail.session_detail.location;
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
        searchOnKey: 'name'
      };
      if (this.isShowLocation) {
        this.getLocations();
      } else {
        this.previousDayClosingCheck();
      }
    }
  }
  nextPage() {
    this.isNext = !this.isNext;
    this.categoryLoading = true;
    setTimeout(() => {
      this.categoryLoading = false;
    }, 0);
  }
  closePreview() {
    this.isPreview = false;
  }
  previousDayClosingCheck() {
    this.showLoading();
    this.recipeService.previousDayClosing({
        location_id: this.location_id
      })
      .subscribe((response: any) => {
          if (response && response.data && response.data === true) {
            this.choose_date = response.yesterday;
            Swal.fire({
              icon: 'error',
              title: 'Please close previous day stocks ' + response.yesterday,
              text: 'Previous Day Stocks'
            });
            this.getRecords(false);
          } else {
            this.isYesterday = false;
            this.clearLoading();
          }
        },
        (err: any) => {
          this.networkIssue();
      });
  }
  openPreview(content: any) {
    this.isPreview = true;
    this.modalReference = this.modalService.open(content);
    let popUp = document.querySelector(".modal-dialog");
    if (popUp) {
      popUp.classList.remove("modal-dialog");
    }
    this.modalReference.result.then(() => {});
  }
  getRecords(isPrint: any) {
    this.isNext = false;
    this.isPreview = false;
    this.stocks = [];
    this.wasteDetails = [];
    this.showLoading();
    this.closeStocks = false;
    let inputDate = this.choose_date ? new Date(this.choose_date) : new Date();
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
    if (!this.choose_date) {
      this.choose_date = inputDate.toLocaleDateString("fr-CA",{year:"numeric", month:"2-digit", day:"2-digit"});
    }
    this.categories = [];
    this.recipeService.getStocksOutlets({
        q: 'all',
        location_id: this.location_id,
        is_close_stock : this.isCloseStocks,
        date: inputDate.toLocaleDateString("fr-CA",{year:"numeric", month:"2-digit", day:"2-digit"})
      })
      .subscribe((response: any) => {
          if (response && response.close && response.close.length && response.close.length > 0) {
            this.closeStocks = true;
              response.data = response.close;
              response.data.forEach((element: any) => {
                element.totalCost = element.product ? (element.product.purchase_price * element.quantity) : 0;
                element.quantity_used = +element.stock_used + +element.stock_expired;
                if (element.quantity === element.quantity_used) {
                  element.match = 'Matched';
                } else if (element.quantity_used > element.quantity) {
                  element.match = 'Greater';
                } else if (element.quantity_used < element.quantity) {
                  element.match = 'Less';
                }
              });
              this.stocks = response.data;
              this.closeStocksEdit = false;
              this.price = this.stocks.reduce((accumulator: any, current: any) => accumulator + parseFloat(current.totalCost), 0);
              this.wastePrice = 0;
              this.wasteQty = 0;
              this.wasteCalc();
              if (isPrint) {
                this.printCloseStock();
              }
          } else if (response.data && response.data.length > 0) {
            let timeDiff = inputDate.getTime() - todaysDate.getTime();
            let diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if(diffDays === -1) {
              this.closeStocksEdit = true;
            }
            let stocksTemp: any = [];
            const weekday = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
            const d = new Date();
            let day = weekday[d.getDay()];
            response.data.forEach((element: any) => {
              let eodDays = (element.product) ? element.product.eod_days : element.receipe.eod_days;
              let isEodDays = (eodDays && eodDays.toUpperCase().split(',').includes(day)); 
              if (isEodDays || ((element.product && element.product.is_show_in_pos === 1) || (element.receipe && element.receipe.is_show_in_pos === 1))) {
                element.isEdit = false;
                if (this.categories.findIndex((e: any) => (e.id === (element.product ? element.product.category.id : element.receipe.category.id))) === -1) {
                  this.categories.push((element.product ? element.product.category : element.receipe.category));
                }
                if (this.closeStocksEdit === true) {
                  element.quantity_used = '';
                  element.stock_used = 0;
                  element.stock_expired = 0;
                }
                element.totalCost = element.product ? (element.product.purchase_price * element.quantity) : 0;
                stocksTemp.push(element);
              }
            });
            this.stocks = stocksTemp;
            this.price = this.stocks.reduce((accumulator: any, current: any) => accumulator + parseFloat(current.totalCost), 0);
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
    if(stock.quantity_used > stock.quantity) {
      stock.quantity_used = '';
    }
  }
  filterItems() {
    this.categoryLoading = true;
    this.dataTableShowAll();
  }
  dataTableShowAll() {
    this.showLoading();
    let dataTableSelect: any = document.querySelector('#closing_stock_length select');
    let ogValue: any = dataTableSelect.value;
    dataTableSelect.value = -1;
    dataTableSelect.dispatchEvent(new Event("change"));
    setTimeout(() => {
      setTimeout(() => {
        dataTableSelect.value = ogValue;
        dataTableSelect.dispatchEvent(new Event("change"));
        this.categoryLoading = false;
        this.clearLoading();
      }, 1000);
    }, 1000);
  }
  editStock(stock: any) {
    stock.isEdit = true;
    stock.quantity_used = JSON.parse(stock.quantity);
  }
  cancelStock(stock: any) {
    stock.quantity_used = '';
    stock.isEdit = false;
  }
  submitStock(stock: any, isAll: any, content: any, wasteSkip: any) {
    let request: any = stock;
    if (!isAll) {
      stock.quantity = (stock.quantity && stock.quantity < -1) ? stock.quantity : 0;
    } else {
      request = {
        stocks: this.stocks,
        is_close_stock: true,
        location_id: this.location_id
      };
    }
    this.wasteDetails = this.stocks.filter((element: any) => (+element.stock_expired > 0));
    if (!wasteSkip && this.wasteDetails.length > 0) {
      this.modalReference = this.modalService.open(content);
      let popUp = document.querySelector(".modal-dialog");
      if (popUp) {
        popUp.classList.remove("modal-dialog");
      }
      this.modalReference.result.then(() => {});
    } else {
      if (this.modalReference) {
        this.modalReference.close();
      }
      this.saveDetails(stock, isAll, request);
    }
  }
  saveDetails(stock: any, isAll: any, request: any) {
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
          this.getRecords(true);
        } else {
          if (response.status && response.status === 'success') {
            stock.quantity = (stock.quantity-JSON.parse(stock.quantity_used));
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
  wasteCalc() {
    this.wastePrice = 0;
    this.wasteQty = 0;
    let wasteDtls = this.stocks.filter((element: any) => (+element.stock_expired > 0));
    if (wasteDtls && wasteDtls.length > 0) {
      wasteDtls.forEach((element: any) => {
        let price = element.receipe ? ((element.receipe.price && element.receipe.price.length > 0) ? element.receipe.price[0].selling_price : 0) : element.product.purchase_price;
        let total = (price * +element.stock_expired);
        let catName = element.receipe ? element.receipe.category.name : element.product.category.name;
        let catNameIndex = this.wasteDetails.findIndex((e:any) => (e.name === catName));
        let obj = {
          name: element.receipe ? element.receipe.name : element.product.name,
          stock_expired: element.stock_expired,
          price: price,
          total: total
        };
        if (catNameIndex > -1) {
          this.wasteDetails[catNameIndex].data.push(obj);
        } else {
          this.wasteDetails.push({
            name: catName,
            date: element.date,
            data: [obj]
          });
        }
      });
      this.wasteDetails.sort((a : any, b : any) => a.name - b.name);
      this.wastePrice = 0;
      this.wasteQty = 0;
      this.wasteDetails.forEach((element: any) => {
        let stock_expired = 0;
        let total = 0;
        element.data.forEach((ele: any) => {
          stock_expired = stock_expired + ele.stock_expired;
          total = total + ele.total;
        });
        this.wasteQty = this.wasteQty + stock_expired;
        this.wastePrice = this.wastePrice + total;
        element.data.push({
          name: 'Total',
          stock_expired: stock_expired,
          price: '',
          total: total
        });
      });
    }
  }
  printCloseStock() {
    setTimeout(() => {
      let w: any = window.open();
      let html = $("#print_closing_stock").html();
      let htmlToPrint =
        "" +
        '<style type="text/css">' +
        "table {" +
        "border-collapse: collapse;" +
        "}</style>";
      w.document.write(htmlToPrint + html); //only part of the page to print, using jquery
      w.document.close(); //this seems to be the thing doing the trick
      w.focus();
      w.print();
      w.close();
    }, 0);
  }
  onFocusUsed(stock: any, isBlur: boolean) {
    if (+stock.stock_used === 0) {
      stock.stock_used = isBlur ? 0 : '';
    }
  }
  onFocusExpired(stock: any, isBlur: boolean) {
    if (+stock.stock_expired === 0) {
      stock.stock_expired = isBlur ? 0 : '';
    }
  }

  addStocks(stock: any) {
    stock.quantity_used = +stock.stock_used + +stock.stock_expired;
    let priceDetails = {
      price: null,
      SGST_percentage: null,
      CGST_percentage: null,
      IGST_percentage: null,
      cess_percentage: null
    };
    if (stock.product_id) {
      priceDetails.price = stock.product.purchase_price;
      priceDetails.SGST_percentage = stock.product.purchase_SGST_percentage;
      priceDetails.CGST_percentage = stock.product.purchase_CGST_percentage;
      priceDetails.IGST_percentage = stock.product.purchase_IGST_percentage;
      priceDetails.cess_percentage = stock.product.purchase_cess_percentage;
    } else if (stock.receipe && stock.receipe.prices && stock.receipe.prices.length > 0) {
      let locationPrice =  stock.receipe.prices.find((e: any) => e.location_id === this.location_id);
      if (locationPrice) {
        priceDetails.price = stock.receipe.prices[0].selling_price;
        priceDetails.SGST_percentage = locationPrice.selling_SGST_percentage;
        priceDetails.CGST_percentage = locationPrice.selling_CGST_percentage;
        priceDetails.IGST_percentage = locationPrice.selling_IGST_percentage;
        priceDetails.cess_percentage = locationPrice.selling_cess_percentage;
      } else {
        priceDetails.price = stock.receipe.prices[0].selling_price;
        priceDetails.SGST_percentage = stock.receipe.prices[0].selling_SGST_percentage;
        priceDetails.CGST_percentage = stock.receipe.prices[0].selling_CGST_percentage;
        priceDetails.IGST_percentage = stock.receipe.prices[0].selling_IGST_percentage;
        priceDetails.cess_percentage = stock.receipe.prices[0].selling_cess_percentage;
      }
    }
    stock.price = priceDetails.price;
    stock.SGST_percentage = priceDetails.SGST_percentage;
    stock.CGST_percentage = priceDetails.CGST_percentage;
    stock.IGST_percentage = priceDetails.IGST_percentage;
    stock.cess_percentage = priceDetails.cess_percentage;
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
      this.selectedLocation = e.value;
      this.previousDayClosingCheck();
    } else {
      this.isYesterday = false;
    }
  }
}
