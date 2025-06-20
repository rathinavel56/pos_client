import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../base.component';
import { RecipeService } from '../shared/service/recipe.service';
import Swal from 'sweetalert2';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-billing-new',
  templateUrl: './billing.component.html'
})
export class BillingComponent extends BaseComponent implements OnInit {
  @ViewChild("spreadsheet", { static: false }) spreadsheet!: ElementRef<any>;
  @ViewChildren('cellInput') cellInputs!: QueryList<ElementRef>;
  spreadsheetInstance: any;
  locations: any = [];
  isShowLocation: any;
  tableForm: FormGroup = new FormGroup({});
  cartData: any;
  filteredProducts: string[][] = [];
  activeDropdownIndex: number | null = null;
  activeOptionIndex: number[] = [];
  public unitNames: any = [];
  public products: any = [];
  public carts: any = [];
  totalQty: any = 0;
  public productsname: any = [];
  userDetail: any;
  isStart: any;
  selectedLocation: any;
  config: any;
  totalBillAmount: number = 0;
  SGST: any;
  CGST: any;
  IGST: any;
  cess: any;
  invoice_no: any;
  invoice_date: any;
  formData: any;
  modalReference: any;
  printData: any;
  customerdetail: any = {
    customer_name: "",
    customer_email: "",
    customer_city: "",
    customer_dob: "",
    customer_gender: "",
    customer_address: ""
  };
  mobile: any = "";
  customerRes: any;
  customer: any;
  order: any;
  query = '';
  showSuggestions = false;
  filteredOptions: string[] = [];
  taxs: any = [];
  billTotalRound: number = 0;
  billTotaldue: number = 0;
  translations: any = [];
  constructor(
    public recipeService: RecipeService,
    public router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    super(recipeService, router);
  }
  ngOnInit(): void {
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
    this.userDetail = sessionStorage.getItem("retail_pos")
      ? JSON.parse(sessionStorage.getItem("retail_pos") || "{}")
      : null;
    if (this.userDetail) {
      this.isShowLocation = this.userDetail.session_detail.location_id == 0;
    }
    if (this.isShowLocation) {
      this.getLocations();
    } else {
      this.selectedLocation = this.userDetail.session_detail.location;
      this.resetBilling();
    }
    this.getTranslations();
  }
  get rows() {
    return this.tableForm.get('rows') as FormArray;
  }

