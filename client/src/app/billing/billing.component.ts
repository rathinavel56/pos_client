import { Component, OnInit } from "@angular/core";
import { RecipeService } from "../shared/service/recipe.service";
import { BaseComponent } from "../base.component";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
@Component({
  templateUrl: "./billing.component.html",
})
export class BillingComponent extends BaseComponent implements OnInit {
  submitted: boolean = false;
  intialForm: boolean = false;
  isLogin: boolean = false;
  isSearch: boolean = true;
  isNotes: boolean = false;
  isCategory: boolean = false;
  isPayment: boolean = false;
  notes: string = "";
  searchOrder: string = "";
  categories: any = [];
  currentCategories: any = [];
  currentCategoriesOg: any = [];
  selectCategory: any = null;
  selcat: any = null;
  order: any = null;
  customerRes: any = null;
  closeResult: string | undefined;
  selectedStock: any;
  tables: any = [];
  posDetails: any = [
    {
      id: null,
      name: "",
      price: null,
    },
  ];
  name: any = "";
  config: any;
  currentSelectedStock: any;
  carts: any = [];
  modalReference: any;
  isPrintMode: boolean = false;
  isShowLocation: any;
  locations: any;
  selectedLocation: any = "";
  isSubmitted: any = false;
  stocks: any = [];
  total: any = 0;
  totalQty: any = 0;
  ogBillTotal: any = 0;
  billTotal: any = 0;
  billTotalRound: any = 0;
  billAdvanceAmt: any = 0;
  billTotaldue: any = 0;
  SGST_amount: any = 0;
  CGST_amount: any = 0;
  IGST_amount: any = 0;
  cess_amount: any = 0;
  discount_points: any = 0;
  net_total_amount: any = 0;
  discount_mloyal_amount: any = 0;
  discount_amount: any = 0;
  discount_percentage: any = 0;
  virtual_discount_percentage: any = 0;
  isCart: any = false;
  addons: any = [];
  addonDetails: any = [];
  addonDetailData: any = [];
  customer: any = "";
  reference_no: any = "";
  invoice_no: any = "";
  invoice_date: any = "";
  parcel_charge: any = "";
  selected_payment_mode: any;
  payment_mode_id: any;
  payment_mode_name: any;
  paymentModes: any = [];
  paymentModesOg: any = [];
  selectedOrderDetails: any;
  isStart: any = true;
  isCustomer: any = false;
  bill_id: any = { id: 1, name: "New Bill" };
  bills: any = [
    { id: 1, name: "New Bill" },
    { id: 2, name: "Existing Bill" },
    // { id: 3, name: "Hold Bill" },
    { id: 4, name: "Closing Stocks" },
  ];
  customerdetail: any = {
    customer_name: "",
    customer_email: "",
    customer_city: "",
    customer_dob: "",
    customer_gender: "",
    customer_address: ""
  };
  mobile: any = "";
  taxs: any = [];
  hostName: any = "";
  userDetail: any;
  kitchenPrintData: any;
  categoriesWithDemcialStep: any = [];
  table_id: any = '';
  billingItems: any = [];
  dotPePendingOrders: any = [];
  lastDotPePendingOrderId: any = null;
  sessionId: any = '';
  private subscription: any;
  constructor(
    public recipeService: RecipeService,
    public router: Router,
    private modalService: NgbModal
  ) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.getBillingItems();
    this.hostName =
      window.location.hostname !== "localhost"
        ? "http://" + window.location.hostname
        : "http://localhost:9000";
    this.config = {
      displayKey: "name",
      search: true,
      height: "auto",
      placeholder: "Search",
      customComparator: () => { },
      moreText: "more",
      noResultsFound: "No results found!",
      searchPlaceholder: "Search",
      searchOnKey: "name",
    };
    this.getCategoriesWithDemcialStep();
    this.userDetail = sessionStorage.getItem("retail_pos")
      ? JSON.parse(sessionStorage.getItem("retail_pos") || "{}")
      : null;
    if (this.userDetail) {
      this.isShowLocation = this.userDetail.session_detail.location_id == 0;
    }
    this.tables = [];
    if (this.isShowLocation) {
      this.getLocations();
    } else {
      this.selectedLocation = this.userDetail.session_detail.location;
      if (+this.selectedLocation.table_count > 0) {
        this.tables.push({
          name: 'Select Table',
          value: ''
        });
        for (let x = 1; x <= +this.selectedLocation.table_count; x++) {
          this.tables.push({
            name: 'Table ' + x,
            value: x
          });
        }
      }
      this.getPaymentModes();
    }
  }
  getBillingItems() {
    this.recipeService.getBillingItems().subscribe(
      (response: any) => {
        this.billingItems = response.data;
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
  table_change() {
    this.clearTableDetails();
    if (this.table_id) {
      this.showLoading();
      this.recipeService.getTableBillDetail({
        table_id: this.table_id,
        location_id: this.selectedLocation.id
      }).subscribe(
        (response: any) => {
          if (response.data && response.data.length > 0) {
            let uniq = '';
            response.data.forEach((element: any) => {
              let stock = this.currentCategories.stocks.find((e: any) => e.product_id === element.product_id && e.receipe_id === element.receipe_id);
              stock.uniq = element.uniq;
              stock.isAddon = (uniq === element.uniq);
              uniq = element.uniq;
              this.addCart(stock, null, element.quantity);
            });
            this.clearLoading();
          } else {
            this.table_id = null;
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "No Records Found",
            });
            this.reset(true, true);
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
  }
  resetPopup() {
    this.isCart = false;
    this.isNotes = false;
    this.isCategory = false;
    this.isPayment = false;
    this.isCustomer = false;
    this.isPrintMode = false;
  }
  clearSelcat() {
    this.selcat = '';
  }
  locationSelectionChanged(e: any) {
    if (e && e.value && e.value.id) {
      this.showBillingScreen();
    }
  }
  chooseCategory(content: any) {
    this.resetPopup();
    this.isCategory = !this.isCategory;
    if (this.isCategory) {
      this.modalReference = this.modalService.open(content);
      this.modalReference.result.then(() => { });
      setTimeout(() => {
        document
          .getElementsByClassName("modal-dialog")[0]
          .setAttribute("class", "max-100");
      }, 0);
    } else {
      document
        .getElementsByClassName("modal-dialog")[0]
        .setAttribute("class", "");
      this.closePopUp();
    }
  }
  showBillingScreen() {
    this.isLogin = false;
    this.showLoading();
    this.recipeService
      .getCheckBilling({
        location_id: this.selectedLocation.id
      })
      .subscribe(
        (res: any) => {
          this.intialForm = true;
          if (res && !res.data) {
            this.clearLoading();
            return;
          }
          this.continueBilling();
        });
  }
  startBilling() {
    this.showLoading();
    this.recipeService
      .startBilling({
        location_id: this.selectedLocation.id
      })
      .subscribe(
        (res: any) => {
          this.intialForm = true;
          if (res && !res.data) {
            this.clearLoading();
            return;
          }
          this.continueBilling();
        });
  }
  continueBilling() {
    this.isLogin = true;
    this.intialForm = true;
    if (
      (!this.isShowLocation ||
        (this.isShowLocation && this.selectedLocation)) &&
      this.bill_id &&
      this.bill_id.id &&
      this.bill_id.id !== 2 &&
      this.bill_id.id !== 4
    ) {
      this.intialForm = false;
      this.tables = [];
      if (+this.selectedLocation.table_count > 0) {
        this.tables.push({
          name: 'Please Select',
          value: ''
        });
        for (let x = 1; x <= +this.selectedLocation.table_count; x++) {
          this.tables.push({
            name: 'Table ' + x,
            value: x
          });
        }
      }
      this.locationStock();
    } else if (this.bill_id.id === 4) {
    } else if (this.bill_id.id === 2 && this.reference_no) {
      this.intialForm = false;
      this.getInvoice();
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill the required fields",
      });
    }
  }
  changePaymentModes(e: any) {
    this.discount_percentage = 0;
    this.discount_amount = 0;
    this.virtual_discount_percentage = (e.virtual_discount_percentage === 1) ? e.max_discount_percentage : 0;
    this.paymentModesOg.forEach((element: any, i: number) => {
      element.selected = false;
    });
    e.selected = true;
    this.selected_payment_mode = e;
    this.populateStocks();
  }
  getPaymentModes() {
    this.recipeService.getPaymentModes().subscribe(
      (response: any) => {
        if (response.data && response.data.length > 0) {
          this.paymentModesOg = response.data;
          this.paymentModesOg.forEach((element: any, i: number) => {
            element.selected = (i === 0);
          });
          this.selected_payment_mode = JSON.parse(
            JSON.stringify(this.paymentModesOg[0])
          );
        } else {
          this.paymentModesOg = [];
        }
        if (!this.isShowLocation) {
          this.showBillingScreen();
        } else {
          this.clearLoading();
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
  checkoutOrder(order: any) {
    order = JSON.parse(order.json);
    let discounts: any = [];
    if (order.discountDetails && order.discountDetails.length > 0) {
      order.discountDetails.forEach((e: any) => {
        discounts.push(e.name);
      });
      order.discounts = discounts.toString();
      order.items.forEach((e: any) => {
        e.isStock = true;
        console.log(this.stocks.filter((se: any) => !se.name));
        let detail = this.stocks.find((se: any) => ((se.name?.toLowerCase() === e.itemName.toLowerCase()) || (se.display_name?.toLowerCase() === e.itemName.toLowerCase())) || ((se.product_pos?.name.toLowerCase() === e.itemName.toLowerCase()) || (e.product_pos?.display_name.toLowerCase() === e.itemName.toLowerCase())));
        if (!detail) {
          e.isStock = false;
          // || (se.product?.name?.toLowerCase() === e.itemName.toLowerCase())
          detail = this.billingItems.find((se: any) => (se.name?.toLowerCase() === e.itemName.toLowerCase()));
          if (!detail) {
            detail = {
              receipe_id: e.itemCode.split('_')[0],
              unit_size: e.itemCode.split('_')[1]
            };
          }
        }
        e.product_id = detail.product_id;
        e.receipe_id = detail.receipe_id ? detail.receipe_id : detail.id;
      });
    }
    this.selectedOrderDetails = order;
  }
  playNotification() {
    let mp3 = '<source src="assets/notification.ogg" type="audio/mpeg">';
    let s: any = document.getElementById("sound");
    s.innerHTML = '<audio autoplay="autoplay">' + mp3 + "</audio>";
    setTimeout(() => {
      s.innerHTML = '';
    }, 3000);
  }
  getCategoriesWithDemcialStep() {
    this.recipeService.getCategoriesWithDemcialStep().subscribe(
      (response: any) => {
        if (response.data && response.data.length > 0) {
          this.categoriesWithDemcialStep = response.data;
        } else {
          this.categoriesWithDemcialStep = [];
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
  bill(e: any) {
    this.reference_no = "";
    this.invoice_no = '';
    this.invoice_date = "";
    if (!e.value.id) {
      this.bill_id = { id: 1, name: "New Bill" };
    }
  }
  getInvoice() {
    this.recipeService
      .getInvoice({
        location_id: this.selectedLocation.id,
        reference_no: this.reference_no,
      })
      .subscribe(
        (response: any) => { },
        () => {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Internal Server Error",
          });
        }
      );
  }
  reset(isPrint?: any, isTable?: any) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.notes = "";
    this.customer = "";
    this.isNotes = false;
    this.isStart = true;
    this.searchOrder = "";
    this.paymentModesOg.forEach((element: any, i: number) => {
      element.selected = false;
    });
    if (!isTable) {
      this.selected_payment_mode = JSON.parse(
        JSON.stringify(this.paymentModesOg[1])
      );
    }
    this.selectCategory = null;
    this.selcat = null;
    if (!isPrint || isPrint === 1) {
      this.intialForm = false;
      this.carts = [];
      this.stocks = [];
      this.categories = [];
      this.tables = [];
      if (this.isShowLocation && this.locations && this.locations.length > 0) {
        this.selectedLocation = this.locations[0];
        if (+this.selectedLocation.table_count > 0) {
          this.tables.push({
            name: 'None',
            value: ''
          });
          for (let x = 1; x <= +this.selectedLocation.table_count; x++) {
            this.tables.push({
              name: 'Table ' + x,
              value: x
            });
          }
        }
      } else if (isPrint === 1) {
        this.locationStock();
      }
    } else {
      this.reference_no = "";
      this.invoice_no = '';
      this.invoice_date = "";
      this.customerdetail = {
        customer_name: "",
        customer_email: "",
        customer_city: "",
        customer_dob: "",
        customer_gender: "",
        customer_address: ""
      };
      this.mobile = "";
      this.locationStock();
    }
    this.submitted = false;
    this.total = 0;
    this.ogBillTotal = 0;
    this.billTotal = 0;
    this.totalQty = 0;
    this.billTotalRound = 0;
    this.billAdvanceAmt = 0;
    this.billTotaldue = 0;
    this.SGST_amount = 0;
    this.CGST_amount = 0;
    this.IGST_amount = 0;
    this.cess_amount = 0;
    this.discount_mloyal_amount = 0;
    this.discount_amount = 0;
    this.discount_percentage = 0;
    this.virtual_discount_percentage = 0;
    this.discount_points = 0;
    this.net_total_amount = 0;
    this.closePopUp();
    this.paymentModesOg[1].selected = true;
    this.payment_mode_name = "";
    this.reference_no = '';
    this.generateUniqSerial();
  }
  clearTableDetails() {
    this.reference_no = "";
    this.invoice_no = '';
    this.invoice_date = "";
    this.customerdetail = {
      customer_name: "",
      customer_email: "",
      customer_city: "",
      customer_dob: "",
      customer_gender: "",
      customer_address: ""
    };
    this.mobile = "";
    this.submitted = false;
    this.total = 0;
    this.ogBillTotal = 0;
    this.billTotal = 0;
    this.totalQty = 0;
    this.billTotalRound = 0;
    this.billAdvanceAmt = 0;
    this.billTotaldue = 0;
    this.SGST_amount = 0;
    this.CGST_amount = 0;
    this.IGST_amount = 0;
    this.cess_amount = 0;
    this.discount_mloyal_amount = 0;
    this.discount_amount = 0;
    this.virtual_discount_percentage = 0;
    this.discount_percentage = 0;
    this.discount_points = 0;
    this.net_total_amount = 0;
    this.closePopUp();
    this.paymentModesOg[1].selected = true;
    this.payment_mode_name = "";
    this.reference_no = '';
  }
  validatePoints() {
    if (+this.discount_mloyal_amount > 0) {
      this.discount_percentage = '';
      this.virtual_discount_percentage = '';
    }
    this.splitDiscountAmount();
    if (+this.discount_mloyal_amount > this.discount_points) {
      this.discount_mloyal_amount = 0;
    } else if (+this.ogBillTotal > 0) {
      let discount = (+this.discount_amount + +this.discount_mloyal_amount);
      if (discount > +this.ogBillTotal) {
        this.discount_amount = 0;
        this.discount_percentage = 0;
        this.discount_mloyal_amount = 0;
        this.virtual_discount_percentage = 0;
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Discount Amount exceeds Bill Amount",
        });
      }
    }
    this.cartTotal();
  }
  validateDiscountPercentage(value: any, keyup: any) {
    if (keyup && +value === 0) {
      return;
    }
    if (+this.discount_percentage > 0 && +this.discount_percentage <= +this.selected_payment_mode.max_discount_percentage) {
      this.discount_amount = ((this.total.toFixed(2) / 100) * this.discount_percentage).toFixed(2);
    } else {
      if (+this.discount_percentage > +this.selected_payment_mode.max_discount_percentage) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Discount Percentage exceeds " + this.selected_payment_mode.max_discount_percentage + '%',
        });
      }
      this.discount_amount = 0;
      this.discount_percentage = 0;
      this.virtual_discount_percentage = 0;
    }
    this.validateDiscountAmount();
  }
  validateVirtualDiscountPercentage(value: any, keyup: any) {
    if (keyup && +value === 0) {
      return;
    }

    if (+this.virtual_discount_percentage > +this.selected_payment_mode.max_discount_percentage) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Discount Percentage exceeds " + this.selected_payment_mode.max_discount_percentage + '%',
      });
      this.virtual_discount_percentage = 0;
    }
  }
  validateDiscountAmount() {
    if (+this.ogBillTotal > 0) {
      let discount = (+this.discount_amount + +this.discount_mloyal_amount);
      if (discount > +this.ogBillTotal) {
        this.discount_amount = 0;
        this.discount_mloyal_amount = 0;
        this.discount_percentage = 0;
        this.virtual_discount_percentage = 0;
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Discount Amount exceeds Bill Amount",
        });
      } else {
        this.splitDiscountAmount();
        this.cartTotal();
      }
    } else if (+this.selected_payment_mode.max_discount_percentage < 100) {
      this.discount_amount = 0;
      this.discount_percentage = 0;
      this.virtual_discount_percentage = 0;
    }
  }
  getLocations() {
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
            this.locations = response.data;
            // if (this.locations && this.locations.length > 0) {
            //   this.selectedLocation = this.locations[0];
            // }
            this.getPaymentModes();
          } else {
            this.locations = [];
          }
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  getMissingOrder() {
    this.showLoading();
    this.recipeService
      .getMissingOrder({
        order_no: this.searchOrder,
      })
      .subscribe(
        (response: any) => {
          if (response.status === 'success') {

            if (!response.message.includes('Order Placed')) {
              this.clearLoading();
              Swal.fire(
                'Saved',
                response.message,
                response.message
              );
            }
          } else {
            this.clearLoading();
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: response.message,
            });
          }
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  locationStock() {
    this.intialForm = true;
    this.showLoading();
    this.recipeService
      .locationStock({
        location_id: this.selectedLocation.id,
        reference_no: this.reference_no,
      })
      .subscribe(
        (response: any) => {
          if (response.data && response.data.length > 0) {
            this.stocks = response.data;
            if (this.stocks.length > 0) {
              this.populateStocks();
              this.isStart = false;
              this.clearLoading();
            } else {
              if (this.isShowLocation) {
                Swal.fire({
                  title: response.message ? response.message : "No Stocks avaiable for sale",
                  showDenyButton: false,
                  showCancelButton: false,
                  confirmButtonText: "cancel",
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.categories = [];
                    this.isStart = true;
                    this.reset(false, false);
                  }
                });
              } else {
                this.categories = [];
                this.isStart = true;
                this.clearLoading();
              }
            }
          } else {
            if (response.message) {
              Swal.fire({
                title: response.message,
                showDenyButton: false,
                showCancelButton: false,
                confirmButtonText: "Proceed",
              }).then((result) => {
                if (result.isConfirmed) {
                  this.isStart = true;
                  this.reset(false, false);
                  this.router.navigate(['/outlet-stocks-close']);
                }
              });
            } else {
              Swal.fire({
                title: "No Stocks avaiable for sale",
                showDenyButton: false,
                showCancelButton: false,
                confirmButtonText: "cancel",
              }).then((result) => {
                if (result.isConfirmed) {
                  this.isStart = true;
                  this.reset(false, false);
                }
              });
            }
          }
        },
        (err: any) => {
          this.isStart = true;
          this.networkIssue();
        }
      );
  }
  populateStocks() {
    this.carts = [];
    this.categories = [];
    if (this.selected_payment_mode.is_online === 0) {
      this.stocks.forEach((e: any) => {
        this.addCat(e);
      });
    } else {
      this.stocks.forEach((e: any) => {
        if (
          (e.product_pos && e.product_pos.is_online_sale === 1) ||
          (e.is_online_sale === 1)
        ) {
          this.addCat(e);
        }
      });
    }
    if (this.categories.length > 0) {
      this.currentCategories.stocks = [];
      let data = JSON.parse(JSON.stringify(this.stocks));
      data =
        this.selected_payment_mode.is_online === 0
          ? data.filter(
            (e: any) =>
              (e.product_pos && e.product_pos.prices) ||
              (e.prices)
          ) : data.filter(
            (e: any) =>
              (e.product_pos && e.product_pos.prices && e.product_pos.is_online_sale === 1) ||
              (e.prices && e.is_online_sale === 1)
          );
      if (data && data.length > 0) {
        data.forEach((ele: any) => {
          let priceDetails: any;
          if (+this.selected_payment_mode.max_discount_percentage === 100) {
            priceDetails = ele.product_pos ? ele.product_pos.prices.find((e: any) => e.location_id === this.selectedLocation.id && e.payment_mode_id === this.selected_payment_mode.id) : ele.prices.find((e: any) => (e.location_id === this.selectedLocation.id));
          } else {
            priceDetails = ele.product_pos ? ele.product_pos.prices.find((e: any) => e.location_id === this.selectedLocation.id && e.payment_mode_id === this.selected_payment_mode.id) : ele.prices.find((e: any) => (e.location_id === this.selectedLocation.id && e.payment_mode_id === this.selected_payment_mode.id));
          }
          if (!priceDetails) {
            if (ele.product_pos) {
              priceDetails = ele.product_pos.prices.find((e: any) => ((this.selectedLocation.id && e.payment_mode_id === this.selected_payment_mode.id && e.location_id === 0)));
            } else {
              priceDetails = ele.prices.find((e: any) => ((this.selectedLocation.id && e.payment_mode_id === this.selected_payment_mode.id && e.location_id === 0)));
            }
          }
          if (!priceDetails) {
            if (ele.product_pos) {
              priceDetails = ele.product_pos.prices.find((e: any) => ((e.location_id === this.selectedLocation.id && e.payment_mode_id === 1) || (e.payment_mode_id === 1)));
            } else {
              let anyLocationPrice = ele.prices.filter((e: any) => (e.location_id === 0));
              priceDetails = (anyLocationPrice.length > 0) ? ele.prices.find((e: any) => ((e.location_id === this.selectedLocation.id && e.payment_mode_id === 1) || (e.payment_mode_id === 1))) : false;
            }
          }
          if (priceDetails) {
            if (ele.product_pos) {
              this.currentCategories.stocks.push({
                name: ele.product_pos.name,
                receipe_id: null,
                product_id: ele.product_id,
                unit: ele.product_pos.unit ? ele.product_pos.unit.name : '',
                quantity: ele.quantity,
                added_quantity: 1,
                category_id: ele.product_pos.category.id,
                unit_size: ele.unit_size,
                hsn_code: ele.product_pos.hsn_code,
                price: priceDetails.selling_price,
                addon: ele.product_pos.addon,
                selling_CGST_percentage: priceDetails.selling_CGST_percentage ? priceDetails.selling_CGST_percentage : 0,
                selling_IGST_percentage: priceDetails.selling_IGST_percentage ? priceDetails.selling_IGST_percentage : 0,
                selling_SGST_percentage: priceDetails.selling_SGST_percentage ? priceDetails.selling_SGST_percentage : 0,
                selling_cess_percentage: priceDetails.selling_cess_percentage
                  ? priceDetails.selling_cess_percentage
                  : 0,
                total: priceDetails.selling_price,
                display_price: (
                  priceDetails.selling_price +
                  ((priceDetails.selling_CGST_percentage +
                    priceDetails.selling_IGST_percentage +
                    priceDetails.selling_SGST_percentage +
                    priceDetails.selling_cess_percentage) /
                    100) *
                  priceDetails.selling_price
                ).toFixed(2),
                purchase_price: ele.product_pos.purchase_price,
              });
            } else {
              this.currentCategories.stocks.push({
                name: ele.name,
                receipe_id: ele.id,
                debit_receipe_id: ele.debit_receipe_id,
                parent_recipe_quantity: ele.parent_recipe_quantity,
                yield: ele.yield,
                product_id: null,
                unit: ele.unit.name,
                unit_size: ele.unit_size,
                quantity: ele.quantity,
                added_quantity: 1,
                category_id: ele.category.id,
                hsn_code: ele.hsn_code,
                price: priceDetails.selling_price,
                addon: ele.addon,
                selling_CGST_percentage: priceDetails.selling_CGST_percentage ? priceDetails.selling_CGST_percentage : 0,
                selling_IGST_percentage: priceDetails.selling_IGST_percentage ? priceDetails.selling_IGST_percentage : 0,
                selling_SGST_percentage: priceDetails.selling_SGST_percentage ? priceDetails.selling_SGST_percentage : 0,
                selling_cess_percentage: priceDetails.selling_cess_percentage
                  ? priceDetails.selling_cess_percentage
                  : 0,
                total: priceDetails.selling_price,
                display_price: (
                  priceDetails.selling_price +
                  ((priceDetails.selling_CGST_percentage +
                    priceDetails.selling_IGST_percentage +
                    priceDetails.selling_SGST_percentage +
                    priceDetails.selling_cess_percentage) /
                    100) *
                  priceDetails.selling_price
                ).toFixed(2),
                purchase_price: ele.purchase_price,
              });
            }
          }
        });
        if (this.categories.length > 0) {
          this.categories.sort((a: any, b: any) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          );
          this.categories.forEach((ele: any) => {
            ele.count = this.currentCategories.stocks.filter((e: any) => (ele.id === e.category_id && e.product_id !== null)).length + this.currentCategories.stocks.filter((e: any) => (ele.id === e.category_id && e.id !== null)).length;
          });
          this.categories = this.categories.filter((e: any) => e.count > 0);
          this.categories.unshift({
            id: "",
            name: "All",
            selected: true,
            count: this.currentCategories.stocks.filter((e: any) => e.product_id !== null).length + this.currentCategories.stocks.filter((e: any) => e.id !== null).length,
          });
          this.currentCategories.stocks.sort((a: any, b: any) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          );
          this.currentCategoriesOg.stocks = JSON.parse(
            JSON.stringify(this.currentCategories.stocks)
          );
          if (+this.selected_payment_mode.max_discount_percentage === 100) {
            this.discount_percentage = parseInt(this.selected_payment_mode.max_discount_percentage);
          }
        } else {
          this.emptyCat();
        }
      } else {
        this.emptyCat();
      }
    } else {
      this.emptyCat();
    }
    this.splitDiscountAmount();
    this.cartTotal();
  }
  emptyCat() {
    this.categories = [
      {
        id: 0,
        name: "All",
        selected: true,
        count: 0,
      },
    ];
    this.currentCategories.stocks = [];
    this.currentCategoriesOg.stocks = [];
  }
  addCat(e: any) {
    if (e.product_pos) {
      let index: any = this.categories.findIndex(
        (ele: any) => ele.id === e.product_pos.category.id
      );
      if (index > -1) {
        this.categories[index].count = ++this.categories[index].count;
      } else {
        this.categories.push({
          id: e.product_pos.category.id,
          name: e.product_pos.category.name,
          count: 1,
        });
      }
    } else {
      let pos = e.receipe_pos ? e.receipe_pos : e;
      let index: any = this.categories.findIndex(
        (ele: any) => ele.id === pos.category.id
      );
      if (index > -1) {
        this.categories[index].count = ++this.categories[index].count;
      } else {
        this.categories.push({
          id: pos.category.id,
          name: pos.category.name,
          count: 1,
        });
      }
    }
  }
  cartTotal() {
    if (!this.discount_amount) {
      this.discount_amount = 0;
      if (+this.selected_payment_mode.max_discount_percentage < 100 && !this.selected_payment_mode.virtual_discount_percentage) {
        this.discount_percentage = 0;
        this.virtual_discount_percentage = 0;
      }
    }
    if (!this.discount_mloyal_amount) {
      this.discount_mloyal_amount = 0;
    }
    this.taxs = [];
    this.total = this.carts.reduce(
      (accumulator: any, current: any) =>
        accumulator + parseFloat(current.total),
      0
    );
    this.totalQty = this.carts.reduce(
      (accumulator: any, current: any) =>
        accumulator + parseFloat(current.added_quantity),
      0
    );
    if (this.total > 0) {
      if (+this.discount_percentage === 100 || +this.virtual_discount_percentage === 100) {
        this.total = 0;
      }
      this.SGST_amount = 0;
      this.CGST_amount = 0;
      this.IGST_amount = 0;
      this.cess_amount = 0;
      let taxExisting: any;
      this.carts.forEach((e: any) => {
        e.bill_percentage = +(((e.total_net_price / this.net_total_amount) * 100).toFixed(2));
        if (this.total === 0) {
          e.total = 0;
        }
      });
      this.carts.forEach((e: any) => {
        e.CGST = 0;
        e.SGST = 0;
        e.IGST = 0;
        e.cess = 0;
        e.price = +e.price.toFixed(2);
        if (+this.discount_percentage > 0 && +this.discount_mloyal_amount <= 0) {
          e.discount_percentage = +this.discount_percentage;
          e.discount_amount = (((e.price * e.added_quantity) / 100) * +this.discount_percentage);
          e.net_price = +((+e.price - (e.discount_amount / e.added_quantity)).toFixed(2));
          e.total_net_price = (e.net_price * e.added_quantity);
        } else if (+this.discount_mloyal_amount > 0) {
          e.discount_percentage = +e.bill_percentage.toFixed(2);
          e.discount_amount = (this.discount_mloyal_amount * (+e.bill_percentage.toFixed(2) / 100));
          e.total_net_price = e.total_net_price - e.discount_amount;
          e.net_price = (e.total_net_price / e.added_quantity).toFixed(2);
        } else {
          e.total_net_price = +e.total;
          e.net_price = +e.price;
          e.discount_percentage = 0;
          e.discount_amount = 0;
        }
        if (e.selling_CGST_percentage > 0) {
          const camount = parseFloat(
            ((e.selling_CGST_percentage / 100) * e.total_net_price).toFixed(2)
          );
          e.CGST = camount;
          this.CGST_amount = camount + this.CGST_amount;
          taxExisting = this.taxs.findIndex(
            (ele: any) =>
              ele.name === "CGST" &&
              ele.percentage === e.selling_CGST_percentage
          );
          if (taxExisting > -1) {
            this.taxs[taxExisting].amount =
              this.taxs[taxExisting].amount + camount;
            this.taxs[taxExisting].withoutTaxAmount =
              this.taxs[taxExisting].withoutTaxAmount + (e.net_price * e.added_quantity);
          } else {
            this.taxs.push({
              name: "CGST",
              hsn: e.hsn_code,
              percentage: e.selling_CGST_percentage,
              withoutTaxAmount: (e.net_price * e.added_quantity),
              amount: camount,
            });
          }
        }
        if (e.selling_SGST_percentage > 0) {
          const samount = parseFloat(
            ((e.selling_SGST_percentage / 100) * e.total_net_price).toFixed(2)
          );
          e.SGST = samount;
          this.SGST_amount = samount + this.SGST_amount;
          taxExisting = this.taxs.findIndex(
            (ele: any) =>
              ele.name === "SGST" &&
              ele.percentage === e.selling_SGST_percentage
          );
          if (taxExisting > -1) {
            this.taxs[taxExisting].amount =
              this.taxs[taxExisting].amount + samount;
            this.taxs[taxExisting].withoutTaxAmount =
              this.taxs[taxExisting].withoutTaxAmount + (e.net_price * e.added_quantity);
          } else {
            this.taxs.push({
              name: "SGST",
              hsn: e.hsn_code,
              percentage: e.selling_SGST_percentage,
              withoutTaxAmount: (e.net_price * e.added_quantity),
              amount: samount,
            });
          }
        }
        if (e.selling_IGST_percentage > 0) {
          const iamount = parseFloat(
            ((e.selling_IGST_percentage / 100) * e.total_net_price).toFixed(2)
          );
          e.IGST = iamount;
          this.IGST_amount = iamount + this.IGST_amount;
          taxExisting = this.taxs.findIndex(
            (ele: any) =>
              ele.name === "IGST" &&
              ele.percentage === e.selling_IGST_percentage
          );
          if (taxExisting > -1) {
            this.taxs[taxExisting].amount =
              this.taxs[taxExisting].amount + iamount;
            this.taxs[taxExisting].withoutTaxAmount =
              this.taxs[taxExisting].withoutTaxAmount + (e.net_price * e.added_quantity);
          } else {
            this.taxs.push({
              name: "IGST",
              hsn: e.hsn_code,
              percentage: e.selling_IGST_percentage,
              withoutTaxAmount: (e.net_price * e.added_quantity),
              amount: iamount,
            });
          }
        }
        if (e.selling_cess_percentage > 0) {
          const ceamount = parseFloat(
            ((e.selling_cess_percentage / 100) * e.total_net_price).toFixed(2)
          );
          e.cess = ceamount;
          this.cess_amount = ceamount + this.cess_amount;
          taxExisting = this.taxs.findIndex(
            (ele: any) =>
              ele.name === "CESS" &&
              ele.percentage === e.selling_cess_percentage
          );
          if (taxExisting > -1) {
            this.taxs[taxExisting].amount =
              this.taxs[taxExisting].amount + ceamount;
            this.taxs[taxExisting].withoutTaxAmount =
              this.taxs[taxExisting].withoutTaxAmount + (e.net_price * e.added_quantity);
          } else {
            this.taxs.push({
              name: "CESS",
              hsn: e.hsn_code,
              percentage: e.selling_cess_percentage,
              withoutTaxAmount: (e.net_price * e.added_quantity),
              amount: ceamount,
            });
          }
        }
      });
      this.discount_amount = this.carts.reduce(
        (accumulator: any, current: any) =>
          accumulator + parseFloat(current.discount_amount),
        0
      );
      let billT =
        this.total +
        +this.SGST_amount +
        +this.CGST_amount +
        +this.IGST_amount +
        +this.cess_amount +
        +this.parcel_charge;
      this.ogBillTotal = billT;
      this.billTotal = billT;
    } else {
      this.billTotalRound = 0;
      this.billAdvanceAmt = 0;
      this.billTotaldue = 0;
      this.SGST_amount = 0;
      this.CGST_amount = 0;
      this.IGST_amount = 0;
      this.cess_amount = 0;
      this.parcel_charge = 0;
      this.total = 0;
      this.totalQty = 0;
      this.billTotal = 0;
      this.ogBillTotal = 0;
      this.reference_no = '';
    }
    this.setBill();
  }
  splitDiscountAmount(isFullDiscount?: boolean) {
    this.net_total_amount = 0;
    this.carts.forEach((e: any) => {
      e.total_net_price = (+e.price * +e.added_quantity);
      this.net_total_amount = this.net_total_amount + e.total_net_price;
    });
    if (+this.discount_mloyal_amount > 0) {
      if ((isFullDiscount || +this.discount_mloyal_amount > this.net_total_amount) && this.discount_points >= this.net_total_amount) {
        this.discount_mloyal_amount = (this.net_total_amount - this.billAdvanceAmt).toFixed(2);
      }
    }
  }
  onFocusDiscount() {
    if (this.discount_amount.toString().length === 1 && this.discount_amount == 0) {
      this.discount_amount = null;
    }
  }
  onFocusDiscountPercentage() {
    if (this.discount_percentage.toString().length === 1 && this.discount_percentage == 0) {
      this.discount_percentage = null;
    }
  }
  onFocusVirtualDiscountPercentage() {
    if (this.virtual_discount_percentage.toString().length === 1 && this.virtual_discount_percentage == 0) {
      this.virtual_discount_percentage = null;
    }
  }
  onFocusParcelCharge() {
    if (this.parcel_charge && this.parcel_charge.toString().length === 1 && this.parcel_charge == 0) {
      this.parcel_charge = null;
    }
  }
  onChangeParcelCharge(value: any, keyup: any) {
    if (keyup && +value === 0) {
      return;
    }
    setTimeout(() => {
      this.cartTotal();
    }, 0);
  }
  onFocusDiscountPoint() {
    if (this.discount_mloyal_amount.toString().length === 1 && this.discount_mloyal_amount == 0) {
      this.discount_mloyal_amount = null;
    }
  }
  setBill() {
    if (+this.discount_mloyal_amount) {
      if (+this.discount_mloyal_amount > this.ogBillTotal) {
        this.discount_mloyal_amount = +this.ogBillTotal.toFixed(2).toString();
        this.billTotal = 0;
        this.discount_amount = 0;
        this.discount_percentage = 0;
      } else if (+this.discount_mloyal_amount > 0) {
        this.billTotal = this.ogBillTotal - (+this.discount_mloyal_amount);
      } else {
        this.billTotal = this.ogBillTotal - (+this.discount_mloyal_amount - +this.discount_amount);
      }
    } else if (+this.ogBillTotal > 0) {
      this.billTotal = this.ogBillTotal - +this.discount_amount;
    }
    this.billTotalRound = Math.round(this.billTotal) - this.billTotal;
    this.billTotaldue = Math.round(this.billTotal);
  }
  getUniqueListBy(arr: any, key: any) {
    return [...new Map(arr.map((item: any) => [item[key], item])).values()];
  }
  validatePhoneNumber() {
    const re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
    return re.test(this.mobile);
  }
  getCustomer(content: any, sendCustomer: boolean = false) {
    this.order = null;
    this.customerRes = null;
    if (this.mobile) {
      if (this.validatePhoneNumber()) {
        this.showLoading();
        this.recipeService
          .getCustomer({
            mobile: this.mobile,
            location_id: this.selectedLocation.id,
            customer_name: sendCustomer
              ? this.customerdetail.customer_name
              : undefined,
            customer_email: sendCustomer
              ? this.customerdetail.customer_email
              : undefined,
            customer_city: sendCustomer
              ? this.customerdetail.customer_city
              : undefined,
            customer_dob: sendCustomer
              ? this.customerdetail.customer_dob
              : undefined,
            customer_gender: sendCustomer
              ? this.customerdetail.customer_gender
              : undefined,
            customer_mobile: sendCustomer
              ? this.customerdetail.mobile
              : undefined,
            customer_address: sendCustomer
              ? this.customerdetail.customer_address
              : undefined,
          })
          .subscribe(
            (response: any) => {
              this.clearLoading();
              if (response.status === "success") {
                this.closePopUp();
                if (response.orders && response.orders.length > 0) {
                  this.orderResponseHandler(content, response);
                } else {
                  this.customerResponseHandler(response);
                }
              } else if (response.status === false) {
                this.resetPopup();
                this.isCustomer = true;
                this.modalReference = this.modalService.open(content);
              } else if (response.error) {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: response.error,
                });
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
      } else {
        this.discount_mloyal_amount = 0;
        this.discount_percentage = 0;
        this.virtual_discount_percentage = 0;
        this.discount_amount = 0;
        this.discount_points = 0;
        this.cartTotal();
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Invalid Customer mobile",
        });
      }
    } else {
      this.discount_mloyal_amount = 0;
      this.discount_amount = 0;
      this.discount_percentage = 0;
      this.virtual_discount_percentage = 0;
      this.discount_points = 0;
      this.cartTotal();
    }
  }
  orderResponseHandler(content: any, response: any) {
    Swal.fire({
      title: "Existing Orders",
      text: "Do you want to proceed",
      icon: "success",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Proceed",
    }).then((result: any) => {
      this.carts = [];
      if (result.isConfirmed) {
        this.customerRes = response;
        this.modalReference = this.modalService.open(content);
        setTimeout(() => {
          document
            .getElementsByClassName("modal-dialog")[0]
            .setAttribute("class", "max-100");
        }, 0);
      } else {
        this.customerResponseHandler(response);
      }
    });
  }
  mainMenu() {
    document.getElementById('main_menu')?.click();
  }
  validateAddOrder() {
    let items: any = [];
    this.reference_no = this.order.order_no;
    this.billAdvanceAmt = +this.order.advance_amount;
    this.order.details.forEach((element: any) => {
      let orderDetails;
      if (element.product_id) {
        orderDetails = this.currentCategoriesOg.stocks.find((e: any) => (e.product_id === element.product_id));
      } else {
        orderDetails = this.currentCategoriesOg.stocks.find((e: any) => (e.receipe_id === element.receipe_id));
      }
      orderDetails = orderDetails ? ((+orderDetails.quantity >= +element.quantity) ? orderDetails : null) : null;
      if (!orderDetails) {
        items.push(element.product ? element.product.name : element.receipe.name);
      }
    });
    if (items && items.length > 0) {
      this.reference_no = '';
      this.billAdvanceAmt = 0;
      this.carts = [];
      this.cartTotal();
      Swal.fire({
        icon: "error",
        title: "Stock Not Available",
        text: "Customer: " + this.customerRes.data.customer_mobile + " Items : " + items.toString()
      });
      return;
    }
    this.customerRes = '';
    this.order.details.forEach((element: any) => {
      let orderDetails;
      if (element.product_id) {
        orderDetails = this.currentCategoriesOg.stocks.find((e: any) => (e.product_id === element.product_id));
      } else {
        orderDetails = this.currentCategoriesOg.stocks.find((e: any) => (e.receipe_id === element.receipe_id));
      }
      orderDetails = orderDetails ? ((+orderDetails.quantity >= +element.quantity) ? orderDetails : null) : null;
      if (!orderDetails) {
        items.push(element.product ? element.product.name : element.receipe.name);
      } else {
        orderDetails.added_quantity = +element.quantity;
        orderDetails.price = +element.selling_price.toFixed(2);
        orderDetails.selling_SGST_percentage = +element.SGST_percentage;
        orderDetails.selling_CGST_percentage = +element.CGST_percentage;
        orderDetails.selling_IGST_percentage = +element.IGST_percentage;
        orderDetails.selling_cess_percentage = +element.cess_percentage;
        orderDetails.total = (orderDetails.added_quantity * orderDetails.price);
        this.priceVariants(null, orderDetails, false);
      }
    });
    this.closePopUp();
    document
      .getElementsByClassName("modal-dialog")[0]
      .setAttribute("class", "");
    if (items.length === 0) {
      this.cartTotal();
      this.customerResponseHandler(this.customerRes);
    } else {
      this.reference_no = '';
      this.billAdvanceAmt = 0;
      this.carts = [];
      this.cartTotal();
      Swal.fire({
        icon: "error",
        title: "Stock Not Available",
        text: "Customer: " + this.customerRes.data.customer_mobile + " Items : " + items.toString()
      });
    }
  }
  customerResponseHandler(response: any) {
    this.customer = response.data;
    this.order = response.order;
    let message = "Customer Name: " + response.data.customer_name + " | Points Balance: " + response.points;
    this.isCustomer = false;
    this.customerdetail = {
      customer_name: "",
      customer_email: "",
      customer_city: "",
      customer_dob: "",
      customer_gender: "",
      customer_address: ""
    };
    this.discount_points = response.points;
    if (+response.points > 0) {
      Swal.fire({
        title: "Existing Customer",
        text: "Customer Name : " + response.data.customer_name + " | Points Balance: " + response.points,
        icon: "success",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Proceed",
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.discount_percentage = 0;
          this.virtual_discount_percentage = 0;
          let totalBill = this.ogBillTotal - this.billAdvanceAmt;
          if (this.discount_points > totalBill) {
            this.discount_mloyal_amount = Math.round(totalBill).toFixed(2);
          } else if (this.ogBillTotal > 0) {
            this.discount_mloyal_amount = response.points.toFixed(2);
          }
          this.splitDiscountAmount(true);
        }
        this.cartTotal();
      });
    } else {
      Swal.fire("Saved", message, "success");
      this.cartTotal();
    }
  }
  saveDetails(isSkipPaymentMode?: any) {
    if (isSkipPaymentMode) {
      this.payment_mode_id = null;
    }
    this.resetPopup();
    if (+this.discount_mloyal_amount > 0) {
      this.validateDiscount();
    } else {
      this.saveInvoiceDetails();
    }
  }

  validateDiscount() {
    this.showLoading();
    this.recipeService
      .getValidateMloyalCustomerPoints({
        customer_mobile: this.mobile,
        customer_points: +this.discount_mloyal_amount,
        location_id: this.selectedLocation.id,
      })
      .subscribe(
        (response: any) => {
          this.clearLoading();
          if (response.success) {
            this.enterOtp();
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: response.message,
            });
          }
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  enterOtp() {
    Swal.fire({
      title: "OTP For Discount Amount",
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
            resolve("Please Enter OTP in Number Format");
          }
        });
      },
      allowOutsideClick: () => false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.saveInvoiceDetails(result.value);
      }
    });
  }
  saveInvoiceDetails(passcode?: any, order?: any) {
    this.showLoading();
    if (+this.virtual_discount_percentage > 0) {
      this.discount_percentage = +this.virtual_discount_percentage;
      this.cartTotal();
    }
    if (!order) {
      order = {
        location_id: this.selectedLocation.id,
        order_type_id: this.selected_payment_mode?.id,
        payment_mode_id: this.payment_mode_id ? this.payment_mode_id : null,
        carts: this.carts,
        parcel_charge: this.parcel_charge ? this.parcel_charge : null,
        customer_id: this.customer ? this.customer.id : null,
        mobile: this.mobile,
        passcode: passcode,
        reference_no: this.reference_no ? this.reference_no : null,
        is_take_away: (this.selected_payment_mode.is_online === 1),
        SGST_amount: +this.SGST_amount,
        CGST_amount: +this.CGST_amount,
        IGST_amount: +this.IGST_amount,
        cess_amount: +this.cess_amount,
        discount_mloyal_amount: +this.discount_mloyal_amount,
        discount_amount: +this.discount_amount,
        discount_percentage: +this.discount_percentage,
        roundoff: this.billTotalRound,
        advance_amount: this.billAdvanceAmt,
        total: +this.billTotaldue,
        table_id: this.table_id
      };
    }
    this.recipeService
      .saveInvoice({
        billing: order
      })
      .subscribe(
        (response: any) => {
          if (+this.virtual_discount_percentage > 0) {
            this.discount_percentage = 0;
            this.cartTotal();
          }
          this.isPrintMode = true;
          this.clearLoading();
          if (response.status === "success") {
            this.invoice_no = response.invoice_no;
            this.invoice_date = response.invoice_datetime;
            if (response.noStocks == true) {
              this.dotPeStockOut();
            }
            Swal.fire({
              title: response.message,
              showDenyButton: true,
              showCancelButton: false,
              confirmButtonText: "Add Notes",
              denyButtonText: "Print Invoice",
              allowOutsideClick: () => false
            }).then((result) => {
              if (result.isConfirmed) {
                this.addnotes();
              } else if (result.isDenied) {
                this.printInvoice();
              }
            });
          } else if (response.error) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: response.error,
            });
            this.resetPopup();
            this.closePopUp();
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Internal Server Error",
            });
            this.closePopUp();
          }
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  closePopUp() {
    if (this.modalReference) {
      this.modalReference.close();
    }
    this.isPrintMode = false;
  }
  notifyMloyal() {
    this.recipeService.notifyMloyal().subscribe(
      (response: any) => { },
      (err: any) => { }
    );
  }
  dotPeStockOut() {
    this.recipeService.dotPeStockOut().subscribe(
      (response: any) => { },
      (err: any) => { }
    );
  }
  addnotes() {
    Swal.fire({
      title: "Add Notes",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Save",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => false
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.showLoading();
        this.recipeService
          .saveInvoice({
            reference_no: this.reference_no ? this.reference_no : null,
            notes: result.value,
          })
          .subscribe(
            (response: any) => {
              this.clearLoading();
              if (response.status === "success") {
                this.printInvoice();
              } else if (response.error) {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: response.error,
                });
                this.closePopUp();
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: "Internal Server Error",
                });
                this.closePopUp();
              }
            },
            (err: any) => {
              this.networkIssue();
            }
          );
      } else {
        this.printInvoice();
      }
    });
  }
  printInvoice() {
    let w: any = window.open();
    let html = $("#print_invoice").html();
    let htmlToPrint =
      "" +
      '<style type="text/css">' +
      "table {" +
      "border-collapse: collapse;" +
      "}</style>";
    w.document.write(htmlToPrint + html); //only part of the page to print, using jquery
    w.document.close(); //this seems to be the thing doing the trick
    this.reset(true, false);
    w.focus();
    w.print();
    w.close();
    this.isPrintMode = false;
  }
  printKitchen() {
    let w: any = window.open();
    let html = $("#print_kitchen_order").html();
    let htmlToPrint =
      "" +
      '<style type="text/css">' +
      "table {" +
      "border-collapse: collapse;" +
      "}</style>";
    w.document.write(htmlToPrint + html); //only part of the page to print, using jquery
    w.document.close(); //this seems to be the thing doing the trick
    this.reset(true, false);
    w.focus();
    w.print();
    w.close();
  }
  selectionChanged(product: any) {
    this.selectCategory =
      !product || (product && product.value.length === 0) ? null : product;
  }
  priceVariants(content: any, stock: any, isAdd: any, parentId?: any) {
    if (isAdd && this.order) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Your are proceeding with Order mode so you can't add items!",
      });
      return;
    }
    this.resetPopup();
    let stockOg: any;
    if (stock) {
      stockOg = JSON.parse(JSON.stringify(stock));
    }
    if (content && stockOg.ingredient_details && stockOg.ingredient_details.length > 0) {
      this.currentSelectedStock = stockOg;
      this.modalReference = this.modalService.open(content);
      this.modalReference.result.then(
        () => {
          this.currentSelectedStock = null;
        },
        () => {
          this.currentSelectedStock = null;
        }
      );
    } else {
      stockOg.uniq = parentId ? parentId : ("cart-" + new Date().getTime());
      this.addCart(stockOg, null, false, parentId);
      setTimeout(() => {
        let objDiv: any = document.querySelector('.' + stockOg.uniq);
        if (objDiv) {
          objDiv.scrollIntoView({
            behavior: "smooth",
          });
          this.setCartTxt(stockOg);
        }
      }, 0);
    }
  }
  changeCategory(category: any) {
    if (category.id) {
      this.currentCategories.stocks = JSON.parse(
        JSON.stringify(
          this.currentCategoriesOg.stocks.filter(
            (e: any) => e.category_id === category.id
          )
        )
      );
    } else {
      this.currentCategories.stocks = JSON.parse(
        JSON.stringify(this.currentCategoriesOg.stocks)
      );
    }
    this.categories.forEach((element: any) => {
      element.selected = false;
    });
    category.selected = true;
    this.isCategory = !this.isCategory;
    this.closePopUp();
  }
  addCart(stock: any, currStock: any, tableQuantity?: any, parentId?: any) {
    let checkCart: any = [];
    if (!parentId) {
      checkCart = this.carts.filter(
        (e: any) =>
          (stock.product_id && e.product_id === stock.product_id) ||
          (stock.receipe_id && e.receipe_id === stock.receipe_id)
      );
    }
    if (checkCart.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "It is already added to cart",
      });
      return;
    } else if (stock.price === 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Price should greater than zero",
      });
      return;
    }
    if (!this.childReceipeCheck(stock.debit_receipe_id, stock.quantity)) {
      return;
    }
    if (stock && !currStock) {
      stock.CGST = +stock.CGST;
      stock.IGST = +stock.IGST;
      stock.SGST = +stock.SGST;
      stock.cess = +stock.cess;
      if (tableQuantity) {
        stock.added_quantity = tableQuantity;
        stock.uniq = "cart-" + new Date().getTime();
      }
      if (stock.parent_recipe_quantity && stock.yield) {
        stock.debit =
          (stock.added_quantity * stock.parent_recipe_quantity) / stock.yield;
      }
      this.carts.push(stock);
    } else {
      this.carts.push({
        name: this.currentSelectedStock.name,
        product_id: this.currentSelectedStock.id,
        hsn_code: "",
        ingredient_detail_id: currStock.id,
        quantity: 1,
        price: currStock.price,
        total: currStock.price,
        unit_size: currStock.unit_size,
      });
    }
    if (tableQuantity) {
      setTimeout(() => {
        if (this.carts && this.carts.length > 0) {
          this.carts.forEach((element: any) => {
            this.setCartTxt(element);
          });
        }
      }, 0);
    }
    this.splitDiscountAmount();
    this.cartTotal();
    this.closePopUp();
  }
  setCartTxt(cart: any) {
    let elements = document.querySelectorAll('.qty-' + cart.uniq);
    elements.forEach((el: any) => {
      el.value = cart.added_quantity;
    });
  }
  childReceipeCheck(debit_receipe_id: any, quantity: any) {
    if (debit_receipe_id) {
      let childReceipes = this.carts.filter(
        (e: any) => e.debit_receipe_id === debit_receipe_id
      );
      if (childReceipes.length > 0) {
        let sum = childReceipes.reduce(
          (accumulator: any, current: any) =>
            accumulator + parseFloat(current.added_quantity),
          0
        );
        if (sum + 1 > quantity) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Base Ingredients reached maximum",
          });
          return false;
        }
      }
    }
    return true;
  }
  qtyChanged(cart: any, qty: any, keyup: any) {
    if (keyup && +qty == 0) {
      return;
    }
    if (+qty > 0) {
      if (!this.childReceipeCheck(cart.debit_receipe_id, cart.quantity)) {
        return;
      }
      qty = this.isNotDemcialStep(+cart.category_id) ? Math.ceil(+qty) : +qty;
      if (+qty <= cart.quantity) {
        cart.added_quantity = +qty;
        let price = +cart.price.toFixed(2);
        cart.total = cart.added_quantity * price;
        if (cart.parent_recipe_quantity && cart.yield) {
          cart.debit =
            (cart.added_quantity * cart.parent_recipe_quantity) / cart.yield;
        }
        this.setCartTxt(cart);
        this.splitDiscountAmount();
        this.cartTotal();
      } else {
        cart.added_quantity = +cart.quantity;
        this.setCartTxt(cart);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Reached maximum quantity",
        });
      }
    } else {
      this.carts.splice(
        this.carts.findIndex(
          (a: any) =>
            a.receipe_id === cart.receipe_id && a.product_id === cart.product_id
        ),
        1
      );
      this.splitDiscountAmount();
      this.cartTotal();
    }
  }
  increaseQuantity(cart: any) {
    if (!this.childReceipeCheck(cart.debit_receipe_id, cart.quantity)) {
      return;
    }
    let subQty = this.isNotDemcialStep(+cart.category_id) ? (+cart.added_quantity + 0.5) : Math.ceil(+cart.added_quantity + 1);
    if (subQty <= cart.quantity) {
      cart.added_quantity = subQty;
      let price = +cart.price.toFixed(2);
      cart.total = cart.added_quantity * price;
      if (cart.parent_recipe_quantity && cart.yield) {
        cart.debit =
          (cart.added_quantity * cart.parent_recipe_quantity) / cart.yield;
      }
      this.setCartTxt(cart);
      this.splitDiscountAmount();
      this.cartTotal();
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Reached maximum quantity",
      });
      cart.added_quantity = +cart.quantity;
      this.setCartTxt(cart);
    }
  }
  decreaseQuantity(cart: any) {
    let subQty = this.isNotDemcialStep(+cart.category_id) ? (+cart.added_quantity - 0.5) : Math.ceil(+cart.added_quantity - 1);
    if (subQty > 0) {
      cart.added_quantity = subQty;
      let price = +cart.price.toFixed(2);
      cart.total = cart.added_quantity * price;
      if (cart.parent_recipe_quantity && cart.yield) {
        cart.debit =
          (cart.added_quantity * cart.parent_recipe_quantity) / cart.yield;
      }
      this.setCartTxt(cart);
    } else {
      this.carts.splice(
        this.carts.findIndex(
          (a: any) =>
            a.receipe_id === cart.receipe_id && a.product_id === cart.product_id
        ),
        1
      );
    }
    this.splitDiscountAmount();
    this.cartTotal();
  }
  draft() { }
  cancelNotes() {
    this.notes = "";
  }
  openNotes(content: any) {
    this.resetPopup();
    this.isNotes = !this.isNotes;
    if (this.isNotes) {
      this.modalReference = this.modalService.open(content);
      this.modalReference.result.then(() => { });
    } else {
      this.closePopUp();
    }
  }
  openPaymentMode(content: any) {
    this.resetPopup();
    if (this.selected_payment_mode.is_online === 1 && !this.reference_no) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill the Reference No for Online Orders",
      });
      return;
    }
    this.submitted = true;
    this.paymentModes = JSON.parse(
      JSON.stringify(this.selected_payment_mode.modes)
    );
    if (this.paymentModes.length > 0 && this.paymentModes.length > 1) {
      this.isPayment = true;
      this.modalReference = this.modalService.open(content);
      this.modalReference.result.then(
        () => { },
        () => {
          this.isPayment = false;
          this.submitted = false;
        }
      );
    } else {
      this.payment_mode_id =
        this.selected_payment_mode.modes[0].payment_mode_type_id;
      this.payment_mode_name = this.selected_payment_mode.modes[0].type.name;
      this.saveDetails();
    }
  }
  finshOrderreset() {
    this.submitted = false;
  }
  choosePaymentMode(mode: any, name: any) {
    this.payment_mode_id = mode;
    this.payment_mode_name = name;
  }
  paymentModeCancel() {
    this.isPayment = false;
    this.submitted = false;
    this.payment_mode_id = "";
    this.payment_mode_name = "";
  }
  selectedOrder(order: any) {
    this.order = order;
    this.customer = order.customer;
  }
  generateUniqSerial() {
    this.sessionId = 'xxxx-xxxx-xxx-xxxx'.replace(/[x]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      return r.toString(16);
    });
  }
  openCart(content: any) {
    this.resetPopup();
    this.isCart = !this.isCart;
    if (this.isCart) {
      this.modalReference = this.modalService.open(content);
      this.modalReference.result.then(() => {
        if (this.isCart && this.carts && this.carts.length > 0) {

        }
      });
      setTimeout(() => {
        document
          .getElementsByClassName("modal-dialog")[0]
          .setAttribute("class", "max-100");
      }, 0);
    } else {
      document
        .getElementsByClassName("modal-dialog")[0]
        .setAttribute("class", "");
      this.closePopUp();
    }
  }
  isNotDemcialStep(id: any) {
    return (this.categoriesWithDemcialStep.indexOf(id) > -1);
  }
  addOnCheck(content: any, stock: any) {
    this.addonDetails = [];
    this.addonDetailData = [];
    this.selectedStock = stock;
    this.addons = this.currentCategories.stocks.filter((e: any) => this.selectedStock.name != e.name && e.category_id === this.selectedStock.category_id && e.addon === 1);
    if (this.addons.length === 0) {
      this.priceVariants(content, this.selectedStock, true);
    } else {
      this.selectedStock.isAddon = true;
      this.modalReference = this.modalService.open(content);
      this.modalReference.result.then(() => { });
      setTimeout(() => {
        document
          .getElementsByClassName("modal-dialog")[0]
          .setAttribute("class", "max-100");
      }, 0);
    }
  }
  addonDetailsChanged(e: any) {
    this.addonDetailData = [];
    setTimeout(() => {
      if (e.value && e.value.length > 0) {
        e.value.forEach((element: any) => {
          this.addonDetailData.push(element.name);
        });
      }
    }, 0);
  }
  addOnCheckProcess(content: any) {
    if (this.addonDetailData.length > 0) {
      let parentId = ("cart-" + new Date().getTime());
      this.selectedStock.isAddon = false;
      this.priceVariants(content, this.selectedStock, true, parentId);
      this.addonDetailData.forEach((stock: any) => {
        stock = this.addons.find((e: any) => stock === e.name);
        stock.isAddon = true;
        this.priceVariants(content, stock, true, parentId);
      });
      this.addons = [];
      this.addonDetailData = [];
    } else {
      this.priceVariants(content, this.selectedStock, true);
    }
  }
}
