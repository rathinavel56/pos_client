import { Component, OnInit } from "@angular/core";
import { RecipeService } from "../shared/service/recipe.service";
import { BaseComponent } from "../base.component";
import Swal from "sweetalert2";
import { Router } from "@angular/router";


@Component({
  selector: "app-credit-wastage-stocks",
  templateUrl: "./credit-wastage-stocks.component.html",
})
export class CreditWastageStocksComponent extends BaseComponent implements OnInit {
  stocks: any = [];
  locations: any = [];
  config: any;
  location_id: any = "All";
  from_location_id: any = "All";
  rootMenu: any;
  from: any = '';
  to: any = '';
  d_from: any = '';
  d_to: any = '';
  watageOptions: any = [{
    key: 0,
    name: 'Wastage'
  },{
    key: 1,
    name: 'Credit'
  }];
  selectedLocation: any = '';
  toSelectedLocation: any = '';
  constructor(
    public recipeService: RecipeService,
    public router: Router
  ) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.getLocations();
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
    this.getRecords(true);
  }
  submit() {
    this.showLoading();
    this.stocks.forEach((e: any) => {
      if (+e.wastage_quantity_update > 0) {
        e.wastage_credit = +e.wastage_quantity_update;
      } else {
        e.wastage_credit = 0;
      }
    });
    this.recipeService
    .wastageStock({
      stocks: this.stocks
    })
      .subscribe(
        () => {
          this.clearLoading();
          Swal.fire("Saved!", "Saved Successfully.", "success");
          this.getRecords();
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  getRecords(isReset?: any) {
    if (isReset) {
      this.from_location_id = '';
      this.location_id = '';
      this.from = '';
      this.to = '';
      this.d_from = '';
      this.d_to = '';
      this.selectedLocation = '';
      this.toSelectedLocation = '';
    }
    this.showLoading();
    this.recipeService
      .wastageStock({
        from_location_id: this.from_location_id ? this.from_location_id : "",
        location_id: this.location_id ? this.location_id : "",
        from: this.from ? this.from : '',
        to: this.to ? this.to : '',
        d_from: this.d_from ? this.d_from : '',
        d_to: this.d_to ? this.d_to : '',
        details: isReset ? "" : true
      })
      .subscribe(
        (response: any) => {
          if (response.data) {
            this.stocks = !isReset ? response.data : '';
          } else {
            this.stocks = [];
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  checkQty(stock: any) {
    if(+stock.wastage_quantity_update > +stock.wastage_quantity) {
      stock.wastage_quantity_update = +stock.wastage_quantity;
    }
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
  d_fillDate() {
    if (!this.d_from && this.d_to) {
      const d_to = this.d_to;
      this.from = d_to;
    }
    if (!this.d_to && this.d_from) {
      const d_from = this.d_from;
      this.d_to = d_from;
    }
  }
  getLocations() {
    this.recipeService.getLocations({
      q: 'all'
    }, null)
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
         this.locations = response.data;
         this.locations.unshift({
          id: 0,
          name: 'All'
        });
        } else {
          this.locations = [];
        }
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  locationSelectionChanged(e: any) {
    if (e && e.value && e.value.name) {
      if (e.value.name !== "All") {
        this.from_location_id = e.value.id;
      } else {
        this.from_location_id = "";
      }
    }
  }
  toLocationSelectionChanged(e: any) {
    if (e && e.value && e.value.name) {
      if (e.value.name !== "All") {
        this.location_id = e.value.id;
      } else {
        this.location_id = "";
      }
    }
  }
}
