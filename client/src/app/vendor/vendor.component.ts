import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './vendor.component.html'
})
export class VendorComponent extends BaseComponent implements OnInit {
  isSearch: boolean = true;
  isAdd: boolean = false;
  isEdit: boolean = false;
  units: any = [];
  vendors: any = [];
  name: any = '';
  address: any = '';
  pincode: any = '';
  gstin: any = '';
  credit_days: any = '';
  contact_name: any = '';
  contact_mobile: any = '';
  contact_email: any = '';
  contact_website: any = '';
  id: any = '';
  isPendingAmount = false;
  pendingAmount: any;
  totalAmount: any;
  lastPage: any;
  currentPage: any = 1;
  page: any;
  lastPagePay: any;
  currentPagePay: any = 1;
  pagePay: any;
  sortBy: any = 'name';
  sortOrder: any = 'ASC';
  sortByPay: any = 'invoice_date';
  sortOrderPay: any = 'ASC';
  isPayment = false;
  vendor: any;
  paymentDetails: any = [];
  paymentDetail: any = [];
  paymentModes: any = [];
  filesUploded: any;
  bills: any = [];
  isBillView: any = false;
  isAddPayments = false;
  currentPayment: any;
  totalPayedAmount: any = 0;
  totalPendingAmount: any = 0;
  payments: any = [];
  config: any;
  userDetail: any;
  constructor(public recipeService: RecipeService, public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    if (!this.router.url.includes('/vendor-dashboard')) {
      this.getRecords();
      this.getPaymentModeTypes();
    } else {
      this.userDetail = sessionStorage.getItem('retail_pos') ? JSON.parse(sessionStorage.getItem('retail_pos') || '{}') : null;
      if (this.userDetail.session_detail && this.userDetail.session_detail.vendor) {
        this.getIncomingStocksPayments(this.userDetail.session_detail.vendor);
      } else {
        this.clearLoading();
      }
    }
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
  }
  addPayments() {
    this.isAddPayments = true;
    this.payments = [];
    this.addMorePayments();
  }
  getPaymentModeTypes() {
    this.paymentModes = [];
    this.recipeService.getPaymentModeTypes().subscribe(
      (response: any) => {
        if (response.data && response.data.length > 0) {
          this.paymentModes = response.data;
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
  paymentModeChange(e:any, payment: any) {
    payment.payment_mode_type_id = (e && e.value && e.value.id) ? e.value.id : null;
  }
  removePayment(indexOfelement: any) {
    this.payments.splice(indexOfelement, 1);
    this.calculateAmount();
  }
  calculateAmount() {
    let currentAmt = (this.payments.reduce(
      (accumulator: any, detail: any) =>
        accumulator + (+detail.amount),
      0
    ));
    if (currentAmt > 0) {
      this.totalPendingAmount = (+this.currentPayment.total - ((+this.currentPayment.total - +this.currentPayment.pending_amount) + currentAmt));
      this.totalPayedAmount = (+this.currentPayment.total - +this.currentPayment.pending_amount) + currentAmt;
    } else {
      this.totalPendingAmount = +this.currentPayment.pending_amount;
      this.totalPayedAmount = (+this.currentPayment.total - +this.currentPayment.pending_amount);
    }
  }
  backTo() {
    if (this.isAddPayments) {
      this.isAddPayments = false;
    } else if (this.isBillView) {
      this.isBillView = false;
    } else {
      this.isPayment = false;
    }
    this.totalPayedAmount = 0;
    this.totalPendingAmount = 0;
  }
  billDetails(payments: any) {
    this.currentPayment = payments;
    this.totalPendingAmount = +this.currentPayment.pending_amount;
    this.totalPayedAmount = (+this.currentPayment.total - +this.currentPayment.pending_amount);
    this.isBillView = true;
    this.isAddPayments = false;
    this.payments = [];
    this.bills = [];
    this.showLoading();
    this.recipeService.getIncomingStocksPaymentDetails({
      id: this.currentPayment.id
    })
    .subscribe((response: any) => {
        if (response.status && response.status === 'success') {
          this.currentPayment.attachments = response.data.attachments;
          this.bills = response.data.stocks_incoming_payment_detail;
          Swal.fire(
            'Success!',
            'Your Details has been saved.',
            'success'
          );
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please connect with support'
          });
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  checkDate(payment: any) {
    payment.payment_date = payment.payment_date ? ((new Date(payment.payment_date).getTime() > new Date().getTime()) ? null : payment.payment_date) : null;
  }
  getIncomingStocksPayments(vendor: any) {
    this.showLoading();
    this.vendor = vendor;
    this.paymentDetails = [];
    this.recipeService.getIncomingStocksPayments({
      vendor_id: vendor.id,
      sort_by: this.sortByPay,
      sort_order: this.sortOrderPay
    }, this.currentPage)
    .subscribe((response: any) => {
        this.isPayment = true;
        if (response.data && response.data.data.length > 0) {
          this.paymentDetails = response.data.data;
          this.pagePay = response.data.current_page;
          this.lastPagePay = response.data.total;
        } else {
          this.paymentDetails = [];
          this.pagePay = 0;
          this.lastPagePay = 0;
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  uploadFile(event: any) {
    this.filesUploded = event.target.files;
    if (this.filesUploded && this.filesUploded.length > 0) {
      let formData = new FormData();
      if (this.filesUploded && this.filesUploded.length > 0) {
        formData.append('file', this.filesUploded[0], this.filesUploded[0].name);
      }
      formData.append('data', JSON.stringify({
        id: this.currentPayment.id,
        class: 'vendor_bill_payment'
      }));
      this.showLoading();
      this.recipeService.saveAttachment(formData)
      .subscribe((response: any) => {
          this.currentPayment.attachments = response.data;
          Swal.fire(
            'Save!',
            'Your Attachment Detail has been saved.',
            'success'
          );
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
    }
  }
  addMorePayments() {
    this.payments.push({
      payment_mode_type_id: null,
      amount: null,
      payment_date: null,
      payment_mode_type: null
    });
  }
  deletePayment(bill: any) {
    this.showLoading();
    this.recipeService.deleteIncomingStocksPaymentDetail({
      id: bill.id,
      amount: bill.amount,
      stocks_incoming_id: this.currentPayment.id,
      total: this.currentPayment.total
    })
    .subscribe((response: any) => {
        this.currentPayment = response.data;
        this.bills = response.data.stocks_incoming_payment_detail;
        this.totalPendingAmount = +response.data.pending_amount;
        this.totalPayedAmount = (+response.data.total - +response.data.pending_amount);
        Swal.fire(
          'Deleted!',
          'Your Payment Detail has been deleted.',
          'success'
        );
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  deleteAttachment(attachment: any) {
    this.showLoading();
    this.recipeService.deleteAttachment({
      id: attachment.id,
      class: attachment.class,
      foreign_id: attachment.foreign_id
    })
    .subscribe((response: any) => {
      this.currentPayment.attachments = response.data.attachments;
        Swal.fire(
          'Deleted!',
          'Your Attachment has been deleted.',
          'success'
        );
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  downloadFile(attachment: any) {
    let hostName =
      window.location.hostname !== "localhost"
        ? "http://" + window.location.hostname
        : "http://localhost:9000";
    let link: any = document.createElement("a");
    link.href = hostName + '/assets/download/'+ attachment.class +'/' + attachment.file_name;
    document.body.appendChild(link);
    let fileExt: any = attachment.file_name.split('.').pop();
    link.download = attachment.file_name + '.' + fileExt;
    link.target = '_blank';
    link.click();
    document.body.removeChild(link);
  }
  saveIncomingStocksPaymentDetail() {
    let checkValErorr = this.payments.filter((e: any) => !e.payment_mode_type_id || !e.amount || (+e.amount <= 0) || !e.payment_date);
    if (checkValErorr.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please check some fields are empty",
      });
      return;
    }
    this.showLoading();
    this.recipeService.saveIncomingStocksPaymentDetail({
      id: this.currentPayment.id,
      payments: this.payments,
      total: +this.currentPayment.total
    })
    .subscribe((response: any) => {
        if (response.status && response.status === 'success') {
          this.currentPayment = response.data;
          this.bills = response.data.stocks_incoming_payment_detail;
          this.totalPendingAmount = +response.data.pending_amount;
          this.totalPayedAmount = (+response.data.total - +response.data.pending_amount);
          Swal.fire(
            'Success!',
            'Your Details has been saved.',
            'success'
          ); 
          this.backTo();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please connect with support'
          });
        }
        this.clearLoading();
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
  sortingPay(sort: any) {
    this.sortOrder = (this.sortByPay === sort) ? ((this.sortOrderPay === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortByPay = sort;
    this.showLoading();
    this.currentPagePay = 1;
    this.getIncomingStocksPayments(this.vendor);
  }
  add() {
    this.isAdd = true;
    this.isSearch = false;
    this.id = '';
    this.name = '';
    this.address = '';
    this.pincode = '';
    this.gstin = '';
    this.credit_days = '';
    this.contact_name = '';
    this.contact_mobile = '';
    this.contact_email = '';
    this.contact_website = '';
  }
  edit(vendor: any): void {
    this.isEdit = true;
    this.isSearch = false;
    this.id = vendor.id;
    this.name = vendor.name;
    this.address = vendor.address;
    this.pincode = vendor.pincode;
    this.gstin = vendor.gstin;
    this.credit_days = vendor.credit_days;
    this.contact_name = vendor.contact_name;
    this.contact_mobile = vendor.contact_mobile;
    this.contact_email = vendor.contact_email;
    this.contact_website = vendor.contact_website;
    this.scrollTop();
  }
  cancel(): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.name = '';
    this.address = '';
    this.pincode = '';
    this.gstin = '';
    this.credit_days = '';
    this.contact_name = '';
    this.contact_mobile = '';
    this.contact_email = '';
    this.contact_website = '';
    this.isPendingAmount = false;
    this.sortBy = 'name';
    this.sortOrder = 'ASC';
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
  submit(id: any) {
    if (id || (this.name)) {
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
  setPagination(currentPage : any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords();
  }
  setPaginationPay(currentPage : any) {
    this.currentPagePay = currentPage;
    this.getIncomingStocksPayments(this.vendor);
  }
  getRecords() {
    this.pendingAmount = 0;
    this.totalAmount = 0;
    this.recipeService.getVendors({
        name: this.name,
        address: this.address,
        pincode: this.pincode,
        gstin: this.gstin,
        contact_name: this.contact_name,
        contact_mobile: this.contact_mobile,
        contact_email: this.contact_email,
        sort_by: this.sortBy,
        sort_order: this.sortOrder,
        is_pending_amount: (this.isPendingAmount === true) ? true : undefined
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data.data.length > 0) {
            this.vendors = response.data.data;
            this.page = response.data.current_page;
            this.lastPage = response.data.total;
            this.pendingAmount = response.pending_amount;
            this.totalAmount = response.total_amount;
          } else {
            this.vendors = [];
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
    this.showLoading();
      this.recipeService.saveVendor({
          id: id ? id : this.id,
          name: this.name,
          is_active: id ? false : true,
          address: this.address,
          pincode: this.pincode,
          gstin: this.gstin,
          credit_days: this.credit_days,
          contact_name: this.contact_name,
          contact_mobile: this.contact_mobile,
          contact_email: this.contact_email,
          contact_website: this.contact_website
        })
        .subscribe((response: any) => {
          this.clearLoading();
          if (id) {
            Swal.fire(
              'Deleted!',
              'Your Vendor has been deleted.',
              'success'
            );
          } else {
            Swal.fire(
              'Saved',
              'Your Vendor has been saved.',
              'success'
            );
          }
          this.cancel();
          this.getRecords();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
}
