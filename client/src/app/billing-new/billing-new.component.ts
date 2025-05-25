import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent } from '../base.component';
import { RecipeService } from '../shared/service/recipe.service';
import jspreadsheet from "jspreadsheet-ce";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-billing-new',
  templateUrl: './billing-new.component.html',
  styleUrls: ['./billing-new.component.scss']
})
export class BillingNewComponent extends BaseComponent implements OnInit {
@ViewChild("spreadsheet", { static: false }) spreadsheet!: ElementRef<any>;
spreadsheetInstance: any;
locations: any = [];
isShowLocation: any;
  constructor(
    public recipeService: RecipeService,
        public router: Router,
        private modalService: NgbModal
  ) {
    super(recipeService, router);
  }
  public unitNames: any = [];
  public products: any = [];
  public carts: any = [];
  public productsname: any = [];
  userDetail: any;
  isStart: any;
  selectedLocation: any;
  config: any;
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
                    this.unitNames.push(ele.unit.name);
                  });
                  this.productsname.push(item.product_pos.name);
                }
               });
               this.unitNames = [...new Set(this.unitNames)];
               this.unitNames.sort((a: any, b:any) => a.localeCompare(b));
            }
            this.createSpreadsheet();
            this.clearLoading();
          },
          (err: any) => {
            this.networkIssue();
          }
        );
    }
  createSpreadsheet() {
    if (this.spreadsheet) {
      // Create the spreadsheet
      const self = this; // Capture 'this' context
      this.spreadsheetInstance = jspreadsheet(this.spreadsheet.nativeElement, {
        worksheets: [
          {
            data: [],
            minDimensions: [9, 1],
            allowInsertColumn: false,
            columns: [
              {
                type: 'dropdown',
                title: 'Product',
                autocomplete: true,
                width: 300,
                source: self.productsname
              },
              { type: 'text', title: 'Tamil name', width: 200 },
              { type: 'text', title: 'Stock', width: 100 },
              {
                type: 'dropdown', title: 'Unit', width: 100,
                source: self.unitNames
              },
              { type: 'text', title: 'Quantity', width: 100 },
              { type: 'text', title: 'MRP', width: 100, readOnly: true },
              { type: 'text', title: 'Net', width: 100, readOnly: true },
              { type: 'text', title: 'Tax', width: 100, readOnly: true },
              { type: 'text', title: 'Total Net', width: 100, readOnly: true }
            ]
          }
        ],
        onkeydown: (instance: any, cell: any, e: KeyboardEvent) => {
          if (e.key === 'Tab' || e.key === 'Enter') {
            e.preventDefault();
        
            const sel = instance.getSelectedCells();
            if (sel.length > 0) {
              const [row, col] = sel[0];
              const lastCol = instance.options.columns.length - 1;
              const lastRow = instance.getData().length - 1;
        
              if (col === lastCol) {
                if (row < lastRow) {
                  instance.setSelection([row + 1, 0]);
                } else {
                  instance.insertRow();
                  instance.setSelection([row + 1, 0]);
                }
              } else {
                instance.setSelection([row, col + 1]);
              }
            }
          }
        },
        onchange: function (instance: any, cell: any, col: any, row: any, value: any) {
          switch (col) {
            case '0': // Product column
              self.addProduct(instance, cell, col, row, value);
            break;
            case '3': // unit name column
              self.chooseUnit(instance, cell, col, row, value);
            break;
            case '4': // Quantity column
              self.chooseQuantity(instance, cell, col, row, value);
            break;
          }
        }
      } as any);
    }

  }
  addProduct(instance: any, cell: any, col: any, row: any, value: any) {
    const product = this.products.find((item: any) => item.name === value);
    if (product) {
      instance.setValueFromCoords(1, row, '');
      instance.setValueFromCoords(2, row, product.quantity);
      instance.setValueFromCoords(3, row, '');
      instance.setValueFromCoords(4, row, '');
      instance.setValueFromCoords(5, row, '');
      instance.setValueFromCoords(6, row, '');
      instance.setValueFromCoords(7, row, '');
      instance.setValueFromCoords(8, row, '');
    }
  }
  chooseUnit(instance: any, cell: any, col: any, row: any, unit: any) {
    const productDetails = this.validateProducts(instance, row);
    if (!productDetails) {
      return false;
    }
    return true;
  }
  chooseQuantity(instance: any, cell: any, col: any, row: any, value: any) {
    const productDetails = this.validateProducts(instance, row);
    if (!productDetails) {
      return false;
    }
    const quantity = parseFloat(value);
    if (isNaN(quantity) || quantity <= 0) {
      Swal.fire('Error', 'Invalid quantity', 'error');
      this.clearAmountFields(instance, row);
      return false;
    } else {
      // Calculate the net amount based on the selling price and quantity
      const netAmount = quantity * productDetails.price.selling_price;
      instance.setValueFromCoords(6, row, netAmount.toFixed(2));
      // Calculate the tax amount based on the tax percentage
      let taxAmount = 0;
      let tax_percentage = productDetails.price.selling_CGST_percentage + productDetails.price.selling_IGST_percentage + productDetails.price.selling_SGST_percentage +  productDetails.price.selling_cess_percentage;
      if (tax_percentage > 0) {
        taxAmount = (netAmount * productDetails.price.tax_percentage) / 100;
        instance.setValueFromCoords(7, row, taxAmount.toFixed(2));
      } else {
        instance.setValueFromCoords(7, row, '0.00');
      }
      instance.setValueFromCoords(8, row, netAmount + taxAmount);

      return true;
    }
  }
  getMrpPrice(instance: any, productDetails: any, row: any) {
    if (productDetails && productDetails.price) {
      instance.setValueFromCoords(5, row, productDetails.price.mrp_selling_price);
    } else {
      instance.setValueFromCoords(5, row, '');
    }
  }

  clearAmountFields(instance: any, row: any) {
    instance.setValueFromCoords(5, row, ''); // MRP
    instance.setValueFromCoords(6, row, ''); // Net
    instance.setValueFromCoords(7, row, ''); // Tax
    instance.setValueFromCoords(8, row, ''); // Total Net
  }

  validateProducts(instance: any, row: any) {
    const productName = instance.getValueFromCoords(0, row);
    const product = this.products.find((item: any) => item.name === productName);
    let price = null;
    this.clearAmountFields(instance, row);
    if (product) {
      const unit = instance.getValueFromCoords(3, row);
      price = product.prices.find((item: any) => item.unit.name === unit);
      if (!price) {
        Swal.fire('Error', 'Unit not found for the selected product', 'error');
        return false;
      }
    } else {
      Swal.fire('Error', 'Product not found', 'error');
      return false;
    }
    let itemDetails = { product, price };
    this.getMrpPrice(instance, itemDetails, row);
    return itemDetails;
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
