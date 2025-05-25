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
  templateUrl: './billing-new.component.html',
  styleUrls: ['./billing-new.component.scss']
})
export class BillingNewComponent extends BaseComponent implements OnInit {
  @ViewChild("spreadsheet", { static: false }) spreadsheet!: ElementRef<any>;
  @ViewChildren('cellInput') cellInputs!: QueryList<ElementRef>;
  spreadsheetInstance: any;
  locations: any = [];
  isShowLocation: any;
  tableForm: FormGroup;
  // Track filtered options for each row
  filteredProducts: string[][] = [];
  activeDropdownIndex: number | null = null;
  activeOptionIndex: number[] = [];
  public unitNames: any = [];
  public products: any = [];
  public carts: any = [];
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
  constructor(
    public recipeService: RecipeService,
    public router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    super(recipeService, router);
    this.tableForm = this.fb.group({
      rows: this.fb.array([])
    });
    this.addRow(); // initialize with one row
  }
  get rows() {
    return this.tableForm.get('rows') as FormArray;
  }

  addRow() {
    const row = this.fb.group({
      product_id: [''],
      product_name: [''],
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

  onProductInput(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    const filtered = this.productsname;
    this.filteredProducts[index] = this.productsname
      .filter((p: any) => p.toLowerCase().includes(value));
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
        purchase_price: product.purchase_price
      });
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
        const selected = options[this.activeOptionIndex[index]];
        if (selected) {
          this.selectProduct(index, selected);
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
        //const totalTax = totalNetPrice * (price.selling_CGST_percentage + price.selling_SGST_percentage + price.selling_IGST_percentage + price.selling_cess_percentage) / 100;
        const totalTax = price.selling_CGST_percentage + price.selling_IGST_percentage + price.selling_SGST_percentage + price.selling_cess_percentage
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
  }
  saveInvoice() {
    this.showLoading();
    let order = {
        location_id: this.selectedLocation.id,
        order_type_id: 1, // Assuming 1 is the order type for retail
        payment_mode_id: 1, // Assuming 1 is the payment mode for cash
        carts: this.tableForm.value.rows,
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
        total: +this.totalBillAmount
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
                  this.printInvoice();
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
  printInvoice() {
    console.log('Method not implemented.');
  }
  orderInvoice(isDraft?: boolean) {
    this.showLoading();
    let order = {
        location_id: this.selectedLocation.id,
        order_type_id: 1, // Assuming 1 is the order type for retail
        payment_mode_id: 1, // Assuming 1 is the payment mode for cash
        details: this.tableForm.value.rows,
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
      },
        (err: any) => {
          this.networkIssue();
        });
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
    }
  }
  locationSelectionChanged(e: any) {
    if (e && e.value && e.value.id) {
      this.selectedLocation = e.value;
    }
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
            this.unitNames = [...new Set(this.unitNames)];
            this.unitNames.sort((a: any, b: any) => a.name.localeCompare(b.name));
            this.filteredProducts = JSON.parse(JSON.stringify(this.productsname));
            this.activeOptionIndex.push(-1); // no item selected
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
        }
      );
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

}