  getTranslations() {
    this.recipeService.getTranslations({
          language_id: 1,
        })
        .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            response.data.forEach((item: any) => {
              this.translations[item.key_text] = item.value;
            });
          }
         });
  }

  addRow() {
    const row = this.fb.group({
      product_id: [''],
      product_name: [''],
      hsn_code: [''],
      product_name_tamil: [''],
      product_stock: [''],
      unit_size: [''],
      unit_quantity: [''],
      added_quantity: [''],  //D
      mrp_selling_price:[''], //D
      selling_price: [''],
      total_net_price: [''],
      selling_SGST_percentage: [''],
      selling_CGST_percentage: [''],
      selling_IGST_percentage: [''],
      selling_cess_percentage: [''],
      total_tax: [''],
      purchase_price: [''],
      total: [''],
      SGST: [''],
      CGST: [''],
      IGST: [''],
      cess: ['']
    });
    this.rows.push(row);
  }

  removeRow(index: number) {
    this.rows.removeAt(index);
    this.filteredProducts.splice(index, 1);
    this.activeOptionIndex.splice(index, 1);
  }

  logData() {
    console.log(this.tableForm.value);
  }
  onSearch() {
    const lowerQuery = this.query.toLowerCase();
    this.filteredOptions = this.products.filter(
      (item: any) => item.name.toLowerCase().includes(lowerQuery)
    );
  }

  selectOption(item: any) {
    this.query = item.name;
    this.showSuggestions = false;
  }

  hideSuggestions() {
    // Delay hiding to allow click event on suggestion
    setTimeout(() => {
      this.showSuggestions = false;
      this.activeDropdownIndex = null; // hide dropdown
    }, 200);
  }

  onProductInput(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    const filtered = this.productsname;
    this.filteredProducts[index] = this.products
      .filter((p: any) => p.name.toLowerCase().includes(value));
    this.activeDropdownIndex = index;
    this.activeOptionIndex[index] = filtered.length ? 0 : -1;
  }

  selectProduct(index: number, productName: string) {
    const product = this.products.find((item: any) => item.name === productName);
    if (product) {
      this.rows.at(index).patchValue({
        product_id: product.product_id,
        product_name: product.name,
        product_name_tamil: product.tamil_name, // Assuming you want to set this later
        product_stock: product.quantity,
        purchase_price: product.purchase_price,
        hsn_code: product.hsn_code
      });
      if  (!this.tableForm.value.rows[index].unit_size) {
        let defaultPrice = product.prices.find((e: any) => e.is_default === true);
        if (defaultPrice) {
          this.rows.at(index).patchValue({
            unit_size: defaultPrice.unit_id
          });
        }
      }
      this.filteredProducts[index] = [];
      this.activeDropdownIndex = null;
      this.activeOptionIndex[index] = -1;
    }
  }
  // Handles tab key and focuses next input
  handleKeyDown(event: KeyboardEvent, index: number) {
    const inputs = this.cellInputs.toArray();
    const current = event.target as HTMLElement;
    const currentIndex = inputs.findIndex(el => el.nativeElement === current);
    if (this.activeDropdownIndex === index && this.filteredProducts[index]?.length) {
      const options = this.filteredProducts[index];
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.activeOptionIndex[index] = (this.activeOptionIndex[index] + 1) % options.length;
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.activeOptionIndex[index] = (this.activeOptionIndex[index] - 1 + options.length) % options.length;
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const selected: any = options[this.activeOptionIndex[index]];
        if (selected) {
          this.selectProduct(index, selected.name);
        }
        return;
      }
    }
    if (event.key === 'Tab') {
      event.preventDefault();

      if (event.shiftKey) {
        // Shift + Tab: move backward
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
          inputs[prevIndex].nativeElement.focus();
        }
      } else {
        // Tab: move forward
        const nextIndex = currentIndex + 1;
        if (nextIndex < inputs.length) {
          inputs[nextIndex].nativeElement.focus();
        } else {
          // Last cell, add row and move to first input
          this.addRow();
          setTimeout(() => {
            const updatedInputs = this.cellInputs.toArray();
            updatedInputs[nextIndex]?.nativeElement.focus();
          }, 0);
        }
      }
      this.activeDropdownIndex = null; // hide dropdown
    }
  }

  unitSelection(index: number) {
    const productId = this.tableForm.value.rows[index].product_id;
    const unitId = this.tableForm.value.rows[index].unit_size;
    const product = this.products.find((item: any) => item.product_id === productId);
    if (product) {
      const price = product.prices.find((item: any) => item.unit_id === +unitId);
      this.rows.at(index).patchValue({
        mrp_selling_price: price.mrp_selling_price,
      });
    }
  }

  totalCalculation(index: number) {
    const productId = this.tableForm.value.rows[index].product_id;
    const unitId = this.tableForm.value.rows[index].unit_size;
    const unitQuantity = this.tableForm.value.rows[index].unit_quantity;
    const product = this.products.find((item: any) => item.product_id === productId);
    if (product) {
      const price = product.prices.find((item: any) => item.unit_id === +unitId);
      if (price) {
        const totalNetPrice = unitQuantity * price.selling_price;
        const totalTax = totalNetPrice * (price.selling_CGST_percentage + price.selling_SGST_percentage + price.selling_IGST_percentage + price.selling_cess_percentage) / 100;
        //const totalTax = price.selling_CGST_percentage + price.selling_IGST_percentage + price.selling_SGST_percentage + price.selling_cess_percentage
        const totalAmount = totalNetPrice + totalTax;
        this.rows.at(index).patchValue({
          selling_price: totalNetPrice,
          total_net_price: totalNetPrice,
          unit_size: price.unit.id,
          added_quantity: unitQuantity * +price.unit_quantity,
          selling_SGST_percentage: price.selling_SGST_percentage,
          selling_CGST_percentage: price.selling_CGST_percentage,
          selling_IGST_percentage: price.selling_IGST_percentage,
          selling_cess_percentage: price.selling_cess_percentage,
          total_tax: totalTax,
          total: totalAmount,
          SGST: +price.selling_SGST_percentage ? (+price.selling_SGST_percentage * totalNetPrice / 100) : 0,
          CGST: +price.selling_CGST_percentage ? (+price.selling_CGST_percentage * totalNetPrice / 100) : 0,
          IGST: +price.selling_IGST_percentage ? (+price.selling_IGST_percentage * totalNetPrice / 100) : 0,
          cess: +price.selling_cess_percentage ? (+price.selling_cess_percentage * totalNetPrice / 100) : 0,
        });
      }
    }
    this.getTotalAmount();
  }
  getTotalAmount() {
    this.taxs = [];
    this.billTotalRound = 0;
    this.SGST = this.rows.controls.reduce((sum, row) => {
      return sum + (+row.get('SGST')?.value || 0);
    }, 0);
    this.CGST = this.rows.controls.reduce((sum, row) => {
      return sum + (+row.get('CGST')?.value || 0);
    }, 0);
    this.IGST = this.rows.controls.reduce((sum, row) => {
      return sum + (+row.get('IGST')?.value || 0);
    }, 0);
    this.cess = this.rows.controls.reduce((sum, row) => {
      return sum + (+row.get('cess')?.value || 0);
    }, 0);
    this.totalBillAmount = this.rows.controls.reduce((sum, row) => {
      return sum + (+row.get('total')?.value || 0);
    }, 0);
    this.billTotalRound = Math.round(this.totalBillAmount) - this.totalBillAmount;
    this.billTotaldue = Math.round(this.totalBillAmount);
    if (this.totalBillAmount > 0) {
      this.tableForm.value.rows.forEach((row: any) => {
        if (row.total_tax > 0) {
          let existingTaxIndex = this.taxs.findIndex((tax: any) => tax.total_tax === row.total_tax);
          if (existingTaxIndex > -1) {
            this.taxs[existingTaxIndex].SGST += row.SGST;
            this.taxs[existingTaxIndex].CGST += row.CGST;
            this.taxs[existingTaxIndex].IGST += row.IGST;
            this.taxs[existingTaxIndex].cess += row.cess;
            this.taxs[existingTaxIndex].total_tax_value += row.SGST + row.CGST + row.IGST + row.cess;
            this.taxs[existingTaxIndex].total_net_price += row.total_net_price;
            this.taxs[existingTaxIndex].total += row.total_net_price + this.taxs[existingTaxIndex].total_tax_value;
          } else {
            let total_tax = row.SGST + row.CGST + row.IGST + row.cess;
            this.taxs.push({
              SGST: row.SGST,
              CGST: row.CGST,
              IGST: row.IGST,
              cess: row.cess,
              total_tax: row.total_tax,
              total_tax_value: total_tax,
              total_net_price: row.total_net_price,
              total : row.total_net_price + total_tax
            })
          }
        }
       });
    }
    this.carts = JSON.parse(JSON.stringify(this.tableForm.value.rows));
    this.totalQty = this.carts.reduce(
      (accumulator: any, current: any) =>
        accumulator + parseFloat(current.added_quantity),
      0
    );
    this.cartData = {
      name: this.selectedLocation.name,
      address: this.selectedLocation.name,
      message: this.selectedLocation.name,
      gstin: this.selectedLocation.name,
      fssai_no: this.selectedLocation.name,
      invoice_no: this.selectedLocation.name,
      invoice_date: this.selectedLocation.name,
      customer: this.customer,
      carts: this.carts,
      billTotalRound: this.billTotalRound,
      billTotaldue: this.billTotaldue,
      taxs: this.taxs
    };
  }
  saveInvoice() {
    this.showLoading();
    this.carts = this.tableForm.value.rows.filter((p: any) => p.product_id !== '' );
    let order = {
        location_id: this.selectedLocation.id,
        order_type_id: 1, // Assuming 1 is the order type for retail
        payment_mode_id: 1, // Assuming 1 is the payment mode for cash
        carts: this.carts,
        parcel_charge: null,
        customer_id: this.customer ? this.customer.id : null,
        reference_no: null,
        is_take_away: true,
        SGST_amount: +this.SGST,
        CGST_amount: +this.CGST,
        IGST_amount: +this.IGST,
        cess_amount: +this.cess,
        discount_mloyal_amount: 0,
        discount_amount: 0,
        discount_percentage: 0,
        roundoff: +this.billTotalRound,
        advance_amount: 0,
        total: +this.totalBillAmount,
      };
      this.recipeService
            .saveInvoice({
              billing: order
            })
            .subscribe(
              (response: any) => {
                this.clearLoading();
                if (response.status === "success") {
                  this.invoice_no = response.invoice_no;
                  this.invoice_date = response.invoice_datetime;
                  setTimeout(()=> {
                    this.printInvoice();
                  }, 0);
                  this.formReload();
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
  }
  orderInvoice(isDraft?: boolean) {

    this.showLoading();
    let order = {
        location_id: this.selectedLocation.id,
        order_type_id: 1, // Assuming 1 is the order type for retail
        payment_mode_id: 1, // Assuming 1 is the payment mode for cash1
        details: this.tableForm.value.rows.filter((p: any) => p.product_id !== '' ),
        parcel_charge: null,
        customer_id: null,
        reference_no: null,
        is_take_away: true,
        SGST_amount: +this.SGST,
        CGST_amount: +this.CGST,
        IGST_amount: +this.IGST,
        cess_amount: +this.cess,
        discount_mloyal_amount: 0,
        discount_amount: 0,
        discount_percentage: 0,
        roundoff: 0,
        advance_amount: 0,
        total: +this.totalBillAmount,
        is_draft: isDraft,
        delivery_date: formatDate(new Date(), 'yyyy-MM-dd', 'en-US'),
      };
    this.formData = new FormData();
    this.formData.append('data', JSON.stringify(order));
    this.recipeService.order(this.formData)
      .subscribe((response: any) => {
        this.clearLoading();
          Swal.fire(
            'Saved',
            'Your Order has been saved.',
            'success'
          );
        this.formReload();
      },
        (err: any) => {
          this.networkIssue();
        });
  }
  formReload() {
    this.tableForm = this.fb.group({
      rows: this.fb.array([])
    });
    this.addRow(); // initialize with one row
  }

  getOrders(isDraft: boolean = false, content: any) {
    if (this.selectedLocation && this.selectedLocation.id) {
      this.showLoading();
      this.recipeService
        .orders({
          location_id: this.selectedLocation.id,
          is_draft: isDraft,
          q: 'all',
          is_active: true
        }, null)
        .subscribe(
          (response: any) => {
            this.clearLoading();
            if (response.status === "success") {
              if (response.data && response.data.length > 0) {
                this.carts = response.data;
                 this.modalReference = this.modalService.open(content);
                 this.modalReference.result.then(() => { });
                setTimeout(() => {
                  document
                    .getElementsByClassName("modal-dialog")[0]
                    .setAttribute("class", "max-100");
                }, 0);
              } else {
                Swal.fire({
                  icon: "info",
                  title: "No Orders Found",
                  text: "There are no orders available.",
                });
              }
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
      Swal.fire({
        icon: "warning",
        title: "Select Location",
        text: "Please select a location to view orders.",
      });
    }

  }
  editCart(cart: any) {
    this.resetBilling(true);
    for (let i = 1; i <= cart.details.length; i++) {
     this.addRow();
    }
    cart.details.forEach((item: any, index: any) => {
      let prod = item.product;
      const product = this.products.find((item: any) => item.name === prod.name);
      this.rows.at(index).patchValue({
        product_id: prod.id,
        product_name: prod.name,
        product_name_tamil: prod.tamil_name,
        unit_size: prod.unit_id,
        product_stock: product ? product.quantity : 0,
        unit_quantity: item.quantity
      });
      this.performCalculations(index);
    });
    this.closePopUp();
  }
  performCalculations(index: number) {
    this.unitSelection(index);
    this.totalCalculation(index);
  }
  closePopUp() {
    if (this.modalReference) {
      this.modalReference.close();
    }
  }
  deleteCart(cartId:any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.showLoading();
        this.formData = new FormData();
        this.formData.append('data', JSON.stringify({
          location_id: this.selectedLocation.id,
          id: cartId,
          is_active: false,
          notes: ''
        }));
        this.recipeService.order(this.formData)
          .subscribe((response: any) => {
            this.clearLoading();
            if (response.status === "success") {
              Swal.fire(
                'Deleted!',
                'Your cart has been deleted.',
                'success'
              );
              this.closePopUp();
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
          });
      }
    });

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
                  if (response.orders && response.orders.length > 0) {
                    this.orderResponseHandler(content, response);
                  } else {
                    this.customerResponseHandler(response);
                  }
                } else if (response.status === false) {
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
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Invalid Customer mobile",
          });
        }
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
         // this.modalReference = this.modalService.open(content);
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
  customerResponseHandler(response: any) {
      this.customer = response.data;
      this.order = response.order;
      let message = "Customer Name: " + response.data.customer_name;
      this.customerdetail = {
        customer_name: "",
        customer_email: "",
        customer_city: "",
        customer_dob: "",
        customer_gender: "",
        customer_address: ""
      };
  }
  locationSelectionChanged(e: any) {
    if (e && e.value && e.value.id) {
      this.selectedLocation = e.value;
    }
    this.resetBilling();
  }
  submit() {
    this.isStart = true;
    this.locationStock();
  }
  reload() {
    if (this.isShowLocation) {
      this.locationStock();
    } else {
      this.isStart = false;
      this.selectedLocation = null;
    }
  }
  locationStock() {
    this.showLoading();
    this.products = [];
    this.carts = [];
    this.unitNames = [];
    this.recipeService
      .locationStock({
        location_id: this.selectedLocation.id
      })
      .subscribe(
        (response: any) => {
          if (response.data && response.data.length > 0) {
            response.data.forEach((item: any) => {
              if (item.product_pos.prices.length > 0) {
                this.products.push({
                  name: item.product_pos.name,
                  tamil_name: item.product_pos.tamil_name,
                  product_id: item.product_pos.id,
                  brand_id: item.product_pos.brand.id,
                  brand_name: item.product_pos.brand.name,
                  category_id: item.product_pos.category.id,
                  category_name: item.product_pos.category.name,
                  quantity: item.quantity,
                  purchase_price: item.product_pos.purchase_price,
                  prices: item.product_pos.prices
                });
                item.product_pos.prices.forEach((ele: any) => {
                  this.unitNames.push({id: ele.unit.id,name: ele.unit.name});
                });
                this.productsname.push(item.product_pos.name);
              }
            });
            this.unitNames = this.removeDuplicatesUnits(this.unitNames);
            this.unitNames.sort((a: any, b: any) => a.name.localeCompare(b.name));
            this.filteredProducts = JSON.parse(JSON.stringify(this.products));
            this.activeOptionIndex.push(-1); // no item selected
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  removeDuplicatesUnits(arrValue: any[]) {
  const seen = new Map();
  return arrValue.filter(item => {
    if (!seen.has(item.name)) {
      seen.set(item.name, true);
      return true;
    }
    return false;
  });
}
  getLocations() {
    this.locations = [];
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

  mainMenu() {
    document.getElementById('main_menu')?.click();
  }

  resetBilling(isNotAddRow?: boolean) {
    this.tableForm = this.fb.group({
      rows: this.fb.array([])
    });
    if (!isNotAddRow) {
      this.addRow();
    }
  }
  saveCustomer() {
      this.showLoading();
      if (this.customerdetail.customer_name) {
        this.customerdetail.location_id = this.isShowLocation ? this.selectedLocation.id : undefined;
        this.customerdetail.customer_mobile = this.mobile;
        this.recipeService.saveCustomer(this.customerdetail)
          .subscribe((response: any) => {
            this.clearLoading();
            //this.carts.customer_id = response.data.id;
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
  clearBilling() {
    this.totalQty = 0;
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
    this.totalBillAmount = 0;
    this.SGST = 0;
    this.CGST = 0;
    this.IGST = 0;
  }
}
