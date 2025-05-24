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
  ngOnInit(): void {
    this.locationStock();
  }
  locationStock() {
      this.showLoading();
      this.products = [];
      this.carts = [];
      this.unitNames = [];
      this.recipeService
        .locationStock({
          location_id: 4,
          reference_no: "",
        })
        .subscribe(
          (response: any) => {
            if (response.data && response.data.length > 0) {
              response.data.forEach((item: any) => {
                if (item.product_pos.prices.length > 0) {
                  let price = item.product_pos.prices.find((price: any) => (price.location_id === 4));
                  if (!price) {
                     price = item.product_pos.prices.find((price: any) => (price.location_id === 0));
                  }
                  item.product = item.product_pos.name;
                  item.product_id = item.product_id;
                  item.brand_id = item.product_pos.brand.id;
                  item.brand_name = item.product_pos.brand.name;
                  item.categorty_id = item.product_pos.category.id;
                  item.categorty_name = item.product_pos.category.name;
                  item.quantity = item.quantity;
                  item.selling_price = price.selling_price;
                  item.purchase_price = item.product_pos.purchase_price;
                  if (item.product_pos.unit_mapping && item.product_pos.unit_mapping.length > 0) {
                    this.unitNames = [
                      ...new Set([
                        ...item.product_pos.unit_mapping.map((unit: any) => unit.unit.name),
                        ...this.unitNames
                      ])
                    ];
                  }
                  this.products.push(item);
                  this.productsname.push(item.product_pos.name);
                }
               });
               this.unitNames.sort((a: any, b:any) => a.localeCompare(b));
            }
            this.createSpreadsheet();
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
            minDimensions: [7, 1],
            columns: [
              {
                type: 'dropdown',
                title: 'Product',
                autocomplete: true,
                width: 300,
                source: self.productsname
              },
              { type: 'text', title: 'Tamil name', width: 200 },
              {
                type: 'dropdown', title: 'Unit', width: 100,
                source: self.unitNames
              },
              { type: 'text', title: 'Quantity', width: 100 },
              { type: 'text', title: 'MRP', width: 100 },
              { type: 'text', title: 'Net amount', width: 100 },
              { type: 'text', title: 'Stock', width: 100 }
            ]
          }
        ],
        onchange: function (instance: any, cell: any, col: any, row: any, value: any) {
          switch (col) {
            case '0': // Product column
              self.addProduct(instance, cell, col, row, value);
            break;
            case '2': // unit name column
              self.chooseUnit(instance, cell, col, row, value);
            break;
            case '3': // Quantity column
            self.chooseQuantity(instance, cell, col, row, value);
            break;
          }
        }
      } as any);
    }

  }
  addProduct(instance: any, cell: any, col: any, row: any, value: any) {
    const product = this.products.find((item: any) => item.product_pos.name === value);
    if (product) {
      instance.setValueFromCoords(1, row, '');
      instance.setValueFromCoords(2, row, '');
      instance.setValueFromCoords(3, row, '');
      instance.setValueFromCoords(4, row, product.selling_price);
      instance.setValueFromCoords(5, row, product.purchase_price);
      instance.setValueFromCoords(6, row, product.quantity);
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
      instance.setValueFromCoords(3, row, '');
      return false;
    } else {
      // Calculate the net amount based on the selling price and quantity
      const netAmount = quantity * productDetails.product.selling_price;
      instance.setValueFromCoords(5, row, netAmount.toFixed(2));
      return true;
    }
  }

  validateProducts(instance: any, row: any) {
    const productName = instance.getValueFromCoords(0, row);
    const product = this.products.find((item: any) => item.product_pos.name === productName);
    let unitMapping = null;
    if (product) {
      const unit = instance.getValueFromCoords(2, row);
      unitMapping = product.product_pos.unit_mapping.find((item: any) => item.unit.name === unit);
      if (!unitMapping) {
        Swal.fire('Error', 'Unit not found for the selected product', 'error');
        return false;
      }
    } else {
      Swal.fire('Error', 'Product not found', 'error');
      return false;
    }
    return { product, unitMapping };
  }

}
