import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './incoming-stocks.component.html'
})
export class IncomingStocksComponent extends BaseComponent implements OnInit {
  isSearch: boolean = true;
  isAdd: boolean = false;
  isEdit: boolean = false;
  vendors: any = [];
  stocksIncomings: any = [];
  products: any = [];
  config: any;
  location_id: any;
  isCurrentStockLoading: any = false;
  stockdetails: any = [];
  stockdetail: any;
  location_in_id: any = '';
  stocksIncomingData: any = {
    vendor_id: '',
    location_id: '',
    invoice_date: '',
    receipt_date: '',
    invoice_number: '',
    file: '',
    total: 0,
    details: [{
      product_id: '',
      product_name: '',
      unit_name: '',
      unit_size: 1,
      batch_number: '',
      manufacturing_date: '',
      expiry_date: '',
      number_of_units: '',
      SGST_percentage: '',
      CGST_percentage: '',
      IGST_percentage: '',
      cess_percentage: '',
      cost_per_unit: '',
      discount_percentage: 0,
      discount_amount: 0
    }]
  };
  id: any = '';
  vendor_id: any = '';
  lastPage: any;
  page: any;
  currentPage: any = 1;
  locations: any;
  isShowLocation: any = false;
  isSubmitted: any = false;
  formData: any;
  filesUploded: any;
  totalPrice: any;
  sortBy: any = 'invoice_date';
  sortOrder: any = 'DESC';
  totalData: any = {
    base : 0,
    SGST : 0,
    CGST : 0,
    IGST : 0,
    CESS: 0,
    discount : 0,
    amount : 0
  };
  totalPercentage: number = 0;
  stocks: any = [];
  isPrint: boolean = false;
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.getRecords();
    this.getVendors();
    let userDetail: any = sessionStorage.getItem('retail_pos') ? JSON.parse(sessionStorage.getItem('retail_pos') || '{}') : null;
    if (userDetail) {
      this.isShowLocation = (userDetail.session_detail.location_id== 0);
    }
    if (this.isShowLocation) {
      this.getLocations();
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
  }
  sorting(sort: any) {
    this.sortOrder = (this.sortBy === sort) ? ((this.sortOrder === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords();
  }
  currentStock() {
    this.isCurrentStockLoading = true;
    if (this.location_id) {
      this.showLoading();
      this.recipeService.getStocksOutlets({
        q: 'all',
        location_id: this.location_id,
        is_close_stock : false
      })
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.stocks = response.data;
            response.data.forEach((e: any) => {
              if (e.product) {
                e.product.name = e.product.name + ' (PackSize : ' + e.unit_size + ')';
                e.product.unit_size = e.unit_size;
                e.product.isStock = true;
                this.products.push(e.product);
              }
            });
            this.products.sort((a: any, b: any) =>
              a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
            );
          } else {
            this.stocks = [];
          }
          this.isCurrentStockLoading = false;
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
      });
    }
  }
  getTotal() {
    let sum: any = 0;
    this.totalData = {
      base : 0,
      SGST : 0,
      CGST : 0,
      IGST : 0,
      cess : 0,
      discount : 0,
      amount: 0
    };
    if(this.stocksIncomingData.details.length > 0) {
      this.stocksIncomingData.details.forEach((detail: any) => {
        this.totalPercentage = +detail.SGST_percentage + +detail.CGST_percentage + +detail.IGST_percentage + +detail.cess_percentage;
        sum+= (((detail.number_of_units * detail.cost_per_unit) - (+detail.discount_amount > 0 ? +detail.discount_amount : 0)) + (this.totalPercentage > 0 ? (this.totalPercentage/100) : 0) * ((+detail.number_of_units * +detail.cost_per_unit)- (+detail.discount_amount > 0 ? +detail.discount_amount : 0)));
        let withoutTaxAmount: any = (+detail.number_of_units * +detail.cost_per_unit) - (+detail.discount_amount > 0 ? +detail.discount_amount : 0);
        this.totalData = {
          base : this.totalData.base + withoutTaxAmount,
          SGST : this.totalData.SGST + (+detail.SGST_percentage ? ((+detail.SGST_percentage/100) * withoutTaxAmount) : 0),
          CGST : this.totalData.CGST + (+detail.CGST_percentage ? ((+detail.CGST_percentage/100) * withoutTaxAmount) : 0),
          IGST : this.totalData.IGST + (+detail.IGST_percentage ? ((+detail.IGST_percentage/100) * withoutTaxAmount) : 0),
          cess : this.totalData.cess + (+detail.cess_percentage ? ((+detail.cess_percentage/100) * withoutTaxAmount) : 0),
          discount : this.totalData.discount + (+detail.discount_amount > 0 ? +detail.discount_amount : 0)
        };
      });
    }
    this.stocksIncomingData.total = sum;
  }
  add() {
    if (!this.locations || this.locations.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please add a Central Stores in location menu to proceed futher.'
      });
      return;
    } else if (!this.vendors || this.vendors.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please add a vendors in vendor menu to proceed futher.'
      });
      return;
    }
    this.isAdd = true;
    this.isSearch = false;
    this.location_id = '';
    this.stocksIncomingData.invoice_number = '';
    this.stocksIncomingData.invoice_date = '';
    this.stocksIncomingData.receipt_date = '';
    this.stocksIncomingData.vendor_id = '';
    this.stocksIncomingData.file = '';
    this.stocksIncomingData.total = 0;
    this.stocksIncomingData.details = [{
      product_id: '',
      product_name: '',
      unit_name: '',
      unit_size: 1,
      batch_number: '',
      manufacturing_date: '',
      expiry_date: '',
      number_of_units: '',
      SGST_percentage: '',
      CGST_percentage: '',
      IGST_percentage: '',
      cess_percentage: '',
      cost_per_unit: '',
      discount_percentage: 0,
      discount_amount: 0
    }];
    this.currentStock();
    this.isSubmitted = false;
    this.clear();
  }
  cancel(isConfirm: any): void {
    if (isConfirm) {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.cancelConfirm();
        }
      });
    } else {
      this.cancelConfirm();
    }
  }
  cancelConfirm() {
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.clear();
  }
  clear() {
    this.totalData = null;
    this.location_id = '';
    this.location_in_id = '';
    this.vendor_id = '';
    this.stocks = [];
    this.stocksIncomingData.id = '';
    this.stocksIncomingData.invoice_number = '';
    this.stocksIncomingData.invoice_date = '';
    this.stocksIncomingData.receipt_date = '';
    this.stocksIncomingData.vendor_id = '';
    this.stocksIncomingData.file = '';
    this.stocksIncomingData.total = 0;
    this.totalPercentage = 0;
    this.stocksIncomingData.details = [{
      product_id: '',
      product_name: '',
      unit_size: 1,
      unit_name: '',
      batch_number: '',
      manufacturing_date: '',
      expiry_date: '',
      number_of_units: '',
      SGST_percentage: '',
      CGST_percentage: '',
      IGST_percentage: '',
      cess_percentage: '',
      cost_per_unit: '',
      discount_percentage: 0,
      discount_amount: 0
    }];
    this.isSubmitted = false;
    let stocksIncomingFile: any = document.getElementById('stocksIncomingFile');
    if (stocksIncomingFile) {
      stocksIncomingFile.value = '';
    }
    this.sortBy = 'invoice_date';
    this.sortOrder = 'DESC';
    this.totalData = {
      base : 0,
      gst : 0,
      cess : 0,
      discount : 0,
      amount : 0
    };
  }
  removeRecipe(indexOfelement: any) {
    this.stocksIncomingData.details.splice(indexOfelement, 1);
  }
  addstocks() {
    this.stocksIncomingData.details.push({
        product_id: '',
        product_name: '',
        unit_size: 1,
        unit_name: '',
        batch_number: '',
        manufacturing_date: '',
        expiry_date: '',
        number_of_units: '',
        SGST_percentage: '',
        CGST_percentage: '',
        IGST_percentage: '',
        cess_percentage: '',
        cost_per_unit: '',
        discount_percentage: 0,
        discount_amount: 0
      });
  }
  onKeyDownEvent(e: any) {
    if (this.isSearch) {
      this.search(false);
    }
  }
  selectionChanged(e: any, indexOfelement: any) {
    if (e && e.value && e.value.id) {
      this.stocksIncomingData.details[indexOfelement].product_id = e.value.id;
      this.stocksIncomingData.details[indexOfelement].unit_name = e.value.unit.name;
      let current_stocks = this.stocks.find((ele: any) => (ele.product_id === e.value.id && (ele.unit_size === e.value.unit_size ? e.value.unit_size : 1)));
      if (current_stocks) {
        this.stocksIncomingData.details[indexOfelement].current_stocks = current_stocks.quantity;
        this.stocksIncomingData.details[indexOfelement].SGST_percentage = current_stocks.product.purchase_SGST_percentage;
        this.stocksIncomingData.details[indexOfelement].CGST_percentage = current_stocks.product.purchase_CGST_percentage;
        this.stocksIncomingData.details[indexOfelement].IGST_percentage = current_stocks.product.purchase_IGST_percentage;
        this.stocksIncomingData.details[indexOfelement].cess_percentage = current_stocks.product.purchase_cess_percentage;
        this.stocksIncomingData.details[indexOfelement].unit_size = current_stocks.unit_size;
      } else {
        this.stocksIncomingData.details[indexOfelement].current_stocks = 0;
      }
    } else {
      this.stocksIncomingData.details[indexOfelement].product_id = '';
      this.stocksIncomingData.details[indexOfelement].unit_name = '';
      this.stocksIncomingData.details[indexOfelement].current_stocks = 0;
    }
  }
  vendorSelectionChanged(e: any) {
    if (e && e.value && e.value.id) {
      this.stocksIncomingData.vendor_id = e.value.id;
    } else {
      this.stocksIncomingData.vendor_id = '';
    }
  }
  search(isReset: boolean) {
    if (isReset) {
      this.cancel(false);
    }
    this.showLoading();
    this.getRecords();
  }
  isDataVaild() {
    let stocks = this.stocksIncomingData.details.filter((e: any) => !e.product_id || !e.unit_size || !e.number_of_units);
    return (((this.isShowLocation && this.location_id) || !this.isShowLocation) && this.stocksIncomingData.vendor_id && this.stocksIncomingData.invoice_date && this.stocksIncomingData.receipt_date && this.stocksIncomingData.invoice_number && stocks.length === 0);
  }
  uploadFile(event: any) {
    this.filesUploded = event.target.files;
    this.deleteAttachment();
  }
  printInvoice() {
    this.isPrint = true;
    setTimeout(() => {
      let w: any = window.open();
      let html = $("#printIncoming").html();
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
      setTimeout(() => {
        this.isPrint = false;
      }, 0);
    }, 0);
  }
  submit(id: any) {
    this.isSubmitted = true;
    if (this.isDataVaild()) {
      this.saveDetails(id);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill the required fields'
      });
    }
  }
  setPagination(currentPage : any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords();
  }
  getRecords() {
    this.recipeService.getStocksIncomings({
        location_id : this.location_id,
        invoice_number: this.stocksIncomingData.invoice_number,
        invoice_date: this.stocksIncomingData.invoice_date ? this.stocksIncomingData.invoice_date : '',
        receipt_date: this.stocksIncomingData.receipt_date ? this.stocksIncomingData.receipt_date : '',
        vendor_id: this.stocksIncomingData.vendor_id,
        sort_by: this.sortBy,
        sort_order: this.sortOrder
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data.data.length > 0) {
            this.stocksIncomings = response.data.data;
            this.page = response.data.current_page;
            this.lastPage = response.data.total;
          } else {
            this.stocksIncomings = [];
            this.page = 0;
            this.lastPage = 0;
          }
          this.clearLoading();
          this.getProductList();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getStocksDetails(id :any, isEditable: any) {
    this.isEdit = isEditable;
    this.isSearch = !this.isEdit ? true : false;
    this.showLoading();
    this.recipeService.getStocksDetails({
      id: id
    })
    .subscribe((response: any) => {
        if (this.isEdit) {
          this.totalData = {
            base : 0,
            gst : 0,
            cess : 0,
            discount : 0,
            amount : 0
          };
          if (this.locations && this.locations.length > 0) {
            this.location_in_id = response.data.location;
          }
          this.location_id = response.data.location_id;
          this.vendor_id = response.data.vendor;
          this.stocksIncomingData.id = response.data.id;
          this.stocksIncomingData.location_id = response.data.location_id;
          this.stocksIncomingData.invoice_number = response.data.invoice_number;
          this.stocksIncomingData.invoice_date = response.data.invoice_date;
          this.stocksIncomingData.receipt_date = response.data.receipt_date;
          this.stocksIncomingData.vendor_id = response.data.vendor_id;
          this.stocksIncomingData.attachment = response.data.attachment;
          this.stocksIncomingData.file = '';
          this.stocksIncomingData.enable_edit = response.data.location.enable_edit;
          this.totalPrice = 0;
          this.stocksIncomingData.details = [];
          response.data.stocks_incoming_details.forEach((stock: any) => {
              this.totalPercentage = (stock.SGST_percentage ? stock.SGST_percentage : 0) + (stock.CGST_percentage ? stock.CGST_percentage : 0) + (stock.IGST_percentage ? stock.IGST_percentage : 0) + (stock.cess_percentage ? stock.cess_percentage : 0);
              this.totalPrice+= ((stock.number_of_units * stock.cost_per_unit) + (this.totalPercentage > 0 ? (this.totalPercentage/100) : 0) * (stock.number_of_units * stock.cost_per_unit));
              let product = this.products.find((e: any) => e.id === stock.product.id);
              this.stocksIncomingData.details.push({
                product_id: stock.product_id,
                product_name: product,
                unit_size: stock.unit_size,
                unit_name: stock.product.unit.name,
                number_of_units: stock.number_of_units,
                SGST_percentage: stock.SGST_percentage,
                CGST_percentage: stock.CGST_percentage,
                IGST_percentage: stock.IGST_percentage,
                cess_percentage: stock.cess_percentage,
                batch_number: stock.batch_number,
                manufacturing_date: stock.manufacturing_date,
                expiry_date: stock.expiry_date,
                cost_per_unit: stock.cost_per_unit,
                discount_percentage: stock.discount_percentage,
                discount_amount: stock.discount_amount
              });
          });
          this.stocksIncomingData.total = JSON.parse(this.totalPrice);
        } else {
            this.stockdetails = response.data.stocks_incoming_details;
            this.totalPrice = 0;
            if(this.stockdetails.length > 0){
              this.stockdetails.forEach((stock: any) => {
                stock.SGST_percentage = (+stock.SGST_percentage > 0 ? +stock.SGST_percentage : 0);
                stock.CGST_percentage = (+stock.CGST_percentage > 0 ? +stock.CGST_percentage : 0);
                stock.IGST_percentage = (+stock.IGST_percentage > 0 ? +stock.IGST_percentage : 0);
                stock.cess_percentage = (+stock.cess_percentage > 0 ? +stock.cess_percentage : 0);
                stock.number_of_units = +stock.number_of_units;
                stock.cost_per_unit = +stock.cost_per_unit;
                stock.discount_amount = (+stock.discount_amount > 0 ? +stock.discount_amount : 0);
                this.totalPercentage = stock.SGST_percentage + stock.CGST_percentage + stock.IGST_percentage + stock.cess_percentage;
                stock.line_amount = (stock.number_of_units * stock.cost_per_unit) - stock.discount_amount;
                stock.SGST_amount = (stock.SGST_percentage > 0 ? ((stock.SGST_percentage/100) * stock.line_amount) : 0);
                stock.CGST_amount = (stock.CGST_percentage > 0 ? ((stock.CGST_percentage/100) * stock.line_amount) : 0);
                stock.IGST_amount = (stock.IGST_percentage > 0 ? ((stock.IGST_percentage/100) * stock.line_amount) : 0);
                stock.cess_amount = (stock.cess_percentage > 0 ? ((stock.cess_percentage/100) * stock.line_amount) : 0);
                stock.line_amount = (stock.line_amount + (this.totalPercentage > 0 ? (this.totalPercentage/100) : 0) * stock.line_amount)
                this.totalPrice+= stock.line_amount;
              });
            this.stockdetail = response.data;
          } else {
            this.stockdetails = [];
          }
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  deleteAttachment() {
    this.stocksIncomingData.attachment = undefined;
  }
  downloadFile(data: any) {
    let hostName =
      window.location.hostname !== "localhost"
        ? "http://" + window.location.hostname
        : "http://localhost:9000";
    let link: any = document.createElement("a");
    link.href = hostName + '/assets/download/invoice/' + data.attachment.file_name;
    document.body.appendChild(link);
    let fileExt: any = data.attachment.file_name.split('.').pop();
    link.download = data.invoice_number + '.' + fileExt;
    link.target = '_blank';
    link.click();
    document.body.removeChild(link);
  }
  cancelStocksDetails() {
    this.stockdetails = [];
  }
  saveDetails(id: any) {
    this.getTotal();
    this.showLoading();
    this.stocksIncomingData.location_id = this.isShowLocation ? this.location_id : undefined;
    this.formData = new FormData();
    if (this.filesUploded && this.filesUploded.length > 0) {
      this.formData.append('file', this.filesUploded[0], this.filesUploded[0].name);
    }
    this.formData.append('data', JSON.stringify(this.stocksIncomingData));
    this.recipeService.saveStocksIncoming(this.formData)
        .subscribe((response: any) => {
          this.clearLoading();
          if (response) {
            Swal.fire(
              'Saved',
              'Your Incoming has been saved.',
              'success'
            );
            this.cancel(false);
            this.getRecords();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: response.data
            });
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getVendors()  {
    this.recipeService.getVendors({
      q:'all'
    }, null)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.vendors = response.data;
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getProductList() {
    this.recipeService.getProductList()
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          let prod: any = [];
          response.data.forEach((element: any) => {
            if (element.name && element.brand && element.brand.name) {
              element.name = element.name + ' (' + element.brand.name + ')';
              prod.push(element);
            }
          });
          this.products = prod;
        }
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
      if (this.isAdd || this.isEdit) {
        this.products = this.products.filter((e: any) => (e.isStock !== true));
        this.currentStock();
      }
    } else {
      this.stocks = [];
    }
  }
  delete(id: any) {
    Swal.fire({
      title: 'Are you sure delete this?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.showLoading();
        this.recipeService.deleteStocksIncoming({
          id: id
        })
        .subscribe((response: any) => {
          this.clearLoading();
          if (response && response.status === 'success') {
            Swal.fire(
              'Saved',
              'Your Incoming has been deleted.',
              'success'
            );
            this.getRecords();
            this.cancel(false);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: response.data
            });
          }
        },
        (err: any) => {
            this.networkIssue();
         });
      }
    });
  }
}
