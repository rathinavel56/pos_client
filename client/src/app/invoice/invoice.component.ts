import { Component, OnInit } from "@angular/core";
import { RecipeService } from "../shared/service/recipe.service";
import { BaseComponent } from "../base.component";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TableUtil } from "../shared/util/tableUtil";


@Component({
  selector: "app-invoice",
  templateUrl: "./invoice.component.html",
})
export class InvoiceComponent extends BaseComponent implements OnInit {
  isSearch: boolean = true;
  isAdd: boolean = false;
  isEdit: boolean = false;
  invoices: any = [];
  invoiceDetail: any = "";
  modalReference: any;
  invoicePreview: boolean = false;
  from: any = "";
  to: any = "";
  invoice_no: any = "";
  reference_no: any = "";
  is_active: any = "";
  id: any = "";
  lastPage: any;
  page: any;
  is_export: any = '';
  isReturn: any = true;
  currentPage: any = 1;
  sortBy: any = "created_at";
  sortOrder: any = "DESC";
  location_id: any = "";
  locations: any = [];
  isShowLocation: boolean = false;
  config: any;
  location_in_id: any = "";
  isReturnAva: boolean = false;
  returnto: any = 0;
  taxs: any = [];
  totalQty: any = 0;
  hostName: any;
  userDetail: any;
  constructor(
    public recipeService: RecipeService,
    public router: Router,
    private modalService: NgbModal
  ) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.hostName =
      window.location.hostname !== "localhost"
        ? "http://" + window.location.hostname
        : "http://localhost:9000";
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
    }
    if (this.isShowLocation) {
      this.getLocations();
    }
    this.getRecords();
  }
  fillDate() {
    if (!this.from && this.to) {
      const to = this.to;
      this.from = to;
    }
    if (!this.to && this.from) {
      const from = this.from;
      this.to = from;
    }
  }
  returnTotal() {
    this.returnto = 0;
    let returnDet = this.invoiceDetail.details.filter((e: any) => e.return === true);
    if (returnDet.length > 0) {
      returnDet.forEach((invoiceDetail: any) => {
      this.returnto += invoiceDetail.price + (+invoiceDetail.SGST_percentage ? ((+invoiceDetail.SGST_percentage / 100) * invoiceDetail.price) : 0) + (+invoiceDetail.CGST_percentage ? ((+invoiceDetail.CGST_percentage / 100) * invoiceDetail.price) : 0) + (+invoiceDetail.IGST_percentage ? ((+invoiceDetail.IGST_percentage / 100) * invoiceDetail.price) : 0) + (+invoiceDetail.cess_percentage ? ((invoiceDetail.cess_percentage / 100) * invoiceDetail.price) : 0);
     });
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
      this.location_id = e.value.id;
    }
  }
  sorting(sort: any) {
    this.sortOrder = (this.sortBy === sort) ? ((this.sortOrder === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords();
  }
  cancel(): void {
    this.from = "";
    this.to = "";
    this.invoice_no = "";
    this.reference_no = "";
    this.location_id = "";
    this.location_in_id = "";
    this.isReturnAva = false;
    this.sortBy = "created_at";
    this.sortOrder = "DESC";
    this.is_export = '';
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
  setPagination(currentPage: any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords();
  }
  cancelPop() {
    this.invoiceDetail = "";
    this.invoicePreview = false;
    this.showLoading();
    this.getRecords();
  }
  returnStock() {
    this.isReturn =
      this.invoiceDetail.details.filter((e: any) => e.return === true)
        .length === 0;
    this.returnTotal();
  }
  submit(location_id: any) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Return!",
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.showLoading();
        this.recipeService
          .returnStocks({
            location_id: location_id,
            details: this.invoiceDetail.details.filter(
              (e: any) => e.return === true
            ),
          })
          .subscribe(
            () => {
              this.clearLoading();
              this.cancelPop();
              this.cancel();
              Swal.fire("Saved!", "Saved Successfully.", "success");
              this.getRecords();
            },
            (err: any) => {
              this.networkIssue();
            }
          );
      }
    });
  }
  getInvoice(invoice: any, content: any) {
    this.showLoading();
    this.isReturn = true;
    this.recipeService
      .getInvoice({
        location_id: invoice.location_id,
        id: invoice.id,
        invoice_no: invoice.invoice_no,
        reference_no: invoice.reference_no
      })
      .subscribe(
        (response: any) => {
          if (response.data) {
            this.invoicePreview = true;
            this.invoiceDetail = response.data;
            this.isReturnAva =
              this.invoiceDetail.details.filter(
                (invoiceDetl: any) =>
                  (invoiceDetl.product &&
                    invoiceDetl.product.pos_return === 1) ||
                  (invoiceDetl.receipe && invoiceDetl.receipe.pos_return === 1)
              ).length > 0;
            this.invoiceDetail.subTotal = 0;
            if (this.isReturnAva) {
              this.invoiceDetail.details.forEach((el: any) => {
                el.return = false;
                el.lineTotal = (+el.actual_price.toFixed(2) * +el.quantity);
                this.invoiceDetail.subTotal += el.lineTotal;
              });
            } else {
              this.invoiceDetail.details.forEach((el: any) => {
                el.return = false;
                el.lineTotal = (+el.actual_price.toFixed(2) * +el.quantity);
                this.invoiceDetail.subTotal += el.lineTotal;
              });
            }
            this.cartTotal();
            this.modalReference = this.modalService.open(content);
            let popUp = document.querySelector(".modal-dialog");
            if (popUp) {
              popUp.classList.remove("modal-dialog");
            }
            this.modalReference.result.then(() => {});
            this.clearLoading();
          } else {
            this.clearLoading();
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "No Record found",
            });
          }
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  cartTotal() {
    if (!this.invoiceDetail.discount_amount) {
      this.invoiceDetail.discount_amount = 0;
    }
    if (!this.invoiceDetail.discount_mloyal_amount) {
      this.invoiceDetail.discount_mloyal_amount = 0;
    }
    this.taxs = [];
    this.totalQty = this.invoiceDetail.details.reduce(
      (accumulator: any, current: any) =>
        accumulator + parseFloat(current.quantity),
      0
    );
    let taxExisting: any;
    this.invoiceDetail.details.forEach((e: any) => {
        e.CGST = 0;
        e.SGST = 0;
        e.IGST = 0;
        e.cess = 0;
        if (+this.invoiceDetail.discount_percentage > 0 && +this.invoiceDetail.discount_mloyal_amount <= 0) {
          e.discount_percentage = +this.invoiceDetail.discount_percentage;
          e.discount_amount = (((e.actual_price.toFixed(2) * e.quantity)/100) * +this.invoiceDetail.discount_percentage);
          e.net_price = +((+e.actual_price - (e.discount_amount/e.quantity)).toFixed(2));
          e.total_net_price = (e.net_price * e.quantity);
        } else if (+this.invoiceDetail.discount_mloyal_amount > 0) {
          e.discount_percentage = +e.bill_percentage.toFixed(2);
          e.discount_amount = (this.invoiceDetail.discount_mloyal_amount * (+e.bill_percentage.toFixed(2)/100));
          e.total_net_price = e.lineTotal - e.discount_amount;
          e.net_price = (e.total_net_price/e.quantity).toFixed(2);
        } else {
          e.total_net_price = +e.total;
          e.net_price = +e.actual_price;
          e.discount_percentage = 0;
          e.discount_amount = 0;
        }
        if (e.CGST_percentage > 0) {
          const camount = parseFloat(
            ((e.CGST_percentage / 100) * e.net_price).toFixed(2)
          );
          e.CGST = camount;
          taxExisting = this.taxs.findIndex(
            (ele: any) =>
              ele.name === "CGST" &&
              ele.percentage === e.CGST_percentage
          );
          if (taxExisting > -1) {
            this.taxs[taxExisting].amount =
              this.taxs[taxExisting].amount + camount;
            this.taxs[taxExisting].withoutTaxAmount =
              this.taxs[taxExisting].withoutTaxAmount + (e.net_price * e.quantity);
          } else {
            this.taxs.push({
              name: "CGST",
              hsn: e.hsn_code,
              percentage: e.CGST_percentage,
              withoutTaxAmount: (e.net_price * e.quantity),
              amount: camount,
            });
          }
        }
        if (e.SGST_percentage > 0) {
          const samount = parseFloat(
            ((e.SGST_percentage / 100) * e.net_price).toFixed(2)
          );
          e.SGST = samount;
          taxExisting = this.taxs.findIndex(
            (ele: any) =>
              ele.name === "SGST" &&
              ele.percentage === e.SGST_percentage
          );
          if (taxExisting > -1) {
            this.taxs[taxExisting].amount =
              this.taxs[taxExisting].amount + samount;
            this.taxs[taxExisting].withoutTaxAmount =
              this.taxs[taxExisting].withoutTaxAmount + (e.net_price * e.quantity);
          } else {
            this.taxs.push({
              name: "SGST",
              hsn: e.hsn_code,
              percentage: e.SGST_percentage,
              withoutTaxAmount: (e.net_price * e.quantity),
              amount: samount,
            });
          }
        }
        if (e.IGST_percentage > 0) {
          const iamount = parseFloat(
            ((e.IGST_percentage / 100) * e.net_price).toFixed(2)
          );
          e.IGST = iamount;
          taxExisting = this.taxs.findIndex(
            (ele: any) =>
              ele.name === "IGST" &&
              ele.percentage === e.IGST_percentage
          );
          if (taxExisting > -1) {
            this.taxs[taxExisting].amount =
              this.taxs[taxExisting].amount + iamount;
            this.taxs[taxExisting].withoutTaxAmount =
              this.taxs[taxExisting].withoutTaxAmount + (e.net_price * e.quantity);
          } else {
            this.taxs.push({
              name: "IGST",
              hsn: e.hsn_code,
              percentage: e.IGST_percentage,
              withoutTaxAmount: (e.net_price * e.quantity),
              amount: iamount,
            });
          }
        }
        if (e.cess_percentage > 0) {
          const ceamount = parseFloat(
            ((e.cess_percentage / 100) * e.net_price).toFixed(2)
          );
          e.cess = ceamount;
          taxExisting = this.taxs.findIndex(
            (ele: any) =>
              ele.name === "CESS" &&
              ele.percentage === e.cess_percentage
          );
          if (taxExisting > -1) {
            this.taxs[taxExisting].amount =
              this.taxs[taxExisting].amount + ceamount;
            this.taxs[taxExisting].withoutTaxAmount =
              this.taxs[taxExisting].withoutTaxAmount + (e.net_price * e.quantity);
          } else {
            this.taxs.push({
              name: "CESS",
              hsn: e.hsn_code,
              percentage: e.cess_percentage,
              withoutTaxAmount: (e.net_price * e.quantity),
              amount: ceamount,
            });
          }
        }
      });
  }
  printInvoice() {
    let w: any = window.open();
    let html = $("#print_invoice").html();
    let htmlToPrint = '' +
    '<style type="text/css">' +
    'table {' +
      'border-collapse: collapse;' +
      '}</style>';
    w.document.write(htmlToPrint + html); //only part of the page to print, using jquery
    w.document.close(); //this seems to be the thing doing the trick
    w.focus();
    w.print();
    w.close();
  }
  getRecords() {
    this.recipeService
      .getInvoices({
        from: this.from
          ? this.from + " 00:00:00"
          : this.to
          ? this.to + " 00:00:00"
          : null,
        to: this.to ? this.to : this.from ? this.from + " 23:59:59" : null,
        invoice_no: this.invoice_no ? this.invoice_no : null,
        reference_no: this.reference_no ? this.reference_no : null,
        location_id: this.location_id ? this.location_id : null,
        is_active: this.is_active,
        sort_by: this.sortBy,
        sort_order: this.sortOrder,
        q: this.is_export ? 'all' : ''
      }, this.currentPage)
      .subscribe(
        (response: any) => {
          if (response.data && ((response.data.data && response.data.data.length > 0) || response.data.length > 0)) {
            if (response.data.data && response.data.data.length > 0) {
              this.invoices = response.data.data;
              this.page = response.data.current_page;
              this.lastPage = response.data.total;
            } else  {
              this.invoices = response.data;
            }
          } else {
            this.invoices = [];
            this.page = 0;
            this.lastPage = 0;
          }
          if (this.is_export === '1') {
            if (this.invoices) {
              this.export();
            } else {
              Swal.fire("Export", "No Records", "success");
            }
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  clearInvoices() {
    this.invoices = [];
  }
  export() {
    this.showLoading();
    setTimeout(() => {
      setTimeout(() => {
        TableUtil.exportTableToExcel("invoice_summary_report", "import", true);
        setTimeout(() => {
          this.clearLoading();
        }, 1000);
      }, 1000);
    }, 1000);
  }
  cancelBill(sale: any) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Cancel!",
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
          this.showLoading();
          if (result.isConfirmed) {
            this.recipeService
          .cancelBill({
            id: sale.id,
            location_id: sale.location_id,
            notes: result.value
          })
          .subscribe(
            (response: any) => {
              this.clearLoading();
              if (response.status === 'success') {
                Swal.fire("Saved!", response.message, "success");
                sale.is_active = 0;
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Oops...",
                  text: response.message
                });
              }
            },
            (err: any) => {
              this.networkIssue();
            }
          );
          }
        });

      }
    });
  }
}
