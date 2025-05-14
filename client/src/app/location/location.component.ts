import { filter } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './location.component.html'
})
export class LocationComponent extends BaseComponent implements OnInit {
  isSearch: boolean = true;
  isAdd: boolean = false;
  isEdit: boolean = false;
  units: any = [];
  locations: any = [];
  brands: any = [];
  name: any = '';
  code: any = '';
  is_central_stores: any = '';
  billing_name: any = '';
  address: any = '';
  phone_no: any = '';
  gstin: any = '';
  fssai_no: any = '';
  message: any = '';
  table_count: any = '';
  is_kitchen: any = false;
  enable_edit: any = false;
  is_dotepe: any = false;
  is_approve_greater_stocks: any = false;
  id: any = '';
  lastPage: any;
  page: any;
  currentPage: any = 1;
  sortBy: any = 'name';
  sortOrder: any = 'ASC';
  central_store: any = 'all';
  centrals: any = [{
    name: 'All',
    value: 'all'
  },{
    name: 'No',
    value: false
  },{
    name: 'Yes',
    value: true
  }];
  order_cutt_off_days: any = '';
  order_cutt_off_time: any = '';
  paymentModes: any = [];
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.getRecords(null);
    this.getPaymentModes();
  }
  toggleCheck() {
    setTimeout(() => {
      if (!(this.is_kitchen || this.is_central_stores)) {
        this.order_cutt_off_days = '';
        this.order_cutt_off_time = '';
      }
    }, 0);
  }
  getPaymentModes() {
    this.paymentModes = [];
    this.recipeService.getPaymentModes().subscribe(
      (response: any) => {
        if (response.data && response.data.length > 0) {
          response.data = response.data.filter((e: any) => e.is_online === 1);
          response.data.forEach((element: any) => {
            element.checked = false;
          });
          this.paymentModes = response.data;
        } else {
          this.paymentModes = [];
        }
      },
      () => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Internal Server Error",
        });
      }
    );
  }
  add() {
    this.isAdd = true;
    this.isSearch = false;
    this.name = '';
    this.code = '';
    this.is_central_stores = false;
    this.billing_name = '';
    this.table_count = '';
    this.address = '';
    this.phone_no = '';
    this.gstin = '';
    this.fssai_no = '';
    this.message = '';
    this.order_cutt_off_days = '';
    this.order_cutt_off_time = '';
    this.is_kitchen = false;
    this.is_dotepe = false;
    this.is_approve_greater_stocks = false;
  }
  edit(location: any): void {
    this.isAdd = false;
    this.isEdit = true;
    this.isSearch = false;
    this.id = location.id;
    this.name = location.name;
    this.table_count = location.table_count;
    this.code = location.code;
    this.billing_name = location.billing_name;
    this.address = location.address;
    this.phone_no = location.phone_no;
    this.gstin = location.gstin;
    this.fssai_no = location.fssai_no;
    this.message = location.message;
    this.is_central_stores = location.is_central_stores;
    this.is_kitchen = location.is_kitchen;
    this.order_cutt_off_days = location.order_cutt_off_days;
    this.order_cutt_off_time = location.order_cutt_off_time;
    this.enable_edit = location.enable_edit;
    this.is_dotepe = location.is_dotepe;
    this.is_approve_greater_stocks = location.is_approve_greater_stocks;
    let requestLocations = location.request_locations;
    this.paymentModes.forEach((e: any) => {
      e.checked = false;
      e.start_time = '';
      e.end_time = '';
      e.execution_time = '';
      e.request_id = '';
      e.request_status = '';
    });
    if (requestLocations && requestLocations.length > 0) {
      let ids: any = [];
      requestLocations.forEach((element: any) => {
        ids.push(element.to_location_id);
      });
      this.locations.forEach((element: any) => {
        element.checked = ids.includes(element.id);
      });
    } else {
      this.locations.forEach((element: any) => {
        element.checked = false;
      });
    }
    this.scrollTop();
  }
  dotepeSync(location: any) {
    this.recipeService.dotPeCategorySyn(
      {
        location_id: location.id,
      }
    )
    .subscribe(
      (response: any) => {
      },
      (err: any) => {
        this.networkIssue();
      }
    );
    Swal.fire(
      'dotepeSync',
      'Your dotepe Sync Location has been triggered.',
      'success'
    );
  }
  requestLocations(location: any) {
    this.recipeService.requestLocations(
        {
          id: location.id,
        }
      )
      .subscribe(
        (response: any) => {
          location.request_locations = response.data;
          this.edit(location);
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  cancel(): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.id = '';
    this.name = '';
    this.code = '';
    this.table_count = '';
    this.is_central_stores = false;
    this.is_kitchen = false;
    this.billing_name = '';
    this.address = '';
    this.phone_no = '';
    this.gstin = '';
    this.fssai_no = '';
    this.message = '';
    this.enable_edit = false;
    this.order_cutt_off_days = '';
    this.order_cutt_off_time = '';
    this.is_dotepe = false;
    this.is_approve_greater_stocks = false;
    this.sortBy = 'name';
    this.sortOrder = 'ASC';
    this.locations.forEach((element: any) => {
      element.checked = false;
    });
  }
  onKeyDownEvent(e: any) {
    if (this.isSearch) {
      this.search(false);
    }
  }
  search(isReset: boolean) {
    if (isReset) {
      this.cancel();
    }
    this.showLoading();
    this.getRecords(this.name ? this.name : null);
  }
  submit(id: any) {
    if (id || (this.name && this.code)) {
      if (id) {
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
            this.saveDetails(id);
          }
        })
      } else {
        this.saveDetails(id);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill the required fields'
      });
    }
  }
  sorting(sort: any) {
    this.sortOrder = (this.sortBy === sort) ? ((this.sortOrder === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords(this.name ? this.name : null);
  }
  setPagination(currentPage : any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords(this.name ? this.name : null);
  }
  getRecords(q: any) {
    this.recipeService.getLocations({
        name: this.name,
        code: this.code,
        central_store: this.central_store,
        is_kitchen: this.is_kitchen,
        q: 'all',
        sort_by: this.sortBy,
        sort_order: this.sortOrder
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.locations = response.data;
            this.page = response.data.current_page;
            this.lastPage = response.data.total;
          } else {
            this.locations = [];
            this.page = 0;
            this.lastPage = 0;
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  saveDetails(id: any) {
    let toLocationIds: any = [];
    this.locations.forEach((element: any) => {
      if (element.checked === true) {
        toLocationIds.push(element.id);
      }
    });
    let payModes: any = [];
    if (this.is_dotepe) {
      this.paymentModes.forEach((ele: any) => {
        if (ele.checked) {
          payModes.push(ele.id);
        }
      });
      if (payModes.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please choose any one Dotepe Mode'
        });
        return;
      }
    }
    this.showLoading();
      this.recipeService.saveLocation({
          id: id ? id : this.id,
          name: this.name,
          code: this.code,
          is_dotepe: this.is_dotepe,
          is_approve_greater_stocks: this.is_approve_greater_stocks,
          is_central_stores: this.is_central_stores,
          is_kitchen: this.is_kitchen,
          enable_edit: this.enable_edit,
          billing_name: this.billing_name,
          table_count: this.table_count,
          address: this.address,
          phone_no: this.phone_no,
          gstin: this.gstin,
          fssai_no: this.fssai_no,
          message: this.message,
          toLocationIds: toLocationIds,
          payModes: payModes,
          order_cutt_off_days: this.order_cutt_off_days ? this.order_cutt_off_days : null,
          order_cutt_off_time: this.order_cutt_off_time ? this.order_cutt_off_time : null,
          is_active: id ? false : true
        })
        .subscribe((response: any) => {
          this.clearLoading();
          if (id) {
            Swal.fire(
              'Deleted!',
              'Your Location has been deleted.',
              'success'
            );
          } else {
            Swal.fire(
              'Saved',
              'Your Location has been saved.',
              'success'
            );
          }
          this.cancel();
          this.getRecords(null);
        },
        (err: any) => {
          this.networkIssue();
       });
  }
}
