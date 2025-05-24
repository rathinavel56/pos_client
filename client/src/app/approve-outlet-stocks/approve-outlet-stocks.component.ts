import { Component, OnInit } from "@angular/core";
import { RecipeService } from "../shared/service/recipe.service";
import { BaseComponent } from "../base.component";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { SessionStorageService } from "./../shared/util/sessionStorage.service";


@Component({
  templateUrl: "./approve-outlet-stocks.component.html",
})
export class ApproveOutletStocksComponent
  extends BaseComponent
  implements OnInit
{
  locations: any = [];
  locationsAll: any = [];
  location_id: any = null;
  config: any;
  isShowLocation: any;
  lastPage: any;
  page: any;
  currentPage: any = 1;
  sortBy: any = "id";
  sortOrder: any = "ASC";
  order_status_id: any = 1;
  status: any = [];
  requestOutletStocks: any = [];
  products: any = [];
  requestOutletStocksdetails: any;
  from_loc: any = "";
  to_loc: any = "";
  isSubmitted: any = false;
  isAdd: boolean = false;
  isEdit: boolean = false;
  isSearch: boolean = true;
  sessionLocationId: any = 0;
  currentStock: any = "";
  requestOutletStocksData: any = [];
  isRecipeDisplay: boolean = false;
  approvedRequest: boolean = false;
  detailSubmit: boolean = false;
  isLocationLoading = true;
  total: any = 0;
  constructor(
    public recipeService: RecipeService,
    public router: Router,
    public sessionStorageService: SessionStorageService
  ) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.config = {
      displayKey: "name",
      search: true,
      height: "auto",
      placeholder: "Search",
      customComparator: () => {},
      moreText: "more",
      noResultsFound: "No results found!",
      searchPlaceholder: "Search",
      searchOnKey: "name",
    };
    let userDetail: any = sessionStorage.getItem("retail_pos")
      ? JSON.parse(sessionStorage.getItem("retail_pos") || "{}")
      : null;
    if (userDetail) {
      this.isShowLocation = userDetail.session_detail.location_id == 0;
      this.getLocationsAll();
    }
    this.requestOutletStocks = {
      id: "",
      driver_name: "",
      driver_mobile: "",
      delivery_date: "",
      details: [
        {
          product_id: null,
          receipe_id: null,
          unit_name: "",
          requested_quantity: "",
          parent_quantity: "",
        },
      ],
    };
    this.showLoading();
    if (
      this.sessionStorageService.stocksData &&
      this.sessionStorageService.stocksData.title
    ) {
      this.orderStatus(true);
    } else {
      this.orderStatus();
      this.getRecords();
    }
    this.getLocations();
  }
  orderStatus(isRefresh?: any) {
    this.recipeService.orderStatus().subscribe(
      (response: any) => {
        if (response.data && response.data.length > 0) {
          this.status = response.data;
          this.status[1].name = "Approved/Partially Approved";
          this.status.splice(2, 1);
          this.status.push({
            id: -1,
            name: "Wastage Summary",
          });
        } else {
          this.status = [];
        }
        if (isRefresh) {
          this.order_status_id = this.status.find((e: any) =>
            e.name.includes(this.sessionStorageService.stocksData.title)
          ).id;
          this.sessionStorageService.stocksData = "";
          this.getRecords();
        }
      },
      (err: any) => {
        this.networkIssue();
      }
    );
  }
  clearRequestStocks() {
    this.requestOutletStocksData = [];
  }
  getLocations() {
    this.recipeService
      .getLocations(
        {
          q: "centralstocks_with_receipe",
        },
        null
      )
      .subscribe(
        (response: any) => {
          if (response.data && response.data.length > 0) {
            this.locations = response.data;
          } else {
            this.locations = [];
          }
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  approveAll(e: any) {
    this.requestOutletStocksdetails.request_outlet_details.forEach(
      (element: any) => {
        element.isChecked = e.currentTarget.checked;
      }
    );
  }
  checkApproveAll() {
    this.approvedRequest =
      this.requestOutletStocksdetails.request_outlet_details.find(
        (element: any) => !element.isChecked
      )
        ? true
        : false;
  }
  getLocationsAll() {
    this.isLocationLoading = true;
    this.recipeService
      .getLocations(
        {
          q: "all",
        },
        null
      )
      .subscribe(
        (response: any) => {
          if (response.data && response.data.length > 0) {
            this.locationsAll = response.data;
          } else {
            this.locationsAll = [];
          }
          this.isLocationLoading = false;
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  getRecords() {
    this.recipeService
      .getRequestOutletStocks(
        {
          delivery_date: this.requestOutletStocks.delivery_date
            ? this.requestOutletStocks.delivery_date
            : null,
          id: this.requestOutletStocks.id,
          from_location_id: this.requestOutletStocks.from_location_id,
          location_id: this.requestOutletStocks.location_id,
          order_status_id: this.order_status_id,
          sort_by: this.sortBy,
          sort_order: this.sortOrder,
        },
        this.currentPage
      )
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
            icon: "error",
            title: "Oops...",
            text: "Internal Server Error",
          });
        },
      });
  }
  setPagination(currentPage: any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords();
  }
  quantityCheck(detail: any, indexOfelement: any) {
    if (
      !this.isRecipeDisplay &&
      detail.requested_quantity &&
      detail.requested_quantity > detail.parent_quantity
    ) {
      this.requestOutletStocks.details[indexOfelement].requested_quantity =
        null;
    }
  }
  submit(id: any) {
    this.saveDetails();
  }
  saveDetails() {
    // let stockZero =
    //   this.requestOutletStocksdetails.request_outlet_details.filter(
    //     (e: any) =>
    //       +e.original_quantity <= 0 &&
    //       e.product_id &&
    //       +e.approved_quantity !== 0
    //   );
    // if (stockZero && stockZero.length > 0) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Oops...",
    //     timer: 2000,
    //     text:
    //       stockZero.length +
    //       " In Stocks are zero please add stocks to it for further approve",
    //   });
    // } else {
      let stockGreater =
        this.requestOutletStocksdetails.request_outlet_details.filter(
          (e: any) => +e.approved_quantity > +e.requested_quantity
        );
      if (stockGreater && stockGreater.length > 0) {
        Swal.fire({
          title: "Are you sure?",
          text: "Some of the approved items are greater than requested quantity.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, Continue!",
        }).then((result: any) => {
          if (result.isConfirmed) {
            this.addNotes();
          }
        });
      } else {
        this.addNotes();
      }
    // }
  }
  addNotes() {
    // Swal.fire({
    //   title: "Please enter notes for approval",
    //   input: "text",
    //   inputAttributes: {
    //     autocapitalize: "off",
    //   },
    //   showCancelButton: true,
    //   confirmButtonText: "Submit",
    //   showLoaderOnConfirm: true,
    //   inputValidator: (value) => {
    //     return new Promise((resolve) => {
    //       if (value && value.trim() !== "") {
    //         resolve(null);
    //       } else {
    //         resolve("Please enter notes for approval");
    //       }
    //     });
    //   },
    //   allowOutsideClick: () => false,
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //this.saveApprove(result.value);
    //   }
    // });
    this.saveApprove();
  }
  saveApprove(notes?: any) {
    if (!this.isSubmitted) {
      this.isSubmitted = true;
      this.showLoading();
      let request_outlet_details: any = [];
      let products: any = [];
      this.requestOutletStocksdetails.request_outlet_details.forEach(
        (e: any) => {
          request_outlet_details.push({
            id: e.id,
            product_id: e.product_id,
            receipe_id: e.receipe_id,
            approved_quantity: +e.approved_quantity,
            original_quantity: e.original_quantity,
            unit_size: e.unit_size,
            status: e.status,
          });
          if (e.product_id) {
            products.push(e.product_id);
          }
        }
      );
      this.recipeService
        .saveApproveRequestOutletStocks({
          id: this.requestOutletStocksdetails.id,
          request_outlet_details: request_outlet_details,
          products: products,
          delivery_approved_date: this.currentStock.delivery_approved_date,
          approved_notes: notes,
        })
        .subscribe(
          (response: any) => {
            this.isSubmitted = false;
            this.clearLoading();
            if (response && response.status === "success") {
              Swal.fire(
                "Saved",
                "Your Approved Stocks has been saved.",
                "success"
              );
              this.getRecords();
              this.cancel(false);
              this.cancelStocksDetails(false);
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Internal Server Error",
              });
            }
          },
          (err: any) => {
            this.networkIssue();
          }
        );
    }
  }
  selectionProductChanged(e: any, indexOfelement: any) {
    if (e && e.value && e.value.id) {
      this.requestOutletStocks.details[indexOfelement].product_id = e.value.id;
      this.requestOutletStocks.details[indexOfelement].receipe_id = null;
      this.requestOutletStocks.details[indexOfelement].unit_name =
        e.value.unit.name;
      this.requestOutletStocks.details[indexOfelement].parent_quantity =
        e.value.parent_quantity;
      this.requestOutletStocks.details[indexOfelement].requested_quantity = "";
    } else {
      this.requestOutletStocks.details[indexOfelement].product_id = null;
      this.requestOutletStocks.details[indexOfelement].receipe_id = null;
      this.requestOutletStocks.details[indexOfelement].unit_name = null;
      this.requestOutletStocks.details[indexOfelement].parent_quantity = null;
      this.requestOutletStocks.details[indexOfelement].requested_quantity = "";
    }
  }
  selectionRecipeChanged(e: any, indexOfelement: any) {
    if (e && e.value && e.value.id) {
      this.requestOutletStocks.details[indexOfelement].product_id = null;
      this.requestOutletStocks.details[indexOfelement].receipe_id = e.value.id;
      this.requestOutletStocks.details[indexOfelement].unit_name =
        e.value.unit.name;
      this.requestOutletStocks.details[indexOfelement].parent_quantity =
        e.value.parent_quantity;
      this.requestOutletStocks.details[indexOfelement].requested_quantity = "";
    } else {
      this.requestOutletStocks.details[indexOfelement].product_id = null;
      this.requestOutletStocks.details[indexOfelement].receipe_id = null;
      this.requestOutletStocks.details[indexOfelement].unit_name = null;
      this.requestOutletStocks.details[indexOfelement].parent_quantity = null;
      this.requestOutletStocks.details[indexOfelement].requested_quantity = "";
    }
  }
  sorting(sort: any) {
    this.sortOrder =
      this.sortBy === sort
        ? this.sortOrder === "ASC"
          ? "DESC"
          : "ASC"
        : "ASC";
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords();
  }
  checkQuantity(stock: any) {

    if (stock.product) {
      stock.approved_quantity = (stock.original_quantity > 0 && (+stock.approved_quantity <= stock.original_quantity)) ? stock.approved_quantity : null;
    }
    if (stock.approved_quantity) {
      stock.isChecked = true;
      stock.status = 3;
      if (this.requestOutletStocksdetails.from_location.is_approve_greater_stocks !== 1 && +stock.approved_quantity > +stock.requested_quantity) {
        stock.approved_quantity = stock.requested_quantity;
      }
      // if (+stock.approved_quantity >= stock.requested_quantity) {
      //   stock.status = 2;
      // } else {
      //   stock.status = 3;
      // }
    } else {
      if (this.requestOutletStocksdetails.from_location.is_approve_greater_stocks !== 1) {
        stock.approved_quantity =
          stock.requested_quantity > stock.original_quantity
            ? stock.original_quantity
            : stock.requested_quantity;
      }
      stock.status = this.status.find((e: any) => e.id === 1).id;
      stock.isChecked = false;
    }
    stock.total = +stock.approved_quantity * +stock.price;
    this.total = 0;
    this.requestOutletStocksdetails.request_outlet_details.forEach(
      (element: any) => {
        this.total = this.total + element.total;
      }
    );
    this.checkApproveAll();
  }

  getRequestOutletStocksdetails(data: any) {
    this.showLoading();
    this.currentStock = data;
    this.detailSubmit = true;
    this.total = 0;
    this.recipeService
      .getRequestOutletStocksdetails({
        id: data.id,
        isLocationStocks: true,
      })
      .subscribe(
        (response: any) => {
          if (response.data) {
            if (!response.data.delivery_approved_date) {
              this.currentStock.delivery_approved_date =
                response.data.delivery_date;
            }
            this.total = 0;
            this.isRecipeDisplay =
              response.data.request_outlet_details &&
              response.data.request_outlet_details.length > 0 &&
              response.data.request_outlet_details[0].receipe_id > 0;
            if (response.data.order_status_id === 1) {
              response.data.request_outlet_details.forEach((element: any) => {
                element.isChecked = false;
                element.approved_quantity = element.requested_quantity;
                let originalStock = response.outlet_stocks.find(
                  (e: any) =>
                    e.product_id === element.product_id && e.receipe_id === element.receipe_id &&
                    e.unit_size === element.unit_size
                );
                let sourceStock = response.sourceOutletStocks.find(
                  (e: any) =>
                    e.product_id === element.product_id && e.receipe_id === element.receipe_id &&
                    e.unit_size === element.unit_size
                );
                if (sourceStock) {
                  element.source_quantity = (sourceStock && sourceStock.quantity) ? sourceStock.quantity : 0;
                }
                if (originalStock) {
                  element.original_quantity = originalStock.quantity;
                  // element.approved_quantity =
                  //   element.requested_quantity > element.original_quantity
                  //     ? element.original_quantity
                  //     : element.requested_quantity;
                  element.approved_quantity = +element.requested_quantity;
                  element.isDiabled = false;
                } else if (!this.isRecipeDisplay) {
                  element.original_quantity = 0;
                  element.isDiabled = false;
                  element.status = 5;
                } else if (this.isRecipeDisplay) {
                  element.status = 1;
                }
                element.price = element.receipe
                  ? element.receipe.price.length > 0
                    ? element.receipe.price[0].selling_price
                    : 0
                  : element.product.price.length > 0
                  ? element.product.price[0].selling_price
                  : element.product.purchase_price;
                element.total = element.approved_quantity * element.price;
                this.total = this.total + element.total;
              });
            }
            this.requestOutletStocksdetails = response.data;
          } else {
            this.requestOutletStocksdetails = null;
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  calculateTotal() {
    this.total = 0;
    this.requestOutletStocksdetails.request_outlet_details.forEach(
      (element: any) => {
        this.total = this.total + element.approved_quantity * element.price;
      }
    );
  }
  cancelStocksDetails(isNotReset?: any) {
    this.requestOutletStocksdetails = null;
    this.detailSubmit = false;
    this.isSubmitted = false;
  }
  rejectStocksDetails() {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to reject this request!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Reject it!",
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.rejectConfirm();
      }
    });
  }
  rejectConfirm() {
    this.showLoading();
    this.recipeService
      .rejectRequestOutletStocks({
        id: this.requestOutletStocksdetails.id,
      })
      .subscribe(
        (response: any) => {
          this.clearLoading();
          Swal.fire("Saved", response.status, "success");
          this.cancelStocksDetails(false);
          this.getRecords();
        },
        (err: any) => {
          this.networkIssue();
        }
      );
    this.requestOutletStocksdetails.id;
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
      driver_name: "",
      driver_mobile: "",
      delivery_date: "",
      details: [
        {
          product_id: null,
          receipe_id: null,
          unit_name: "",
          requested_quantity: "",
          parent_quantity: "",
        },
      ],
    };
    if (this.sessionLocationId !== 0) {
      let e: any = {
        value: {
          id: this.sessionLocationId,
        },
      };
      this.fromLocationSelectionChanged(e);
    }
  }
  cancel(cancelConfirm: any): void {
    if (cancelConfirm) {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
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
    this.requestOutletStocks.driver_name = "";
    this.requestOutletStocks.driver_mobile = "";
    // this.requestOutletStocks.location_id = "";
    // this.requestOutletStocks.from_location_id = "";
    // this.requestOutletStocks.delivery_date = "";
    // this.from_loc = "";
    // this.to_loc = "";
    this.requestOutletStocks.details = [
      {
        product_id: null,
        receipe_id: null,
        unit_name: "",
        parent_quantity: "",
        requested_quantity: "",
      },
    ];
    this.sortBy = "delivery_date";
    this.sortOrder = "DESC";
    this.getLocations();
    this.getLocationsAll();
  }
  addstocks() {
    this.requestOutletStocks.details.push({
      product_id: null,
      receipe_id: null,
      unit_name: "",
      requested_quantity: "",
      parent_quantity: "",
    });
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
      let location = this.locations.find(
        (e: any) => this.requestOutletStocks.from_location_id === e.id
      );
      this.isRecipeDisplay = location.is_receipe ? true : false;
      this.products = location.products;
    } else {
      this.requestOutletStocks.from_location_id = null;
    }
    this.requestOutletStocks.details = [
      {
        product_id: null,
        receipe_id: null,
        unit_name: "",
        requested_quantity: "",
        parent_quantity: "",
      },
    ];
  }
}
