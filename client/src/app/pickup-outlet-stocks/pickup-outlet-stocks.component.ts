import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { SessionStorageService } from './../shared/util/sessionStorage.service';


@Component({
  templateUrl: './pickup-outlet-stocks.component.html'
})
export class PickupOutletStocksComponent extends BaseComponent implements OnInit {
  locations: any = [];
  locationsAll: any = [];
  location_id: any = null;
  config: any;
  isShowLocation: any;
  lastPage: any;
  page: any;
  currentPage: any = 1;
  sortBy: any = 'id';
  sortOrder: any = 'ASC';
  order_status_id: any = 2;
  status: any = [];
  requestOutletStocks: any = [];
  products: any = [];
  requestOutletStocksdetails: any;
  from_loc: any = '';
  to_loc: any = '';
  isSubmitted: any = false;
  isAdd: boolean = false;
  isEdit: boolean = false;
  isSearch: boolean = true;
  sessionLocationId: any = 0;
  currentStock: any = '';
  requestOutletStocksData: any = [];
  isRecipeDisplay: boolean = false;
  total: any = 0;
  approvedRequest: boolean = false;
  detailSubmit: boolean = false;
  isLocationLoading = true;
  constructor(public recipeService: RecipeService, public router: Router, public sessionStorageService: SessionStorageService) {
    super(recipeService, router);
  }
  ngOnInit() {
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
    let userDetail: any = sessionStorage.getItem('hotbread') ? JSON.parse(sessionStorage.getItem('hotbread') || '{}') : null;
    if (userDetail) {
      this.isShowLocation = (userDetail.session_detail.location_id== 0);
      this.getLocationsAll();
    }
    this.requestOutletStocks = {
      id: "",
      driver_name: '',
      driver_mobile: '',
      delivery_date: '',
      details: [{
        product_id: null,
        receipe_id: null,
        unit_name: '',
        requested_quantity: '',
        parent_quantity: ''
      }]
    };
    this.showLoading();
    this.orderStatus();
    this.getRecords();
    this.getLocations();
  }
  orderStatus() {
    this.recipeService.orderStatus()
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
         this.status = response.data;
         this.status.splice(0, 1);
         this.status[0].name = 'Approved/Partially Approved';
         this.status.splice(1, 3);
        } else {
          this.status = [];
        }
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  getLocations() {
    this.recipeService.getLocations({
      q: 'centralstocks_with_receipe'
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
  approveAll(e: any) {
    this.requestOutletStocksdetails.request_outlet_details.forEach((element: any) => {
      element.isChecked = e.currentTarget.checked;
    });
  }
  getLocationsAll() {
    this.isLocationLoading = true;
    this.recipeService.getLocations({
      q: 'all'
    }, null)
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
         this.locationsAll = response.data;
        } else {
          this.locationsAll = [];
        }
        this.isLocationLoading = false;
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  getRecords() {
    this.recipeService.getRequestOutletStocks({
      delivery_date: this.requestOutletStocks.delivery_date ? this.requestOutletStocks.delivery_date : null,
      id: this.requestOutletStocks.id,
      from_location_id: this.requestOutletStocks.from_location_id,
      location_id: this.requestOutletStocks.location_id,
      order_status_id: this.order_status_id,
      sort_by: this.sortBy,
      sort_order: this.sortOrder
    }, this.currentPage)
    .subscribe({
      next: (response: any) => {
        if (response.data && response.data.data.length > 0) {
          this.requestOutletStocksData = response.data.data;
          this.page = response.data.current_page;
          this.lastPage = response.data.total;
        } else {
          this.requestOutletStocksData = [];
          this.page = 0;
          this.lastPage = 0;
        }
        this.clearLoading();
      },
      error: () => {
          this.clearLoading();
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Internal Server Error'
          });
      },
    });
  }
  setPagination(currentPage : any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords();
  }
  quantityCheck(detail: any, indexOfelement: any) {
    if (!this.isRecipeDisplay && detail.requested_quantity && detail.requested_quantity > detail.parent_quantity) {
      this.requestOutletStocks.details[indexOfelement].requested_quantity = null;
    }
  }
  submit(id: any) {
    this.isSubmitted = true;
    this.saveDetails();
  }
  saveDetails() {
      let wasteCount = this.requestOutletStocksdetails.request_outlet_details.filter((e: any) => +e.approved_quantity !== +e.pickup_quantity).length;
      if (wasteCount > 0) {
        Swal.fire({
          title: "Missmatch Pickup Notes",
          input: "text",
          inputAttributes: {
            autocapitalize: "off",
          },
          showCancelButton: true,
          confirmButtonText: "Submit",
          showLoaderOnConfirm: true,
          inputValidator: (value) => {
            return new Promise((resolve) => {
              if (value && value.trim() !== "") {
                resolve(null);
              } else {
                resolve("Please Enter Missmatch Pickup Notes");
              }
            });
          },
          allowOutsideClick: () => false,
        }).then((result) => {
          if (result.isConfirmed) {
            this.pickupRequestOutletStockSubmit(result.value);
          }
        });
      } else {
        this.pickupRequestOutletStockSubmit('');
      }
  }
  pickupRequestOutletStockSubmit(pickup_notes: any) {
    this.showLoading();
    let request_outlet_details: any = [];
    let products: any = [];
    this.requestOutletStocksdetails.request_outlet_details.forEach((e: any) => {
        request_outlet_details.push({
          id: e.id,
          product_id: e.product_id,
          receipe_id: e.receipe_id,
          approved_quantity: +e.approved_quantity,
          pickup_quantity: e.pickup_quantity,
          unit_size: e.unit_size,
          status: e.status,
        });
        if (e.product_id) {
          products.push(e.product_id);
        }
    });
    this.recipeService.savePickupRequestOutletStocks({
      id: this.requestOutletStocksdetails.id,
      request_outlet_details: request_outlet_details,
      pickup_notes: pickup_notes
    })
    .subscribe((response: any) => {
        this.clearLoading();
        if (response && response.status === 'success') {
          Swal.fire(
            'Saved',
            'Your Pickup has been saved.',
            'success'
          );
          this.getRecords();
          this.cancel(false);
          this.cancelStocksDetails();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Internal Server Error'
          });
        }
      },
      (err: any) => {
        this.networkIssue();
    });
  }
  sorting(sort: any) {
    this.sortOrder = (this.sortBy === sort) ? ((this.sortOrder === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords();
  }
  checkQuantity(stock: any) {
    stock.pickup_quantity = (+stock.pickup_quantity <= +stock.approved_quantity) ? stock.pickup_quantity : null;
  }
  clearQuantity(stock: any, isBlur: boolean) {
    if (isBlur) {
      setTimeout(() => {
        stock.pickup_quantity = (stock.pickup_quantity === '') ? 0 : stock.pickup_quantity;
      }, 0);
    } else {
      stock.pickup_quantity = (+stock.pickup_quantity === 0) ? '' : +stock.pickup_quantity;
    }
  }
  clearRequestStocks() {
    this.requestOutletStocksData = [];
  }
  getRequestOutletStocksdetails(data :any) {
    this.showLoading();
    this.currentStock = data;
    this.detailSubmit = true;
    this.total = 0;
    this.recipeService.getRequestOutletStocksdetails({
      id: data.id,
      isLocationStocks: true
    })
    .subscribe((response: any) => {
        if (response.data) {
          this.isRecipeDisplay = (response.data.request_outlet_details && response.data.request_outlet_details.length > 0 && response.data.request_outlet_details[0].receipe_id > 0);
          response.data.request_outlet_details.forEach((element: any) => {
            element.pickup_quantity = +element.approved_quantity;
            element.total = (+element.pickup_quantity * element.price);
            this.total = this.total + element.total;
          });
          this.requestOutletStocksdetails = response.data;

        } else {
          this.requestOutletStocksdetails = null;
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  cancelStocksDetails() {
    this.requestOutletStocksdetails = null;
    this.detailSubmit = false;
    this.isSubmitted = false;
  }
  rejectStocksDetails() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to reject this request!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Reject it!'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.rejectConfirm();
      }
    });
  }
  rejectConfirm() {
    this.showLoading();
    this.recipeService.rejectRequestOutletStocks({
      id: this.requestOutletStocksdetails.id
    })
    .subscribe((response: any) => {
        this.clearLoading();
        Swal.fire("Saved", response.status, "success");
        this.cancelStocksDetails();
        this.getRecords();
      },
      (err: any) => {
        this.networkIssue();
     });
    this.requestOutletStocksdetails.id
  }
  removeRecipe(indexOfelement: any) {
    this.requestOutletStocks.details.splice(indexOfelement, 1);
  }
  add() {
    this.isSubmitted = false;
    this.isAdd = true;
    this.isSearch = false;
    this.requestOutletStocks = {
      id: "",
      driver_name: '',
      driver_mobile: '',
      delivery_date: '',
      details: [{
        product_id: null,
        receipe_id: null,
        unit_name: '',
        requested_quantity: '',
        approved_quantity: '',
        pickup_quantity: '',
        parent_quantity: ''
      }]
    };
    if (this.sessionLocationId !== 0) {
      let e : any = {
        value: {
          id: this.sessionLocationId
        }
      };
      this.fromLocationSelectionChanged(e);
    }
  }
  cancel(cancelConfirm: any): void {
    if (cancelConfirm) {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
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
    this.isSubmitted = false;
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.products = [];
    this.requestOutletStocks.driver_name = '';
    this.requestOutletStocks.driver_mobile = '';
  //  this.requestOutletStocks.location_id = '';
    //this.requestOutletStocks.from_location_id = '';
    //this.requestOutletStocks.delivery_date = '';
    //this.from_loc = '';
   // this.to_loc = '';
    this.requestOutletStocks.details = [{
      product_id: null,
      receipe_id: null,
      unit_name: '',
      requested_quantity: '',
      approved_quantity: '',
      pickup_quantity: '',
      parent_quantity: ''
    }];
    this.sortBy = 'delivery_date';
    this.sortOrder = 'DESC';
    this.getLocations();
    this.getLocationsAll();
  }
  onKeyDownEvent(e: any) {
    if (this.isSearch) {
      this.search(false);
    }
  }
  search(isReset: boolean) {
    this.currentPage = 1;
    if (isReset) {
      this.cancel(false);
    }
    this.showLoading();
    this.getRecords();
  }
  locationSelectionChanged(e: any) {
    if (e && e.value && e.value.id) {
      this.requestOutletStocks.location_id = e.value.id;
    } else {
      this.requestOutletStocks.location_id = null;
    }
  }
  fromLocationSelectionChanged(e: any) {
    if (e && e.value && e.value.id) {
      this.requestOutletStocks.from_location_id = e.value.id;
      let location = this.locations.find((e: any) => (this.requestOutletStocks.from_location_id === e.id));
      this.isRecipeDisplay = location.is_receipe ? true : false;
      this.products = location.products;
    } else {
      this.requestOutletStocks.from_location_id = null;
    }
    this.requestOutletStocks.details = [{
      product_id: null,
      receipe_id: null,
      unit_name: '',
      requested_quantity: '',
      approved_quantity: '',
      pickup_quantity: '',
      parent_quantity: ''
    }];
  }
}
