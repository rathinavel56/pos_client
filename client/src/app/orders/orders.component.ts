import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  templateUrl: './orders.component.html'
})
export class OrderComponent extends BaseComponent implements OnInit {
  isSearch: boolean = true;
  isAdd: boolean = false;
  isView: boolean = false;
  status: any = 0;
  isEdit: boolean = false;
  orders: any = [];
  id: any = '';
  lastPage: any;
  page: any;
  currentPage: any = 1;
  sortBy: any = 'delivery_date';
  sortOrder: any = 'ASC';
  disableSubmit: any = false;
  customerdetail: any = {
    customer_name: '',
    customer_email: '',
    customer_city: '',
    customer_dob: '',
    customer_gender: '',
    customer_mobile: '',
    customer_address: ''
  };
  formData: any;
  filesUploded: any;
  modalReference: any;
  recipes: any = [];
  statuss: any = [{
    id: '',
    name: 'All'
  },{
    id: 0,
    name: 'Inprogress'
  },{
    id: 1,
    name: 'Completed'
  },{
    id: -1,
    name: 'Cancelled'
  }];
  paymentModes: any = [];
  copies: any = [1];
  orderDetail: any = {
    order_no: null,
    status: null,
    location_id: null,
    customer_id: null,
    customer: null,
    notes: null,
    message: null,
    delivery_date: null,
    value1: null,
    value2: null,
    advance_amount: '',
    details: [
      {
        total_net_price: null,
        SGST_percentage: null,
        CGST_percentage: null,
        IGST_percentage: null,
        cess_percentage: null,
        product_id: null,
        receipe_id: null,
        shape_id: null,
        shape: null,
        quantity: null
      }
    ],
    attachment: null,
    is_active: true
  };
  isShowLocation: boolean = false;
  locations: any = [];
  receipe_in_id: any = '';
  location_in_id: any = '';
  unit: any = '';
  hostName: any = "";
  config = {
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
  selectedLocation: any;
  totalQty: any = 0;
  printData: any = '';
  userDetail: any;
  shapes: any;
  constructor(public recipeService: RecipeService,public router: Router,
    private modalService: NgbModal) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.hostName =
      window.location.hostname !== "localhost"
        ? "http://" + window.location.hostname
        : "http://vijaypos.info";
    this.userDetail = sessionStorage.getItem("hotbread")
      ? JSON.parse(sessionStorage.getItem("hotbread") || "{}")
      : null;
    if (this.userDetail) {
      this.isShowLocation = this.userDetail.session_detail.location_id == 0;
    }
    if (this.isShowLocation) {
      this.getLocations();
    } else {
      this.selectedLocation = this.userDetail.session_detail.location;
    }
    this.showLoading();
    this.getRecords();
    this.getRecipes();
    this.getPaymentModes();
    this.getShapes();
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
          } else {
            this.locations = [];
          }
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  locationSelectionChanged(e: any) {
    if (e && e.value && e.value.id) {
      this.selectedLocation = e.value;
      this.orderDetail.location_id = e.value.id;
    } else {
      this.selectedLocation = '';
      this.orderDetail.location_id = '';
    }
  }
  checkDate() {
    setTimeout(() => {
      let toDate = new Date();
      if (new Date(this.orderDetail.delivery_date + ' 23:59:59').getTime() < toDate.getTime()) {
        this.orderDetail.delivery_date = null;
      }
    }, 0);
  }
  receipeSelectionChanged(e: any, index: any) {
    if ((e && e.value && e.value.id) || this.orderDetail.details[index].receipe_id) {
      if (e && e.value && e.value.id) {
        this.orderDetail.details[index].receipe_id = e.value.id;
        this.orderDetail.details[index].selling_price = (e.value && e.value.price && e.value.price.length > 0) ? e.value.price[0].selling_price : 0;
        this.orderDetail.details[index].SGST_percentage = e.value.price[0].selling_SGST_percentage;
        this.orderDetail.details[index].CGST_percentage = e.value.price[0].selling_CGST_percentage;
        this.orderDetail.details[index].IGST_percentage = e.value.price[0].selling_IGST_percentage;
        this.orderDetail.details[index].cess_percentage = e.value.price[0].selling_cess_percentage;
      }
      this.orderDetail.details[index].total_net_price = (this.orderDetail.details[index].selling_price* +this.orderDetail.details[index].quantity);
    } else {
      this.orderDetail.details[index].selling_price = 0;
      this.orderDetail.details[index].total_net_price = 0;
      this.orderDetail.details[index].SGST_percentage = 0;
      this.orderDetail.details[index].CGST_percentage = 0;
      this.orderDetail.details[index].IGST_percentage = 0;
      this.orderDetail.details[index].cess_percentage = 0;
      this.orderDetail.details[index].SGST_amount = 0;
      this.orderDetail.details[index].CGST_amount = 0;
      this.orderDetail.details[index].IGST_amount = 0;
      this.orderDetail.details[index].cess_amount = 0;
      this.orderDetail.details[index].total = 0;
      this.orderDetail.details[index].product = null;
      this.orderDetail.details[index].receipe = null;
    }
    this.getTotal();
  }
  printInvoice(isAutoClose: boolean) {
    this.showLoading();
      this.printData = JSON.parse(JSON.stringify(this.orderDetail));
      let w: any = window.open();
      setTimeout(() => {
        this.clearLoading();
        let html = $("#print_invoice").html();
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
        if (isAutoClose) {
          this.disableSubmit = true;
          setTimeout(() => {
            this.cancel();
            this.getRecords();
          }, 1000);
        }
      }, (isAutoClose === true) ? 1000 : 0);
  }
  getTotal() {
    let details = this.orderDetail.details.filter((e: any) => (e.receipe_id || e.product_id) && +e.quantity > 0);
    this.orderDetail.SGST_amount = 0;
    this.orderDetail.CGST_amount = 0;
    this.orderDetail.IGST_amount = 0;
    this.orderDetail.cess_amount = 0;
    this.orderDetail.total = 0;
    this.totalQty = 0;
    if (details.length > 0) {
      this.orderDetail.details.forEach((orderDtl: any) => {
        orderDtl.SGST_amount = (+orderDtl.SGST_percentage > 0 ? ((orderDtl.SGST_percentage / 100) * (+orderDtl.total_net_price)) : 0);
        orderDtl.CGST_amount = (+orderDtl.CGST_percentage > 0 ? ((orderDtl.CGST_percentage / 100) * (+orderDtl.total_net_price)) : 0);
        orderDtl.IGST_amount = (+orderDtl.IGST_percentage > 0 ? ((orderDtl.IGST_percentage / 100) * (+orderDtl.total_net_price)) : 0);
        orderDtl.cess_amount = (+orderDtl.cess_percentage > 0 ? ((orderDtl.cess_percentage / 100) * (+orderDtl.total_net_price)) : 0);
        orderDtl.total = (+orderDtl.total_net_price) + orderDtl.SGST_amount + orderDtl.CGST_amount + orderDtl.IGST_amount + orderDtl.cess_amount;
        this.orderDetail.SGST_amount = this.orderDetail.SGST_amount + orderDtl.SGST_amount;
        this.orderDetail.CGST_amount = this.orderDetail.CGST_amount + orderDtl.CGST_amount;
        this.orderDetail.IGST_amount = this.orderDetail.IGST_amount + orderDtl.IGST_amount;
        this.orderDetail.cess_amount = this.orderDetail.cess_amount + orderDtl.cess_amount;
        this.orderDetail.total = this.orderDetail.total + orderDtl.total;
        this.totalQty = this.totalQty + +orderDtl.quantity;
      });
    }
  }
  getShapes() {
    this.shapes = [];
    this.recipeService.shapes(null).subscribe(
      (response: any) => {
        if (response.data && response.data.length > 0) {
          this.shapes = response.data;
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
  getPaymentModes() {
    this.paymentModes = [];
    this.recipeService.getPaymentModes().subscribe(
      (response: any) => {
        if (response.data && response.data.length > 0) {
          let modes = response.data.find((e: any) => (e.name === 'Take Away')).modes;
          modes.forEach((element: any) => {
            this.paymentModes.push(element.type);
          });
          this.paymentModes.forEach((element: any, i: number) => {
            element.selected = (i === 1);
          });
          this.orderDetail.payment_mode = JSON.parse(
            JSON.stringify(this.paymentModes[1])
          );
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
  addItems() {
    this.orderDetail.details.push({
      total_net_price: null,
      SGST_percentage: null,
      CGST_percentage: null,
      IGST_percentage: null,
      cess_percentage: null,
      product_id: null,
      receipe_id: null,
      product: null,
      receipe: null,
      quantity: null
    });
  }
  sorting(sort: any) {
    this.sortOrder = (this.sortBy === sort) ? ((this.sortOrder === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords();
  }
  add() {
    this.isAdd = true;
    this.isSearch = false;
    this.customerdetail = {
      customer_name: '',
      customer_email: '',
      customer_city: '',
      customer_dob: '',
      customer_gender: '',
      customer_mobile: '',
      customer_address: ''
    };
    this.orderDetail = {
        id: null,
        order_no: null,
        status: null,
        location_id: null,
        customer_id: null,
        customer: null,
        message: null,
        notes: null,
        delivery_date: null,
        value1: null,
        value2: null,
        advance_amount: '',
        is_active: true,
        details: [
          {
            total_net_price: null,
            SGST_percentage: null,
            CGST_percentage: null,
            IGST_percentage: null,
            cess_percentage: null,
            product_id: null,
            receipe_id: null,
            shape_id: null,
            shape: null,
            product: null,
            receipe: null,
            quantity: null,
            selling_price: null,
            total: 0
          }
        ]
    };
  }
  view(preBooking: any): void {
    this.isEdit = true;
    this.isSearch = false;
    this.isView = true;
    this.receipe_in_id = preBooking.receipe;
    this.location_in_id = preBooking.location;
    this.customerdetail = preBooking.customer;
    this.orderDetail = preBooking;
    this.orderDetail.notes = preBooking.notes ? preBooking.notes.notes : '';
    this.orderDetail.message = preBooking.message ? preBooking.message.notes : '';
    let deliveryDate: any = this.orderDetail.delivery_date.split(' ')
    this.orderDetail.value1 = deliveryDate[0];
    this.orderDetail.value2 = deliveryDate[1];
    this.getTotal();
    this.scrollTop();
  }
  edit(preBooking: any): void {
    this.isEdit = true;
    this.isSearch = false;
    this.receipe_in_id = preBooking.receipe;
    this.location_in_id = preBooking.location;
    this.customerdetail = preBooking.customer;
    this.orderDetail = preBooking;
    this.orderDetail.notes = preBooking.notes ? preBooking.notes.notes : '';
    this.orderDetail.message = preBooking.message ? preBooking.message.notes : '';
    let deliveryDate: any = this.orderDetail.delivery_date.split(' ')
    this.orderDetail.value1 = deliveryDate[0];
    this.orderDetail.value2 = deliveryDate[1];
    this.getTotal();
    this.scrollTop();
  }
  cancel(): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.receipe_in_id = '';
    this.location_in_id = '';
    this.isView = false;
    this.status = '';
    this.customerdetail = {
      customer_name: '',
      customer_email: '',
      customer_city: '',
      customer_dob: '',
      customer_gender: '',
      customer_mobile: '',
      customer_address: ''
    };
    this.orderDetail = {
        id: null,
        status: null,
        order_no: null,
        location_id: null,
        customer_id: null,
        customer: null,
        notes: null,
        message: null,
        delivery_date: null,
        value1: null,
        value2: null,
        advance_amount: '',
        attachment: null,
        is_active: true,
        SGST_amount: 0,
        CGST_amount: 0,
        IGST_amount: 0,
        cess_amount: 0,
        total: 0,
        details: [
          {
            total_net_price: null,
            SGST_percentage: null,
            CGST_percentage: null,
            IGST_percentage: null,
            cess_percentage: null,
            product_id: null,
            receipe_id: null,
            shape_id: null,
            shape: null,
            quantity: null,
            product: null,
            receipe: null,
            selling_price: null,
            total: 0
          }
        ]
    };
    this.sortBy = 'delivery_date';
    this.sortOrder = 'ASC';
    this.getRecords();
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
    this.getRecords();
  }
  datetimepickerChg(detail: any) {
    setTimeout(()=>{
      detail.value2 = (!detail.value2) ? '00:00' : detail.value2;
      detail.delivery_date = (detail.value1) ? (detail.value1 + ' ' + (detail.value2)) : '';
      if (this.isAdd || this.isEdit) {
        this.checkDate();
      }
    }, 0);
  }
  getCustomers(content: any, close: any) {
    if ((this.isAdd || this.isEdit) && this.customerdetail.customer_mobile && this.customerdetail.customer_mobile.length === 10) {
      this.showLoading();
      this.recipeService.getCustomers({
        customer_mobile: this.customerdetail.customer_mobile ? this.customerdetail.customer_mobile : null
      }, 1)
      .subscribe((response: any) => {
          if (response.data && response.data && response.data.data.length > 0) {
            this.orderDetail.customer_id = response.data.data[0].id;
            this.orderDetail.customer = response.data.data[0];
          } else {
            this.modalReference = this.modalService.open(content);
            this.modalReference.result.then(() => {});
            setTimeout(() => {
              document
                .getElementsByClassName("modal-dialog")[0]
                .setAttribute("class", "max-100");
            }, 0);
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
      });
    }
  }
  closePopUp() {
    if (this.modalReference) {
      this.modalReference.close();
    }
  }
  getRecipes() {
    this.recipeService.getRecipes({
      q: 'all',
      type: 'price',
      class: 'order'
    }, null).subscribe({
      next: (response: any) => {
        if (response.data && response.data.length > 0) {
          this.recipes = response.data.filter((e: any) => e.is_request_stock === 1 && e.is_show_in_pos === 1 && e.is_active);
        } else {
          this.recipes = [];
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
  submit(id: any) {
    this.orderDetail.details = this.orderDetail.details.filter((e: any) => (e.receipe_id && +e.quantity > 0));
    if (id || ((!this.isShowLocation || (this.isShowLocation && this.orderDetail.location_id)) && this.orderDetail.customer_id && this.orderDetail.details.length > 0 && this.orderDetail.payment_mode && this.orderDetail.payment_mode.id && this.orderDetail.delivery_date && this.orderDetail.advance_amount)) {
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
            Swal.fire({
              title: "Cancel Reason Notes",
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
                    resolve("Please Enter Cancel Reason");
                  }
                });
              },
              allowOutsideClick: () => false,
            }).then((result) => {
              if (result.isConfirmed) {
                this.orderDetail.id = id;
                this.orderDetail.is_active = false;
                this.saveDetails(id, result.value);
              }
            });
          }
        })
      } else {
        this.saveDetails(id, this.orderDetail.notes);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill the required fields'
      });
    }
  }
  removeRecipe(index: any) {
    this.orderDetail.details.splice(index, 1);
    this.getTotal();
  }
  setPagination(currentPage : any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords();
  }
  getRecords() {
    this.disableSubmit = false;
    this.recipeService.orders({
        customer_mobile: this.customerdetail.customer_mobile ? this.customerdetail.customer_mobile : null,
        location_id: this.orderDetail.location_id,
        order_no: this.orderDetail.order_no,
        delivery_date: this.orderDetail.delivery_date ? (this.orderDetail.delivery_date + ':00') : undefined,
        status: (this.statuss !== -1) ? this.status.toString() : undefined,
        is_active: (this.statuss !== -1),
        sort_by: this.sortBy,
        sort_order: this.sortOrder
    }, this.currentPage)
    .subscribe((response: any) => {
        if (response.data && response.data.data.length > 0) {
          this.orders = response.data.data;
          this.page = response.data.current_page;
          this.lastPage = response.data.total;
        } else {
          this.orders = [];
          this.page = 0;
          this.lastPage = 0;
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
    });
  }
  saveDetails(id: any, notes?: any) {
    this.showLoading();
    this.formData = new FormData();
    if (this.filesUploded && this.filesUploded.length > 0) {
      this.formData.append('file', this.filesUploded[0], this.filesUploded[0].name);
    }
    this.orderDetail.notes = notes ? notes : undefined;
    this.formData.append('data', JSON.stringify(this.orderDetail));
    this.recipeService.order(this.formData)
        .subscribe((response: any) => {
          this.clearLoading();
          if (id) {
            Swal.fire(
              'Deleted!',
              'Your Order has been deleted.',
              'success'
            );
            this.cancel();
            this.getRecords();
          } else {
            Swal.fire(
              'Saved',
              'Your Order has been saved.',
              'success'
            );
            this.orderDetail = response.data;
            this.orderDetail.message = this.orderDetail.message ? this.orderDetail.message.notes : '';
            this.orderDetail.notes = this.orderDetail.notes ? this.orderDetail.notes.notes : '';
            setTimeout(() => {
              this.printInvoice(true);
            }, 100);
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  saveCustomer() {
    this.showLoading();
    if (this.customerdetail.customer_name) {
      this.customerdetail.location_id = this.isShowLocation ? this.orderDetail.location_id : undefined;
      this.recipeService.saveCustomer(this.customerdetail)
        .subscribe((response: any) => {
          this.clearLoading();
          this.orderDetail.customer_id = response.data.id;
            Swal.fire(
              'Saved',
              'Your Customer has been saved.',
              'success'
            );
          this.closePopUp();
        },
        (err: any) => {
          this.networkIssue();
       });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter name'
      });
    }
  }
  uploadFile(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      if (((/\.(gif|jpg|jpeg|tiff|png|pdf)$/i).test(event.target.files[0].name))) {
        this.filesUploded = event.target.files;
      } else {
        let cakeOrderFile: any = document.getElementById('cakeOrderFile');
        if (cakeOrderFile) {
          cakeOrderFile.value = '';
        }
        Swal.fire({
          icon: 'error',
          title: 'Oops invalid file format...',
          text: 'Please choose image or pdf'
        });
        this.filesUploded = '';
      }
    } else {
      this.filesUploded = '';
    }
    this.deleteAttachment();
  }
  deleteAttachment() {
    this.orderDetail.attachment = undefined;
  }
  downloadFile(data: any) {
    let hostName =
      window.location.hostname !== "localhost"
        ? "http://" + window.location.hostname
        : "http://vijaypos.info";
    let link: any = document.createElement("a");
    link.href = hostName + '/assets/download/invoice/' + data.attachment.file_name;
    document.body.appendChild(link);
    let fileExt: any = data.attachment.file_name.split('.').pop();
    link.download = data.invoice_number + '.' + fileExt;
    link.target = '_blank';
    link.click();
    document.body.removeChild(link);
  }
}
