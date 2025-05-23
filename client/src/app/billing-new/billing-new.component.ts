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
  public data = [
      ['Jazz', 'Honda', '$ 2.000,00'],
      ['Civic', 'Honda','$ 4.000,01'],
  ];
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
                  item.units_name = item.product_pos.unit_mapping ? item.product_pos.unit_mapping.map((item: any) => item.unit.name) : ['Any'];
                  this.products.push(item);
                  this.productsname.push(item.product_pos.name);
                }
               });
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
      const products = this.products;
    jspreadsheet(this.spreadsheet.nativeElement, {
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
              source: this.productsname
            },
            { type: 'text', title: 'Tamil name', width: 200},
            { type: 'dropdown', title: 'Unit', width: 100,
              source: (instance: any, search: any) => {
                const row = instance.getRowData(instance.getRow());
                const product = products.find((item: any) => item.product_pos.name === row[0]);
                if (product && product.product_pos.unit_mapping) {
                  return product.product_pos.unit_mapping.map((item: any) => item.unit.name);
                }
                console.log('product', product);
                return [];
              }
             },
            { type: 'text', title: 'Quantity', width: 100 },
            { type: 'text', title: 'MRP', width: 100 },
            { type: 'text', title: 'Net amount', width: 100 },
            { type: 'text', title: 'Stock', width: 100 },

          ]
        }
      ],
      onchange: (instance: any, cell: any, x: any, y: any, value: any) => {
        if (x === '0') {
          const product = this.products.find((item: any) => item.product_pos.name === value);
          if (product) {
            instance.setValueFromCoords(1, y, '');
            instance.setValueFromCoords(2, y, '');
            //instance.setValueFromCoords(3, y, '1');
           instance.setSourceFromCoords(3, y, product.units_name);
            instance.setValueFromCoords(4, y, product.selling_price);
            instance.setValueFromCoords(5, y, product.purchase_price);
            instance.setValueFromCoords(6, y, product.quantity);
            console.log('instance', instance, value)
          }
      }
    }
    } as any);
    }

  }

}
