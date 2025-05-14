import { TableUtil } from './../shared/util/tableUtil';
import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './reports.component.html'
})
export class ReportsComponent extends BaseComponent implements OnInit {
  reports: any;
  curDate: any;
  locations: any = [];
  locationsOg: any = [];
  location_id: any;
  location: any;
  vendor_id: any;
  vendorId: any;
  from: any;
  to: any;
  locationId: any;
  type_id: any = '0';
  config: any;
  gst: any;
  isShowLocation: any = false;
  centralLocationId: any = '';
  from_location_id: any = '';
  category_id: any;
  isGst: any = false;
  search_filter : any = 0;
  request_no: any = '';
  searchBy: any = [{
    id: 0,
    name: 'All'
  },{
    id: 1,
    name: 'Both Product & Receipe'
  },{
    id: 2,
    name: 'Product'
  },{
    id: 3,
    name: 'Receipe'
  }];
  types: any = [{
    id: 0,
    name: 'Incoming Stocks',
    admin: true
  },{
    id: 3,
    name: 'Daily Sales Report',
    admin: false
  },{
    id: 5,
    name: 'Sales Summary',
    admin: false
  },{
    id: 6,
    name: 'Sales Details Summary',
    admin: false
  },{
    id: 6.1,
    name: 'Sales Item Wise Details Summary',
    admin: false
  }, {
    id: 17,
    name: 'Settlement Mode Wise Sale Report',
    admin: true
  },{
    id: 7,
    name: 'Sales Discount Summary',
    admin: false
  }, {
    id: 7.1,
    name: 'Bill Wise Report',
    admin: true
  }, {
    id: 9,
    name: 'Reported Wastage Report',
    admin: false
  }, {
    id: 10,
    name: 'Delivery Mismatch Report',
    admin: false
  }, {
    id: 14,
    name: 'Item Wise Sales Details',
    admin: false
  }, {
    id: 15,
    name: 'Sold Out Timing Report',
    admin: true
  }, {
    id: 19,
    name: 'Outlet Current Stock Report',
    admin: true
  }, {
    id: 22,
    name: 'Weekly Category Wise Sale Report',
    admin: true
  }];
  products: any = [];
  receipes: any = [];
  categories: any = [];
  productId: any = '';
  receipeId: any = '';
  product_id: any = [];
  orderTotal: any = '';
  orderCnt: any = '';
  receipe_id: any = [];
  centralLocations: any = [];
  orderType: any = [];
  userDetail: any;
  vendors: any = [];
  vendorLoaded: boolean = false;
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.types.sort((a : any, b : any) => a.name - b.name);
    this.userDetail = sessionStorage.getItem('hotbread') ? JSON.parse(sessionStorage.getItem('hotbread') || '{}') : null;
    this.isShowLocation = (this.userDetail.session_detail.location_id== 0);
    if (!this.isShowLocation) {
      this.types = this.types.filter((e: any)=> (e.admin === false));
      this.location = this.userDetail.session_detail.location;
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
    this.getLocations();
    if (this.isShowLocation) {
      this.getCentralLocations();
    }
    this.getProductList();
    this.getVendors();
    this.getReceipeList();
    this.getCategories();
  }
  exportTable() {
    this.getRecords();
  }
  productChanged(e: any) {
    if (e.value) {
      this.product_id = [];
      e.value.forEach((element: any) => {
        this.product_id.push(element.id);
      });
    } else {
      this.product_id = [];
    }
  }
  receipeChanged(e: any) {
    if (e.value) {
      this.receipe_id = [];
      e.value.forEach((element: any) => {
        this.receipe_id.push(element.id);
      });
    } else {
      this.receipe_id = [];
    }
  }
  cancel() {
    this.typeChange();
    this.type_id = '0';
    this.category_id = null;
  }
  typeChange() {
    this.reports = [];
    this.location = '';
    this.location_id = '';
    this.vendor_id = '';
    this.orderTotal = '';
    this.orderCnt = '';
    this.vendorId = '';
    this.from = '';
    this.to = '';
    this.locationId = '';
    this.request_no = '';
    this.centralLocationId = '';
    this.from_location_id = '';
    this.productId = '';
    this.product_id = [];
    this.receipe_id = [];
    this.receipeId = '';
    this.isGst = false;
  }
  getProductList() {
    this.recipeService.getProductList()
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          let prod: any = [];
          prod.push({
            id: 0,
            name: 'All'
          });
          response.data.forEach((element: any) => {
            if (element.name && element.brand && element.brand.name) {
              element.name = element.name + ' (' + element.brand.name + ')';
              prod.push(element);
            }
          });
          this.products = prod;
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  getReceipeList() {
    this.recipeService.getRecipes({
      q: 'all'
    }, null)
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          this.receipes = response.data;
        } else {
          this.receipes = [];
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  getCategories()  {
    this.recipeService.getCategories({
      q: 'all'
    }, null)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.categories = response.data;
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getCentralLocations() {
    this.recipeService.getLocations({
      q: 'centralstocks'
    }, null)
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          let loc: any = [];
          loc.push({
            id: 0,
            name: 'All'
          });
          response.data.forEach((element: any) => {
            loc.push({
              id: element.id,
              name: element.name
            });
          });
          this.centralLocations = loc;
        } else {
          this.centralLocations = [];
        }
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  getRecords() {
    if (((this.type_id !== '2') && this.from && this.to) && (!this.isShowLocation || (this.isShowLocation || this.location_id)) || (this.type_id >= '19' && this.type_id <= '22')) {
      this.showLoading();
      let loc;
      if (this.type_id >= '19' && this.type_id <= '22') {
        loc = [];
        if (this.location_id && this.location_id.length > 0 && typeof(this.location_id) !== 'number') {
          this.location_id.forEach((element: any) => {
            loc.push(element.id);
          });
        } else {
          loc.push(this.location_id);
        }
      } else {
        loc = this.location_id;
      }
      this.recipeService.getReports({
        from_location_id: this.from_location_id,
        location_id: loc,
        vendor_id: this.vendor_id,
        category_id: this.category_id,
        from: this.from,
        to: this.to,
        type_id: +this.type_id,
        ingredients: this.product_id,
        receipe_id: this.receipe_id,
        isGst: this.isGst,
        request_no: this.request_no
      })
      .subscribe((response: any) => {
          if (response.data && (response.data.length > 0 || (this.type_id === '5' && (response.data && (response.data.start || (response.data.orders && response.data.orders.length > 0)))))) {
            if (this.product_id && this.product_id.length > 0 && !this.product_id.includes(0)) {
              let reportData: any = [];
              if (this.type_id === '0') {
                response.data.forEach((element: any) => {
                  element.stocks_incoming_details = element.stocks_incoming_details.filter((e: any) => (this.product_id.includes(e.product_id)));
                  reportData.push(element);
                });
              } else if (this.type_id === '1') {
                response.data.forEach((element: any) => {
                  element.stocks_outgoing_details = element.stocks_outgoing_details.filter((e: any) => (this.product_id.includes(e.product_id)));
                  reportData.push(element);
                });
              }
              this.reports = reportData;
            } else if (this.isGst) {
              this.reports = [];
              let gstPercentages: any = [];
              if (response.data && response.data.length > 0) {
                response.data.forEach((element: any) => {
                  element.stocks_incoming_details.forEach((stocks_incoming_detail: any) => {
                    let totalPer = (stocks_incoming_detail.CGST_percentage ? stocks_incoming_detail.CGST_percentage : 0) + (stocks_incoming_detail.IGST_percentage ? stocks_incoming_detail.IGST_percentage : 0) + (stocks_incoming_detail.SGST_percentage ? stocks_incoming_detail.SGST_percentage : 0) + (stocks_incoming_detail.cess_percentage ? stocks_incoming_detail.cess_percentage : 0);
                    gstPercentages.push({
                      name: totalPer,
                      total: 0
                    });
                  });
                });
                gstPercentages = gstPercentages.filter((v: any,i: any,a: any)=>a.findIndex((v2: any)=>(v2.name === v.name)) === i);
                gstPercentages.sort((a: any,b: any) => a.name - b.name);
              }
              this.reports = {
                gstPercentages: gstPercentages,
                data: []
              };
              if (response.data && response.data.length > 0) {
                response.data.forEach((element: any) => {
                  let discountAmount: any = 0;
                  let totalPer = 0;
                  gstPercentages = JSON.parse(JSON.stringify(this.reports.gstPercentages));
                  element.stocks_incoming_details.forEach((stocks_incoming_detail: any) => {
                    discountAmount += (stocks_incoming_detail.discount_amount > 0 ? stocks_incoming_detail.discount_amount : 0);
                    totalPer = (stocks_incoming_detail.CGST_percentage ? stocks_incoming_detail.CGST_percentage : 0) + (stocks_incoming_detail.IGST_percentage ? stocks_incoming_detail.IGST_percentage : 0) + (stocks_incoming_detail.SGST_percentage ? stocks_incoming_detail.SGST_percentage : 0) + (stocks_incoming_detail.cess_percentage ? stocks_incoming_detail.cess_percentage : 0);
                    if (totalPer > 0) {
                      let gstPercentageIndex: any = gstPercentages.findIndex((gstPercentage: any) => gstPercentage.name === totalPer);
                      gstPercentages[gstPercentageIndex].total += (((+totalPer)/100) * ((stocks_incoming_detail.number_of_units * stocks_incoming_detail.cost_per_unit)- (stocks_incoming_detail.discount_amount > 0 ? stocks_incoming_detail.discount_amount : 0)));
                    }
                  });
                  this.reports.data.push({
                    vendor: element.vendor,
                    invoice_date: element.invoice_date,
                    invoice_number: element.invoice_number,
                    gst: gstPercentages,
                    discount_amount: discountAmount,
                    total: element.total
                  });
                });
              }
            } else if (this.type_id === '12' || this.type_id === '12.1') {
              let per = 0;
              if (response.data && response.data.length > 0) {
                response.data.forEach((e: any) => {
                  e.totalAll = 0;
                  e.SGSTAll = 0;
                  e.CGSTAll = 0;
                  e.IGSTAll = 0;
                  e.cessAll = 0;
                  e.lineTotalAll = 0;
                  e.totalQty = 0
                  e.taxs = [];
                  e.taxTotal = 0;
                  e.categories = [];
                  e.request_outlet_details_approved.forEach((item: any) => {
                    item.dc_quantity = +((item.order_status_id < 6) ? item.approved_quantity : item.pickup_quantity);
                    if (item.dc_quantity > 0) {
                      per = 0;
                      let title = '';
                      let perIndex;
                      if (+item.price === 0 && item.receipe) {
                        item.price = ((item.receipe.manufacturing_price ? item.receipe.manufacturing_price.price : (item.receipe.price && item.receipe.price.length > 0) ? item.receipe.price[0].price : 0));
                      }
                      item.total = (item.dc_quantity * item.price);

                      per = ((item.product ? ((item.price > 0) ? (item.SGST_percentage ? item.SGST_percentage : 0) : 0) : ((item.receipe.price && item.receipe.price.length > 0) ? item.receipe.price[0].selling_SGST_percentage : 0)));
                      item.SGST = ((per > 0) ? ((per / 100) * item.total).toFixed(2) : 0);

                      if (per > 0) {
                        title = 'SGST @ ' + per + '%';
                        perIndex = e.taxs.findIndex((pi: any) => (pi.name === title));
                        if (perIndex > -1) {
                          e.taxs[perIndex].amount += +item.SGST;
                        } else {
                          e.taxs.push({
                            name: title,
                            amount: +item.SGST
                          });
                        }
                      }

                      per = ((item.product ? ((item.price > 0) ? (item.CGST_percentage ? item.CGST_percentage : 0) : 0) : ((item.receipe.price && item.receipe.price.length > 0) ? item.receipe.price[0].selling_CGST_percentage : 0)));
                      item.CGST = ((per > 0) ? ((per / 100) * item.total).toFixed(2) : 0);

                      if (per > 0) {
                        title = 'CGST @ ' + per + '%';
                        perIndex = e.taxs.findIndex((pi: any) => (pi.name === title));
                        if (perIndex > -1) {
                          e.taxs[perIndex].amount += +item.CGST;
                        } else {
                          e.taxs.push({
                            name: title,
                            amount: +item.CGST
                          });
                        }
                      }

                      per = ((item.product ? ((item.price > 0) ? (item.IGST_percentage ? item.IGST_percentage : 0) : 0) : ((item.receipe.price && item.receipe.price.length > 0) ? item.receipe.price[0].selling_IGST_percentage : 0)));
                      item.IGST = ((per > 0) ? ((per / 100) * item.total).toFixed(2) : 0);

                      if (per > 0) {
                        title = 'IGST @ ' + per + '%';
                        perIndex = e.taxs.findIndex((pi: any) => (pi.name === title));
                        if (perIndex > -1) {
                          e.taxs[perIndex].amount += +item.IGST;
                        } else {
                          e.taxs.push({
                            name: title,
                            amount: +item.IGST
                          });
                        }
                      }

                      per = ((item.product ? ((item.price > 0) ? (item.cess_percentage ? item.cess_percentage : 0) : 0) : ((item.receipe.price && item.receipe.price.length > 0) ? item.receipe.price[0].selling_cess_percentage : 0)));
                      item.cess = ((per > 0) ? ((per / 100) * item.total).toFixed(2) : 0);

                      if (per > 0) {
                        title = 'CESS @ ' + per + '%';
                        perIndex = e.taxs.findIndex((pi: any) => (pi.name === title));
                        if (perIndex > -1) {
                          e.taxs[perIndex].amount += +item.cess;
                        } else {
                          e.taxs.push({
                            name: title,
                            amount: +item.cess
                          });
                        }
                      }
                      item.line_total = item.total + +item.SGST + +item.CGST + +item.IGST + +item.cess;
                      e.totalQty += +item.dc_quantity;
                      e.totalAll = e.totalAll + item.total;
                      e.SGSTAll = e.SGSTAll + +item.SGST;
                      e.CGSTAll = e.CGSTAll + +item.CGST;
                      e.IGSTAll = e.IGSTAll + +item.IGST;
                      e.cessAll = e.cessAll + +item.cess;
                      e.lineTotalAll += item.line_total;
                      let catName = item.product ? item.product.category.name : item.receipe.category.name;
                      let catIndex = e.categories.findIndex((ca: any) => (ca.name === catName));
                      item.name = item.product ? item.product.name : item.receipe.name;
                      if (catIndex > -1) {
                        e.categories[catIndex].data.push(item);
                      } else {
                        e.categories.push({
                          name: catName,
                          data: [item]
                        });
                      }
                    }
                  });
                  e.categories.sort((a: any,b: any) => a.name - b.name);
                  let sNo = 0;
                  e.categories.forEach((element: any) => {
                    element.data.sort((a: any,b: any) => a.name - b.name);
                    element.data.forEach((cat: any) => {
                      cat.sNo = sNo + 1;
                    });
                    if (this.type_id === '12') {
                      let priceAl = element.data.reduce(
                        (accumulator: any, current: any) =>
                          accumulator + parseFloat(current.price),
                        0
                      );
                      let dcQuantity = element.data.reduce(
                        (accumulator: any, current: any) =>
                          accumulator + parseFloat(current.dc_quantity),
                        0
                      );
                      let totalQuantity = element.data.reduce(
                        (accumulator: any, current: any) =>
                          accumulator + parseFloat(current.total),
                        0
                      );
                      let SGSTAl = element.data.reduce(
                        (accumulator: any, current: any) =>
                          accumulator + parseFloat(current.SGST),
                        0
                      );
                      let CGSTAl = element.data.reduce(
                        (accumulator: any, current: any) =>
                          accumulator + parseFloat(current.CGST),
                        0
                      );
                      let IGSTAl = element.data.reduce(
                        (accumulator: any, current: any) =>
                          accumulator + parseFloat(current.IGST),
                        0
                      );
                      let cessAl = element.data.reduce(
                        (accumulator: any, current: any) =>
                          accumulator + parseFloat(current.cess),
                        0
                      );
                      let lineTotalAl = element.data.reduce(
                        (accumulator: any, current: any) =>
                          accumulator + parseFloat(current.line_total),
                        0
                      );
                      element.data.push({
                        name: 'Total',
                        price: priceAl,
                        dc_quantity: dcQuantity,
                        total: totalQuantity,
                        SGST: SGSTAl,
                        CGST: CGSTAl,
                        IGST: IGSTAl,
                        cess: cessAl,
                        line_total: lineTotalAl
                      });
                    }
                  });
                  if (e.taxs && e.taxs.length > 0) {
                    e.taxTotal = e.taxs.reduce(
                      (accumulator: any, current: any) =>
                        accumulator + parseFloat(current.amount),
                      0
                    );
                  }
                });
                this.reports.data = response.data;
                this.curDate = new Date();
              } else {
                this.reports.data = [];
              }
            } else if (this.type_id === '1') {
              if (response.data && response.data.length > 0) {
                response.data.forEach((ele: any) => {
                  if (ele.request_outlet_details) {
                    ele.request_outlet_details.forEach((e: any) => {
                      if (e.product && +e.CGST_percentage === 0 && +e.IGST_percentage === 0 && +e.SGST_percentage === 0 && +e.cess_percentage === 0) {
                        if (e.product.price && e.product.price.length > 0) {
                          e.CGST_percentage = e.product.price[0].selling_CGST_percentage;
                          e.IGST_percentage = e.product.price[0].selling_IGST_percentage;
                          e.SGST_percentage = e.product.price[0].selling_SGST_percentage;
                          e.cess_percentage = e.product.price[0].selling_cess_percentage;
                        }
                      }
                    });
                  }
                });
              }
              this.reports = response.data;
              this.orderType = (response.orderType) ? response.orderType : [];
            } else if (this.type_id === '15') {
              let res: any = [];
              if (response.data && response.data.length > 0) {
                let i = 1;
                response.data.forEach((ele: any) => {
                    ele.data.forEach((e: any) => {
                      res.push({
                        no: i,
                        location_name: ele.title,
                        datetime: e.datetime,
                        title: e.subTitle,
                        category_name: e.category_name
                      });
                      i++;
                    });
                });
              }
              this.reports = res;
            } else if (this.type_id === '16') {
              let res: any = [];
              if (response.data && response.data.length > 0) {
                let i = 1;
                response.data.forEach((ele: any) => {
                    ele.details.forEach((e: any) => {
                      e.sno = i;
                      i++;
                    });
                });
              }
              this.reports = response.data;
            } else {
              this.reports = response.data;
              if (this.type_id === '5' && (response.data.orders && response.data.orders.length > 0)) {
                this.orderTotal = response.data.orders.reduce(
                  (accumulator: any, current: any) =>
                    accumulator + parseFloat(current.amount),
                  0
                );
                this.orderCnt = response.data.orders.reduce(
                  (accumulator: any, current: any) =>
                    accumulator + parseFloat(current.cnt),
                  0
                );
              }
              this.orderType = (response.orderType) ? response.orderType : [];
            }
            setTimeout(()=> {
              let dateInfo = ' ' + this.from + ((this.to && this.from !== this.to) ? ' to ' + this.to : '');
              if (this.type_id === '0') {
                TableUtil.exportTableToExcel("stocksIn", "Incoming Stocks" + dateInfo, true);
              } else if (this.type_id === '1' || this.type_id === '1.1' || this.type_id === '1.2' || this.type_id === '1.3' || this.type_id === '1.4') {
                TableUtil.exportTableToExcel("stocksOut", "Outlet Stocks Status" + dateInfo, true);
              } else if (this.type_id === '2') {
                TableUtil.exportTableToExcel("outletStocks", "Outlet Stocks" + dateInfo, true);
              } else if (this.type_id === '3') {
                TableUtil.exportTableToExcel("dailySalesReport", "Daily Sales Report" + dateInfo, true);
              } else if (this.type_id === '4') {
                TableUtil.exportTableToExcel("dailySalesReportCount", "Daily Sales Count Report" + dateInfo, true);
              } else if (this.type_id === '5') {
                this.printSummary('salesSummaryReport');
              } else if (this.type_id === '6') {
                TableUtil.exportTableToExcel("detailSalesReportCount", "Sales Details Summary Report" + dateInfo, true);
              } else if (this.type_id === '6.1') {
                TableUtil.exportTableToExcel("detailSalesItemReport", "Sales Item Wise Details Summary Report" + dateInfo, true);
              } else if (this.type_id === '7') {
                TableUtil.exportTableToExcel("discountSalesReportCount", "Sales Discount Summary Report" + dateInfo, true);
              } else if (this.type_id === '7.1') {
                TableUtil.exportTableToExcel("billWiseReport", "Bill Wise Report" + dateInfo, true);
              } else if (this.type_id === '8') {
                TableUtil.exportTableToExcel("commissaryProductionRequest", "Production Request Report" + dateInfo, true);
              } else if (this.type_id === '9') {
                TableUtil.exportTableToExcel("wastageClosing", "Wastage Closing Report" + dateInfo, true);
              } else if (this.type_id === '10') {
                TableUtil.exportTableToExcel("wastageRequest", "Wastage Request Report" + dateInfo, true);
              } else if (this.type_id === '11') {
                this.printSummary('pickuplist');
              } else if (this.type_id === '12') {
                this.printSummary('dcr');
              } else if (this.type_id === '12.1') {
                TableUtil.exportTableToExcel("dcrExcel", "DC Report" + dateInfo, true);
              } else if (this.type_id === '13') {
                TableUtil.exportTableToExcel("eod", "End Of Day Report" + dateInfo, true);
              } else if (this.type_id === '14') {
                TableUtil.exportTableToExcel("itemWiseSummary", "Item Wise Sales Details Report" + dateInfo, true);
              } else if (this.type_id === '15') {
                TableUtil.exportTableToExcel("itemWiseSoldOutTime", "Sold Out Timing Report" + dateInfo, true);
              } else if (this.type_id === '16') {
                TableUtil.exportTableToExcel("cakeOrderReport", "Cake Order Report" + dateInfo, true);
              } else if (this.type_id === '17') {
                TableUtil.exportTableToExcel("settlementModeWiseSaleReport", "Settlement Mode Wise Sale Report" + dateInfo, true);
              } else if (this.type_id === '18') {
                TableUtil.exportTableToExcel("mptrackingReport", "MP Tracker Report" + dateInfo, true);
              } else if (this.type_id === '19') {
                TableUtil.exportTableToExcel("stocksSource", "Outlet Available Report" + dateInfo, true);
              } else if (this.type_id === '20') {
                TableUtil.exportTableToExcel("stocksSource", "Confectionery Available Report" + dateInfo, true);
              } else if (this.type_id === '21') {
                TableUtil.exportTableToExcel("stocksSource", "Commissary Available Report" + dateInfo, true);
              } else if (this.type_id === '22') {
                TableUtil.exportTableToExcel("weeklyCategoryWiseSaleReport", "Weekly Category Wise Sale Report" + dateInfo, true);
              } else if (this.type_id === '23') {
                TableUtil.exportTableToExcel("billWiseFoodCost", "Bill wise food cost" + dateInfo, true);
              }
              this.clearLoading();
            }, 3000);
          } else {
            this.reports = [];
            this.clearLoading();
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'No Records Found'
            });
          }
        },
        (err: any) => {
          this.networkIssue();
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill the required fields'
      });
    }
  }
  printSummary(id: any) {
    let w: any = window.open();
    let html = $("#" + id).html();
    let htmlToPrint =
      "" +
      '<style type="text/css">' +
      "table {" +
      "border-collapse: collapse;" +
      "}</style>";
    if (this.type_id === '12') {
      htmlToPrint =
      '' +
        '<style type="text/css">@media print {' +
        '.page-break {' +
        'page-break-after: always;' +
        ' }' +
        '}' +
        'table, th, td {' +
        'border: 0.5px solid grey;' +
        'border-collapse: collapse;' +
        '}' +
        '</style>';
    }
    w.document.write(htmlToPrint + html); //only part of the page to print, using jquery
    w.document.close(); //this seems to be the thing doing the trick
    w.focus();
    w.print();
    w.close();
  }
  getLocations() {
    this.recipeService.getLocations({
      q: 'all'
    }, null)
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          let loc: any = [];
          loc.push({
            id: 0,
            name: 'All'
          });
          response.data.forEach((element: any) => {
            loc.push({
              id: element.id,
              name: element.name
            });
          });
          this.locations = loc;
          this.locationsOg = response.data;
        } else {
          this.locations = [];
          this.locationsOg = [];
        }
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  locationSelectionChanged(e: any) {
    if ((this.type_id >= '19' && this.type_id <= '22') && (e && e.value && e.value.length > 0)) {
      this.location_id = e.value;
    } else if (e && e.value && e.value.id && e.value.id > 0) {
      this.location_id = e.value.id;
      this.location = this.locationsOg.find((ele: any) => e.value.id === ele.id);
    } else {
      this.location_id = '';
      this.location = '';
    }
  }
  vendorChanged(e: any) {
    if (e && e.value && e.value.id && e.value.id > 0) {
      this.vendor_id = e.value.id;
    } else {
      this.vendor_id = '';
    }
  }
  centralLocationSelectionChanged(e: any) {
    if (e && e.value && e.value.id && e.value.id > 0) {
      this.from_location_id = e.value.id;
    } else {
      this.from_location_id = '';
    }
  }
  searchByChange() {
    setTimeout(()=> {
      if(this.search_filter === '0') {
        this.productId = '';
        this.product_id = [];
        this.receipe_id = [];
        this.receipeId = '';
      }
    }, 0)
  }
  getVendors() {
    this.recipeService.getVendors({
        q: 'all'
      }, null)
      .subscribe((response: any) => {
          this.vendorLoaded = true;
          if (response.data && response.data.length > 0) {
            this.vendors = response.data;
          } else {
            this.vendors = [];
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
}
