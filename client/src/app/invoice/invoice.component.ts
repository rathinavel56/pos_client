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
  cartData: any;
  totalQty: any = 0;
  hostName: any;
  userDetail: any;
  billTotalRound: number = 0;
  SGST: any;
  CGST: any;
  IGST: any;
  cess: any;
  totalBillAmount: any;
  billTotaldue: number = 0;
  carts: any;
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
  saveReturn() {
    let returnItems = this.invoiceDetail.details.filter((e: any) => e.return === true && +e.added_quantity > 0);
    if (returnItems.length === 0) {
      Swal.fire("Return", "Please select at least one item to return", "warning");
      return;
    }
    this.showLoading();
    let order = {
        details: this.carts,
        SGST_amount: +this.SGST,
        CGST_amount: +this.CGST,
        IGST_amount: +this.IGST,
        cess_amount: +this.cess,
        roundoff: +this.billTotalRound,
        total: +this.totalBillAmount,
        location_id: this.invoiceDetail.location_id,
      };
      this.recipeService
          .returnStocks(order)
          .subscribe(() => {
            Swal.fire(
              'Saved',
              'Your Return Order has been saved.',
              'success'
            );
            this.getInvoice(this.invoiceDetail, null);
            this.getRecords();
          });
  }
  getTotalAmount() {
    this.taxs = [];
    this.billTotalRound = 0;
    this.SGST = this.invoiceDetail.details.reduce((sum:any, row:any) => {
      return sum + (+row['SGST']);
    }, 0);
    this.CGST = this.invoiceDetail.details.reduce((sum:any, row:any) => {
      return sum + (+row['CGST']);
    }, 0);
    this.IGST = this.invoiceDetail.details.reduce((sum:any, row:any) => {
      return sum + (+row['IGST']);
    }, 0);
    this.cess = this.invoiceDetail.details.reduce((sum:any, row:any) => {
      return sum + (+row['cess']);
    }, 0);
    this.totalBillAmount = this.invoiceDetail.details.reduce((sum:any, row:any) => {
      return sum + (+row['total']);
    }, 0) + +this.invoiceDetail.parcel_charge;
    this.billTotalRound = Math.round(this.totalBillAmount) - this.totalBillAmount;
    this.billTotaldue = Math.round(this.totalBillAmount);
    if (this.totalBillAmount > 0) {
      this.invoiceDetail.details.forEach((row: any) => {
        if (row.total_tax_percentage > 0) {
          let existingTaxIndex = this.taxs.findIndex((tax: any) => tax.name === row.total_tax_percentage);
          let total_tax_amount = row.SGST + row.CGST + row.IGST + row.cess;
          if (existingTaxIndex > -1) {
            this.taxs[existingTaxIndex].SGST += row.SGST;
            this.taxs[existingTaxIndex].CGST += row.CGST;
            this.taxs[existingTaxIndex].IGST += row.IGST;
            this.taxs[existingTaxIndex].cess += row.cess;
            this.taxs[existingTaxIndex].total_tax_amount += row.SGST + row.CGST + row.IGST + row.cess;
            this.taxs[existingTaxIndex].total_net_price += row.total_net_price;
            this.taxs[existingTaxIndex].total += row.total_net_price + total_tax_amount;
          } else {
            this.taxs.push({name: row.total_tax_percentage,
              SGST: row.SGST,
              CGST: row.CGST,
              IGST: row.IGST,
              cess: row.cess,
              total_tax_amount: row.total_tax_amount,
              total_net_price: row.total_net_price,
              total : row.total_net_price + total_tax_amount,
              total_tax_percentage: row.total_tax_percentage
            })
          }
        }
       });
    }
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
            this.invoiceDetail.details.forEach((el: any) => {
                el.return = false;
                el.product_name = el.product.name;
                el.product_name_tamil = el.product.tamil_name;
                el.hsn_code = el.product.hsn_code;
                el.added_quantity = +el.quantity;
                el.total_tax_percentage = +el.CGST_percentage + +el.SGST_percentage + +el.IGST_percentage + +el.cess_percentage;
                el.total_net_price = +el.selling_price * +el.added_quantity;
                el.return_quantity = 0;
                el.SGST = +el.SGST_percentage ? (+el.SGST_percentage * el.total_net_price / 100) : 0;
                el.CGST = +el.CGST_percentage ? (+el.CGST_percentage * el.total_net_price / 100) : 0;
                el.IGST = +el.IGST_percentage ? (+el.IGST_percentage * el.total_net_price / 100) : 0;
                el.cess = +el.cess_percentage ? (+el.cess_percentage * el.total_net_price / 100) : 0;
              });
            if (content !== null) {
              this.modalReference = this.modalService.open(content);
              let popUp = document.querySelector(".modal-dialog");
              if (popUp) {
                popUp.classList.remove("modal-dialog");
              }
              this.modalReference.result.then(() => { });
            }

            this.setPrintData();
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
  printInvoice() {
    let w: any = window.open();
    let html = $("#print_invoice").html();
    let htmlToPrint =
      `<style type="text/css">body {
      font-family: 'Arial', sans-serif;
      margin: 20px;
      font-size: 14px;
    }
    h2, h4, p {
      margin: 0;
      text-align: center;
    }
    .header, .footer {
      text-align: center;
    }
    .info, .summary {
      margin-top: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border-bottom: 1px dashed #000;
      padding: 5px;
      text-align: center;
    }
    .no-border td {
      border: none;
    }
    .bold {
      font-weight: bold;
    }</style>`;
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
  checkReturnStock(details: any) {
    setTimeout(() => {
      if (+details.return_quantity > +details.quantity) {
        details.return_quantity = details.quantity;
      }
      details.is_active = (+details.return_quantity !== +details.quantity);
      details.added_quantity = details.quantity - details.return_quantity;

        let totalNetPrice = details.added_quantity * details.selling_price;
        details.total_tax_percentage = +details.CGST_percentage + +details.SGST_percentage + +details.IGST_percentage + +details.cess_percentage;
        const totalTax = totalNetPrice * (details.total_tax_percentage / 100);
        const totalAmount = totalNetPrice + totalTax;
        details.total_net_price = totalNetPrice,
        details.total_tax_amount = totalTax,
        details.total = totalAmount,
        details.SGST = +details.SGST_percentage ? (+details.SGST_percentage * details.total_net_price / 100) : 0;
        details.CGST = +details.CGST_percentage ? (+details.CGST_percentage * details.total_net_price / 100) : 0;
        details.IGST = +details.IGST_percentage ? (+details.IGST_percentage * details.total_net_price / 100) : 0;
        details.cess = +details.cess_percentage ? (+details.cess_percentage * details.total_net_price / 100) : 0;
        this.setPrintData();
    }, 0);


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
  setPrintData() {
    this.getTotalAmount();
    this.carts = JSON.parse(JSON.stringify(this.invoiceDetail.details));
    this.totalQty = this.carts.reduce(
      (accumulator: any, current: any) =>
        accumulator + parseFloat(current.added_quantity),
      0
    );
    this.cartData = {
      name: this.invoiceDetail.location.name,
      address: this.invoiceDetail.location.address,
      phone_no: this.invoiceDetail.location.phone_no,
      message: this.invoiceDetail.location.message,
      gstin: this.invoiceDetail.location.gstin,
      fssai_no: this.invoiceDetail.location.fssai_no,
      invoice_no: this.invoiceDetail.invoice_no,
      invoice_date: this.invoiceDetail.updated_at,
      customer: this.invoiceDetail.customer,
      details: this.carts,
      billTotalRound: this.billTotalRound,
      billTotaldue: this.billTotaldue,
      totalBillAmount: this.totalBillAmount,
      parcelCharge: this.invoiceDetail.parcel_charge,
      taxs: this.taxs,
      totalQty: this.totalQty,
    };
  }
}
