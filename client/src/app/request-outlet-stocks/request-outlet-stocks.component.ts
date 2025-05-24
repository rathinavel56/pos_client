import { filter } from 'rxjs/operators';
import { Component, OnInit } from "@angular/core";
import { TableUtil } from './../shared/util/tableUtil';
import { RecipeService } from "../shared/service/recipe.service";
import { BaseComponent } from "../base.component";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import * as XLSX from "xlsx";
import { SessionStorageService } from "./../shared/util/sessionStorage.service";


@Component({
  templateUrl: "./request-outlet-stocks.component.html",
})
export class RequestOutletStocksComponent
  extends BaseComponent
  implements OnInit
{
  requestUpload: any;
  isPreview: boolean = false;
  locations: any = [];
  locationsAll: any = [];
  location_id: any = null;
  config: any;
  isShowLocation: any;
  lastPage: any;
  page: any;
  currentPage: any = 1;
  sortBy: any = "created_at";
  sortOrder: any = "ASC";
  order_status_id: any = 1;
  status: any = [];
  requestOutletStocks: any = [];
  products: any = [];
  productsRef: any = [];
  requestOutletStocksdetails: any;
  from_loc: any = "";
  to_loc: any = "";
  isSubmitted: any = false;
  isAdd: boolean = false;
  isEdit: boolean = false;
  isSearch: boolean = true;
  sessionLocationId: any = 0;
  currentStock: any = "";
  total: any = 0;
  requestOutletStocksData: any = [];
  recipes: any = [];
  isRecipeDisplay: boolean = false;
  approximate_total_price: number = 0;
  isChildOutletDisplay: boolean = false;
  modalReference: any;
  location: any;
  stocks: any;
  locationssources: any;
  isLocationLoading: boolean = true;
  isPickupCompleted: boolean = false;
  selectedCategories: any = [];
  categoryLoading: any = false;
  productCategories: any = [];
  receipeCategories: any = [];
  childCategories: any = [];
  userDetail:any;
  isKitchen:any =false;
  constructor(
    public recipeService: RecipeService,
    public router: Router,
    private modalService: NgbModal,
    public sessionStorageService: SessionStorageService
  ) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.recipeForStockRequest();
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
    this.userDetail = sessionStorage.getItem("retail_pos")
      ? JSON.parse(sessionStorage.getItem("retail_pos") || "{}")
      : null;
    if (this.userDetail) {
      this.isShowLocation = this.userDetail.session_detail.location_id == 0;
      if (this.isShowLocation) {
        this.getLocationsAll();
      } else {
        this.getLocationsAll();
        this.getMyLocationDetail();
      }
      this.isKitchen = (this.userDetail.session_detail.location?.is_kitchen === 1);
    }
    this.requestOutletStocks = {
      id: "",
      driver_name: "",
      driver_mobile: "",
      delivery_date: "",
      request_notes: "",
      from_location_id: "",
      location_id: "",
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
    this.getLocations();
    if (this.sessionStorageService.stocksData && this.sessionStorageService.stocksData.title) {
      this.orderStatus(true);
    } else {
      this.orderStatus();
      this.getRecords();
    }
  }
  orderStatus(isRefresh?: any) {
    this.recipeService.orderStatus()
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
         this.status = response.data;
         this.status[1].name = 'Approved/Partially Approved';
         this.status.splice(2, 1);
         this.status.push({
          id: -1,
          name: 'Wastage Summary'
         });
        } else {
          this.status = [];
        }
        if (isRefresh) {
          this.order_status_id = this.status.find((e: any) => e.name.includes(this.sessionStorageService.stocksData.title)).id;
          this.sessionStorageService.stocksData = '';
          this.getRecords();
        }
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  getMyLocationDetail() {
    this.recipeService
      .getMyLocationDetail()
      .subscribe(
        (response: any) => {
          if (response.data) {
            this.location = response.data;
          } else {
            this.location = null;
          }
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  getLocations() {
    this.recipeService
      .getLocations(
        {
          q: "centralstocks",
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
  requestLocations(e: any) {
    this.isLocationLoading = true;
    this.recipeService.requestLocations(
        {
          id: (e && e.value) ? e.value.id : this.userDetail.session_detail.location_id,
        }
      )
      .subscribe(
        (response: any) => {
          if (e && e.value) {
            e.value.request_locations = response.data;
            this.locationSelectionChanged(e);
          } else if (e === null) {
            response.data.forEach((element: any) => {
              this.locationssources.push(this.locationsAll.find((le: any) => (le.id === element.to_location_id)));
            });
            this.isLocationLoading = false;
            this.checkOldRequestNotAccepted(false);
          }
        },
        (err: any) => {
          this.networkIssue();
        }
      );
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
            this.locationssources = [];
            if (!this.isShowLocation) {
              let locd = this.locationsAll.find((e: any) => e.id === this.userDetail.session_detail.location_id);
              if (locd.request_locations && locd.request_locations.length > 0) {
                locd.request_locations.forEach((element: any) => {
                  this.locationssources.push(this.locationsAll.find((le: any) => (le.id === element.to_location_id)));
                });
              }
            }
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
      .getRequestOutletStocks({
          delivery_date: this.requestOutletStocks.delivery_date ? this.requestOutletStocks.delivery_date : null,
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
      (!this.isRecipeDisplay || this.isChildOutletDisplay) &&
      detail.requested_quantity &&
      detail.requested_quantity > detail.parent_quantity
    ) {
      detail.requested_quantity = null;
    }
  }
  acceptCheck(stock: any) {
    if (stock.accepted_quantity && +stock.accepted_quantity > +stock.approved_quantity) {
      stock.accepted_quantity = null;
    }
  }
  submit(id: any) {
    this.isSubmitted = true;
    if (this.isDataVaild()) {
      this.saveDetails(id);
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill the required fields",
      });
    }
  }
  saveDetails(id: any) {
    this.requestOutletStocks.details = [];
    let recs = this.stocks.filter((e: any) => (e.requested_quantity && +e.requested_quantity > 0));
    recs.forEach((element: any) => {
      this.requestOutletStocks.details.push({
        product_id: element.product_id ? element.product_id : null,
        receipe_id: element.receipe_id ? element.receipe_id : null,
        unit_size: element.unit_size,
        requested_quantity: element.requested_quantity
      });
    });
    this.showLoading();
    this.recipeService
      .saveRequestOutletStocks(this.requestOutletStocks)
      .subscribe(
        (response: any) => {
          this.clearLoading();
          if (response && response.status === "success") {
            this.requestOutletStocks.from_location_id = '';
            this.requestOutletStocks.location_id = '';
            this.requestOutletStocks.order_status_id = 1;
            Swal.fire("Saved", "Your Request is sent for approval.", "success");
            this.getRecords();
            this.cancel(false);
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
  selectionProductChanged(e: any, indexOfelement: any) {
    if (e && e.value && e.value.id) {
      this.requestOutletStocks.details[indexOfelement].product_id = e.value.id;
      this.requestOutletStocks.details[indexOfelement].receipe_id = null;
      this.requestOutletStocks.details[indexOfelement].unit_name =
        e.value.unit.name;
      this.requestOutletStocks.details[indexOfelement].parent_quantity =
        e.value.parent_quantity;
      this.requestOutletStocks.details[indexOfelement].requested_quantity = "";
      this.requestOutletStocks.details[indexOfelement].unit_size =
        e.value.unit_size;
    } else {
      this.requestOutletStocks.details[indexOfelement].product_id = null;
      this.requestOutletStocks.details[indexOfelement].receipe_id = null;
      this.requestOutletStocks.details[indexOfelement].unit_name = null;
      this.requestOutletStocks.details[indexOfelement].unit_size = null;
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
      this.requestOutletStocks.details[indexOfelement].unit_size = 0;
      this.requestOutletStocks.details[indexOfelement].parent_quantity =
        e.value.parent_quantity;
      this.requestOutletStocks.details[indexOfelement].requested_quantity = "";
    } else {
      this.requestOutletStocks.details[indexOfelement].product_id = null;
      this.requestOutletStocks.details[indexOfelement].receipe_id = null;
      this.requestOutletStocks.details[indexOfelement].unit_size = null;
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
  getRequestOutletStocksdetails(data: any) {
    this.showLoading();
    this.currentStock = data;
    this.total = 0;
    this.recipeService
      .getRequestOutletStocksdetails({
        id: data.id,
      })
      .subscribe(
        (response: any) => {
          if (response.data) {
            this.requestOutletStocksdetails = response.data;
            if (this.requestOutletStocksdetails.order_status_id === 7) {
              this.requestOutletStocksdetails.request_outlet_details.forEach((element: any) => {
                element.accepted_quantity = (+element.pickup_quantity - +element.wastage_quantity);
                element.total = (element.accepted_quantity * element.price);
                this.total = this.total + element.total;
              });
            } else {
              this.requestOutletStocksdetails.request_outlet_details.forEach((element: any) => {
                element.accepted_quantity = (+element.pickup_quantity - +element.wastage_quantity);
                element.price = element.receipe ? ((element.receipe.price.length > 0) ? element.receipe.price[0].selling_price : 0) : ((element.product.price.length > 0) ? element.product.price[0].selling_price : element.product.purchase_price);
                element.total = (element.requested_quantity * element.price);
                this.total = this.total + element.total;
              });
            }
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
  cancelStocksDetails() {
    this.requestOutletStocksdetails = null;
  }
  removeRecipe(indexOfelement: any) {
    this.requestOutletStocks.details.splice(indexOfelement, 1);
  }
  reqStock(isCheck: any) {
    if (!this.isShowLocation && this.locationssources.length === 0) {
      this.requestLocations(null);
    } else {
      this.checkOldRequestNotAccepted(isCheck);
    }
  }
  checkOldRequestNotAccepted(isCheck: any) {
    if (!this.isShowLocation && this.locationssources.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Request Admin to add Locations our you.",
      });
      return;
    }
    this.isPickupCompleted = false;
    if (!isCheck && this.isShowLocation) {
      this.add();
    } else {
      this.showLoading();
      this.recipeService
        .checkOldRequestNotAccepted({
            location_id: this.requestOutletStocks.location_id
          })
        .subscribe(
          (response: any) => {
            this.clearLoading();
            if (response.count && +response.count > 1) {
              let toLocationName: string = this.to_loc ? this.to_loc.name.toString() : this.location.name;
              this.requestOutletStocks.location_id = '';
              this.to_loc = '';
              if (this.products && this.products.length > 0) {
                this.products.forEach((element: any) => {
                  element.requested_quantity = null;
                });
              }
              if (this.stocks && this.stocks.length > 0) {
                this.stocks.forEach((element: any) => {
                  element.requested_quantity = null;
                });
              }
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Already You have pending " + response.count + " pickup request to accept" + (this.isShowLocation ? (" in " + toLocationName) : "") + " . Kindly accept the pick up proceed futher.",
              });
            } else {
              this.add();
            }
          },
          (err: any) => {
            this.networkIssue();
          }
        );
    }
  }
  add() {
    this.isPickupCompleted = true;
    this.isSubmitted = false;
    this.isAdd = true;
    this.isSearch = false;
    let from_location_id = this.requestOutletStocks.from_location_id ? this.requestOutletStocks.from_location_id : '';
    let location_id = this.requestOutletStocks.location_id ? this.requestOutletStocks.location_id : '';
    this.requestOutletStocks = {
      id: "",
      driver_name: "",
      driver_mobile: "",
      delivery_date: "",
      request_notes: "",
      from_location_id: from_location_id,
      location_id: location_id,
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
        text: "You want to cancel!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes",
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
    this.requestOutletStocks.driver_name = "";
    this.requestOutletStocks.driver_mobile = "";
    this.requestOutletStocks.request_notes = "";
    this.requestOutletStocks.location_id = "";
    this.requestOutletStocks.from_location_id = "";
    this.requestOutletStocks.delivery_date = "";
    this.from_loc = "";
    this.to_loc = "";
    this.recipes.forEach((e: any) => {
      e.requested_quantity = '';
    });
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
  isDataVaild() {
    let stocks = this.stocks.filter((e: any) => (e.requested_quantity && +e.requested_quantity > 0));
    return (
      this.requestOutletStocks.from_location_id &&
      (!this.isShowLocation ||
        (this.isShowLocation && this.requestOutletStocks.location_id)) &&
      this.requestOutletStocks.from_location_id !==
        this.requestOutletStocks.location_id &&
      this.requestOutletStocks.delivery_date &&
      stocks.length > 0
    );
  }
  locationSelectionChangedRequest(e: any) {
    if(this.isAdd) {
      this.requestLocations(e);
    } else {
      this.locationSelectionChanged(e);
    }
  }
  locationSelectionChanged(e: any) {
    if (this.isAdd && (e.value && (!e.value.request_locations || e.value.request_locations.length === 0))) {
      this.requestOutletStocks.location_id = null;
      this.to_loc = null;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Request Admin to add Locations our you.",
      });
      return;
    }
    if (this.isAdd) {
      this.locationssources = [];
      e.value.request_locations.forEach((element: any) => {
        this.locationssources.push(this.locationsAll.find((le: any) => (le.id === element.to_location_id)));
      });
    }
    if (e && e.value && e.value.id) {
      if (e.value.id === this.requestOutletStocks.from_location_id) {
        this.requestOutletStocks.location_id = '';
        this.to_loc = '';
        return;
      }
      this.requestOutletStocks.location_id = e.value.id;
      if (this.isAdd || this.isEdit) {
        this.checkOldRequestNotAccepted(true);
      }
    } else {
      this.requestOutletStocks.location_id = null;
    }
    this.locationCheck();
  }
  clearQuantity(stock: any, isBlur: boolean) {
    if (isBlur) {
      setTimeout(() => {
        stock.accepted_quantity = (stock.accepted_quantity === '') ? 0 : stock.accepted_quantity;
      }, 0);
    } else {
      stock.accepted_quantity = (+stock.accepted_quantity === 0) ? '' : +stock.accepted_quantity;
    }
  }
  acceptRequestOutletStock() {
    let stocks = this.requestOutletStocksdetails.request_outlet_details.filter((e: any) => +e.accepted_quantity < 0).length;
    if (stocks > 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: 'Please Fill all accepted quantity'
      });
    }
    let wasteCount = this.requestOutletStocksdetails.request_outlet_details.filter((e: any) => +e.pickup_quantity !== +e.accepted_quantity).length;
    if (wasteCount > 0) {
      Swal.fire({
        title: "Notes For Wastage",
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
              resolve("Please Enter Notes");
            }
          });
        },
        allowOutsideClick: () => false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.acceptRequestOutletStockSubmit(result.value);
        }
      });
    } else {
      this.acceptRequestOutletStockSubmit('');
    }
  }
  acceptRequestOutletStockSubmit(notes: any) {
    this.showLoading();
    this.recipeService.acceptRequestOutletStock({
      id: this.requestOutletStocksdetails.id,
      location_id: this.requestOutletStocksdetails.location_id,
      details: this.requestOutletStocksdetails.request_outlet_details,
      accepted_notes: notes
    }).subscribe({
      next: (response: any) => {
        if (response && response.status === "success") {
          Swal.fire("Saved", response.message, "success");
          this.cancelStocksDetails();
          this.getRecords();
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: response.message
          });
        }
        this.clearLoading();
      },
      error: () => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Internal Server Error",
        });
      },
    });
  }
  filterItems() {
    this.categoryLoading = true;
    this.dataTableShowAll();
  }
  fromLocationSelectionChanged(e: any) {
    this.selectedCategories = [];
    this.childCategories = [];
    this.stocks = [];
    if (!this.isShowLocation) {
      this.requestOutletStocks.location_id = this.userDetail.session_detail.location.id;
      if (e.value.id === this.requestOutletStocks.location_id) {
        this.requestOutletStocks.from_location_id = '';
        this.from_loc = '';
        return;
      }
    }
    if (this.isAdd || this.isEdit) {
      let isKitchen = e.value.is_kitchen;
      if (e && e.value && e.value.id) {
        if (e.value.id === this.requestOutletStocks.location_id) {
          this.requestOutletStocks.location_id = '';
          this.to_loc = '';
          return;
        }
        this.categoryLoading = true;
        this.requestOutletStocks.from_location_id = e.value.id;
        if (isKitchen === 1) {
          this.recipes.forEach((e: any) => {
            e.requested_quantity = '';
            e.receipe_id = e.id;
            e.unit_size = 1;
          });
          this.stocks = JSON.parse(JSON.stringify(this.recipes));
        }
        this.childCategories = [];
        this.showLoading();
        this.recipeService
          .getStocksOutlets({
            location_id: this.requestOutletStocks.from_location_id,
            q: 'all',
            is_close_stock: false
          })
          .subscribe(
            (response: any) => {
              if (response.data && response.data.length > 0) {
                response.data.forEach((e: any) => {
                    if (e.product) {
                      e.product.requested_quantity = '';
                      e.product.unit_size = e.unit_size;
                      e.product.product_id = e.product.id;
                      e.product.parent_quantity = e.quantity;
                      this.stocks.push(e.product);
                    } else if (e.receipe) {
                      if (isKitchen === 0 || (isKitchen === 1 && e.unit_size != 1)) {
                        e.receipe.requested_quantity = '';
                        e.receipe.unit_size = e.unit_size;
                        e.receipe.receipe_id = e.receipe.id;
                        e.receipe.parent_quantity = e.quantity;
                        this.stocks.push(e.receipe);
                      } else {
                        let stockIndex: any = this.stocks.findIndex((ele: any) => (ele.receipe_id === e.receipe.id && ele.unit_size === e.unit_size));
                        if (stockIndex != -1) {
                          this.stocks[stockIndex].parent_quantity = e.quantity;
                        }
                      }
                    }
                });
              }
              this.stocks.forEach((element: any) => {
                element.requested_quantity = '';
                if (this.childCategories.findIndex((e: any) => (e.id === element.category.id)) === -1) {
                  this.childCategories.push(element.category);
                }
              });
              setTimeout(() => {
                this.categoryLoading = false;
                this.clearLoading();
              }, 1000);
            });
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
        }
      ];
    } else {
      this.requestOutletStocks.from_location_id = e.value ? e.value.id : '';
    }
    this.locationCheck();
  }
  locationCheck() {
    if (this.requestOutletStocks.from_location_id > 0 && this.requestOutletStocks.location_id > 0 && this.requestOutletStocks.from_location_id === this.requestOutletStocks.location_id) {
      this.to_loc = null;
      this.requestOutletStocks.location_id = null;
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Source and Destination location should not be same",
      });
    } else {
      this.isLocationLoading = false;
    }
  }
  checkProductQuantity(product: any) {
    // if (product.product_id && +product.requested_quantity > +product.parent_quantity) {
    //   product.requested_quantity = '';
    //   Swal.fire({
    //     icon: "error",
    //     title: "Oops...",
    //     text: "Request quantity can't greater than actual stocks",
    //   });
    // }
  }
  recipeForStockRequest() {
    this.recipeService.recipeForStockRequest({
      stock: true
    }).subscribe({
      next: (response: any) => {
        this.recipes = [];
        this.receipeCategories = [];
        this.childCategories = [];
        if (response.data && response.data.length > 0) {
          response.data.forEach((element: any) => {
            element.unit_size = 1;
            element.gstPercentage = (element.price && element.price.length > 0) ? (+element.price[0].selling_SGST_percentage + +element.price[0].selling_CGST_percentage + +element.price[0].selling_IGST_percentage + +element.price[0].selling_cess_percentage) : 0;
            if (this.receipeCategories.findIndex((e: any) => (e.id === element.category.id)) === -1) {
              this.receipeCategories.push(element.category);
            }
          });
          this.recipes = response.data;
        }
      },
      error: () => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Internal Server Error",
        });
      },
    });
  }
  export() {
    let dataTableSelect: any = document.querySelector('#import_length select');
    let ogValue: any = dataTableSelect.value;
    dataTableSelect.value = -1;
    dataTableSelect.dispatchEvent(new Event("change"));
    setTimeout(() => {
      TableUtil.exportTableToExcel("import", "import", true);
      setTimeout(() => {
        dataTableSelect.value = ogValue;
        dataTableSelect.dispatchEvent(new Event("change"));
      }, 1000);
    }, 1000);
  }
  dataTableShowAll() {
    this.showLoading();
    let dataTableSelect: any = document.querySelector('#import_length select');
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
  clearRequestStocks() {
   this.requestOutletStocksData = [];
  }
  cancelPop() {
    this.isPreview = false;
    if (this.modalReference) {
      this.modalReference.close();
    }
  }
  checkDateGreaterThanToday() {
    if (this.location && (this.location.order_cutt_off_days || this.location.order_cutt_off_time) && (this.isAdd || this.isEdit)) {
      let today = new Date();
      // if (this.location.order_cutt_off_time) {
      //   let ordeCuttOffTime = this.location.order_cutt_off_time.split(':');
      //   today.setHours(ordeCuttOffTime[0],ordeCuttOffTime[1],ordeCuttOffTime[2],0);
      // }
      today.setHours(0,0,0,0);
      if (this.location.order_cutt_off_days)  {
        today.setDate(today.getDate() + this.location.order_cutt_off_days);
      }
      let deliveryDate = new Date(this.requestOutletStocks.delivery_date);
      // deliveryDate.setHours(0,0,0,0);
      if(deliveryDate <= today) {
        this.requestOutletStocks.delivery_date = '';
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Delivery Date should be greater than today",
        });
      }
    }
  }
  openPop(content: any) {
    this.modalReference = this.modalService.open(content);
    let popUp = document.querySelector('.modal-dialog');
    if (popUp) {
      popUp.classList.remove('modal-dialog');
    }
    setTimeout(() => {
      let previewCount = document.querySelectorAll('.preview-count');
      previewCount.forEach((e, i) => {
        e.innerHTML = (i+1).toString();
      });
      this.calculatePrice();
    }, 0);
    this.modalReference.result.then(() => {
    });
  }
  calculatePrice() {
    this.stocks.forEach((stock: any) => {
      if (+stock.requested_quantity > 0) {
        stock.total_price = ((stock.price && stock.price.length > 0) ? ((+stock.price[0].selling_price * +stock.requested_quantity)) : (stock.purchase_price * +stock.requested_quantity));
      } else {
        stock.total_price = 0;
      }
    });
    this.approximate_total_price = this.stocks.reduce(
      (accumulator: any, recipe: any) =>
        accumulator + recipe.total_price,
      0
    );
  }
  onFileChange(ev: any) {
    let workBook: any = null;
    let jsonData: any = null;
    const reader: any = new FileReader();
    const file: any = ev.target.files[0];
    reader.onload = (event: any) => {
      const data: any = reader.result;
      workBook = XLSX.read(data, { type: "binary" });
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet: any = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      if (Object.values(jsonData) && Object.values(jsonData)[0]) {
        let errorNames: any = [];
        let jsonSheetData: any = Object.values(jsonData)[0];
        jsonSheetData = jsonSheetData.filter((pr: any) => (pr['Request Quantity'] && +pr['Request Quantity'] > 0));
        if (jsonSheetData && jsonSheetData.length > 0) {
            this.stocks.forEach((element: any) => {
              element.requested_quantity = "";
            });
            jsonSheetData.forEach((element: any) => {
              let title = element['Recipe'] ? element['Recipe'] : (element['Product'] ? element['Product'] : element['Title']);
                let stockIndex: any = this.stocks.findIndex(
                  (e: any) =>
                    e.name.replace(/\s/g, "").toLowerCase() ===
                    title.replace(/\s/g, "").toLowerCase());
                  if (stockIndex != -1) {
                    this.stocks[stockIndex].requested_quantity = element['Request Quantity'].toString().trim();
                  } else {
                    errorNames.push(title);
                  }
            });
            if (errorNames && errorNames.length > 0) {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Invalid : " + errorNames.toString(),
              });
            } else {
              Swal.fire("Import", "Completed", "success");
            }
          } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "No Valid Records",
              });
          }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "No Records",
        });
      }
      this.requestUpload = "";
    };
    reader.readAsBinaryString(file);
  }
  checkQuantity(stock: any) {
    if (+stock.accepted_quantity > stock.pickup_quantity) {
      stock.accepted_quantity = +stock.pickup_quantity;
    }
  }
}
