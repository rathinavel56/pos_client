import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './products.component.html'
})
export class ProductsComponent extends BaseComponent implements OnInit {
  isSearch: boolean = true;
  isAdd: boolean = false;
  isEdit: boolean = false;
  units: any = [];
  products: any = [];
  categories: any = [];
  brands: any = [];
  prices: any = [];
  posDetails: any = [{
    id: null,
    name: '',
    price: null,
    quantity: null
  }];
  priceHistory: any = false;
  productInfo: any = {
    id: '',
    name: '',
    category_id: 0,
    eod_days: '',
    brand_id: '',
    unit_id: '',
    image_url: '',
    purchase_SGST_percentage: 0,
    purchase_CGST_percentage: 0,
    purchase_IGST_percentage: 0,
    purchase_cess_percentage: 0,
    purchase_price: 0,
    selling_SGST_percentage: 0,
    selling_CGST_percentage: 0,
    selling_IGST_percentage: 0,
    selling_cess_percentage: 0,
    selling_price: 0,
    mrp_selling_price: 0,
    addon: false,
    hsn_code: null,
    is_show_in_pos: false,
    is_dashbord: false,
    is_online_sale: true,
    pos_return: false,
    food_type: false
  };
  days: any = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  lastPage: any;
  page: any;
  currentPage: any = 1;
  productName: any = '';
  locations: any = [];
  dtOptions: DataTables.Settings = {};
  sortBy: any = 'name';
  sortOrder: any = 'ASC';
  config: any;
  dayConfig: any;

  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.dtOptions = {
      order:[[2, 'desc']]
    };
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
    this.dayConfig = {
      search: true,
      height: "auto",
      placeholder: "Search",
      customComparator: () => {},
      moreText: "more",
      noResultsFound: "No results found!",
      searchPlaceholder: "Search"
    };
    this.showLoading();
    this.getRecords();
    this.getUnits();
    this.getBrands();
    this.getCategories();
    this.getLocations();
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
  sorting(sort: any) {
    this.sortOrder = (this.sortBy === sort) ? ((this.sortOrder === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords();
  }

  add() {
    this.isAdd = true;
    this.isSearch = false;
    this.productInfo = {
      id: '',
      name: '',
      image_url: '',
      category_id: (this.categories && this.categories.length > 0) ? this.categories[0].id : null,
      eod_days: '',
      brand_id: (this.brands && this.brands.length > 0) ? this.brands[0].id : null,
      unit_id: (this.units && this.units.length > 0) ? this.units[0].id : null,
      purchase_SGST_percentage: 0,
      purchase_CGST_percentage: 0,
      purchase_IGST_percentage: 0,
      purchase_cess_percentage: 0,
      purchase_price: 0,
      hsn_code: null,
      is_show_in_pos: false,
      is_dashbord: false,
      is_online_sale: true,
      addon: false,
      pos_return: false,
      food_type: false
    };
    this.posDetails = [{
      id: null,
      name: '',
      price: null,
      quantity: null
    }];
  }
  posChange() {
    if (this.productInfo.is_show_in_pos === true) {
      this.addNewPrices();
      this.productInfo.is_online_sale = true;
      this.productInfo.pos_return = true;
      this.productInfo.is_dashbord = false;
    } else {
      this.productInfo.pos_return = false;
      this.prices = [];
    }
  }
  addNewPrices(isPush?: boolean) {
    if (isPush) {
      this.prices.push({
        location_id: '',
        location: null,
        unit: this.units[0],
        unit_id: this.units[0].id,
        unit_quantity: +this.units[0].default_value > 0 ? this.units[0].default_value : '',
        selling_SGST_percentage: 0,
        selling_CGST_percentage: 0,
        selling_IGST_percentage: 0,
        selling_cess_percentage: 0,
        selling_price: 0,
        mrp_selling_price: 0
      });
    } else {
      this.prices = [];
      this.units.forEach((element: any) => {
        this.prices.push({
          location_id: 0,
          location: null,
          unit: element,
          unit_id: element.id,
          unit_quantity: +element.default_value > 0 ? element.default_value : '',
          selling_SGST_percentage: 0,
          selling_CGST_percentage: 0,
          selling_IGST_percentage: 0,
          selling_cess_percentage: 0,
          selling_price: 0,
          mrp_selling_price: 0
        });
      });
    }
  }
  edit(product: any): void {
    this.isAdd = false;
    this.isEdit = true;
    this.isSearch = false;
    this.productInfo = {
      id: product.id,
      name: product.name,
      category_id: (this.categories && this.categories.length > 0) ? product.category_id : null,
      eod_days: (product.eod_days && product.eod_days.length > 0) ? product.eod_days.split(',') : [],
      brand_id: product.brand_id,
      unit_id: product.unit_id,
      image_url: product.image_url,
      purchase_SGST_percentage: product.purchase_SGST_percentage,
      purchase_CGST_percentage: product.purchase_CGST_percentage,
      purchase_IGST_percentage: product.purchase_IGST_percentage,
      purchase_cess_percentage: product.purchase_cess_percentage,
      purchase_price: product.purchase_price,
      hsn_code: product.hsn_code,
      is_show_in_pos: product.is_show_in_pos,
      is_dashbord: product.is_dashbord,
      is_online_sale: product.is_online_sale,
      addon: product.addon,
      pos_return: product.pos_return,
      food_type: product.food_type
    };
    this.posDetails = (product.ingredient_details.length > 0) ? product.ingredient_details : [{
      id: null,
      name: '',
      price: null,
      quantity: null
    }];
    this.prices = [];
    if (product.is_show_in_pos === 1) {
      if (product.prices && product.prices.length > 0) {
        product.prices.forEach((e: any) => {
          this.prices.push({
            location_id: e.location_id,
            location: e.location,
            unit: e.unit,
            unit_id: e.unit_id,
            unit_quantity: e.unit_quantity,
            selling_SGST_percentage: e.selling_SGST_percentage,
            selling_CGST_percentage: e.selling_CGST_percentage,
            selling_IGST_percentage: e.selling_IGST_percentage,
            selling_cess_percentage: e.selling_cess_percentage,
            selling_price: e.selling_price,
            mrp_selling_price: e.mrp_selling_price
          });
        });
      } else {
        this.addNewPrices();
      }
    }
    this.scrollTop();
  }
  remove(indexOfelement: any, detail: any) {
    this.posDetails.splice(indexOfelement, 1);
  }
  addDetails() {
    this.posDetails.push({
      id: null,
      name: '',
      price: null,
      quantity: null
    });
  }
  cancel(): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.productInfo = {
      id: '',
      name: '',
      category_id: 0,
      brand_id: '',
      eod_days: '',
      unit_id: '',
      image_url: '',
      purchase_SGST_percentage: 0,
      purchase_CGST_percentage: 0,
      purchase_IGST_percentage: 0,
      purchase_cess_percentage: 0,
      purchase_price: 0,
      hsn_code: null,
      is_show_in_pos: false,
      is_dashbord: false,
      is_online_sale: true,
      addon: false,
      pos_return: false,
      food_type: false
    };
    this.sortBy = 'name';
    this.sortOrder = 'ASC';
    this.posDetails = [{
      id: null,
      name: '',
      price: null,
      quantity: null
    }];
    this.prices = [];
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
  submit(id: any, isDelete?: boolean) {
    if (id || (this.productInfo.name && (!this.productInfo.is_show_in_pos || ((this.productInfo.is_show_in_pos === 1 || this.productInfo.is_show_in_pos === true))))) {
      if (this.productInfo.is_show_in_pos === 0 || this.productInfo.is_show_in_pos === false) {
        this.prices = [];
        this.productInfo.is_online_sale = false;
        this.productInfo.pos_return = false;
        this.productInfo.is_dashbord = false;
      }
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
            this.saveDetails(id, isDelete);
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
  showPriceHistory(product: any) {
    this.productName = product.name;
    this.showLoading();
    this.recipeService.getProductPriceHistory({
      product_id: product.id
    })
    .subscribe((response: any) => {
        this.priceHistory = true;
        if (response.data && response.data.length > 0) {
          //response.data.sort((a : any, b: any) => <any>new Date(b.transcation_date) - <any>new Date(a.transcation_date));
          this.prices = response.data;
        } else {
          this.prices = [];
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  cancelPriceHistory() {
    this.priceHistory = false;
    this.prices = [];
    this.productName = '';
  }
  setPagination(currentPage : any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords();
  }
  getRecords() {
    this.recipeService.getProducts({
        isLoadRecipe: false,
        name: this.productInfo.name,
        category_id: this.productInfo.category_id,
        brand_id: this.productInfo.brand_id,
        unit_id: this.productInfo.unit_id,
        hsn_code: this.productInfo.hsn_code,
        is_show_in_pos: this.productInfo.is_show_in_pos,
        is_dashbord: this.productInfo.is_dashbord,
        sort_by: this.sortBy,
        sort_order: this.sortOrder
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data.data.length > 0) {
            this.products = response.data.data;
            this.page = response.data.current_page;
            this.lastPage = response.data.total;
          } else {
            this.products = [];
            this.page = 0;
            this.lastPage = 0;
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  locationSelectionChanged(price: any, e: any) {
    if (e && e.value && e.value.id) {
      price.location_id = e.value.id;
    } else {
      price.location_id = null;
      price.location = null;
    }
  }
  unitMappingSelectionChanged(price: any, e: any) {
    if (e && e.value && e.value.id) {
      price.unit_id = e.value.id;
    } else {
      price.unit_id = null;
      price.unit = null;
    }
  }
  onFocusZeroClear(data: any, field: any) {
    if (data[field].toString().length === 1 && data[field] == 0) {
      data[field] = null;
    }
  }
  removePrice(removeIndex: any) {
    this.prices.splice(removeIndex, 1);
  }
  saveDetails(id: any, isDelete?: any) {
    let request: any = (isDelete === true) ? {id: id, isDelete: true} : this.productInfo;
    if (this.productInfo.is_show_in_pos === 1 || this.productInfo.is_show_in_pos === true) {
      // let priceCheck = this.prices.slice(0, this.paymentModes.length).filter((e: any) => !this.prices[0].selling_price).length;
      let priceCheck = this.prices.filter((e: any) => (+e.selling_price > 0)).length;
      if (priceCheck === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please fill Atleast one Price'
        });
        return;
      }
      request.prices = this.prices.filter((v: any) => (+v.selling_price > 0));
    } else {
      request.prices = [];
    }
    this.showLoading();
    request.eod_days = (request.eod_days && request.eod_days.length > 0) ? request.eod_days.toString() : null;
    this.recipeService.saveProduct(request)
        .subscribe(() => {
          this.clearLoading();
          if (id) {
            Swal.fire(
              'Deleted!',
              'Your Product has been deleted.',
              'success'
            );
          } else {
            Swal.fire(
              'Saved',
              'Your Product has been saved.',
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
  getUnits()  {
    this.units = [];
    this.recipeService.getUnits()
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.units = response.data;
            this.productInfo.unit_id = 0;
          }
        },
        (err: any) => {
          this.networkIssue();
        });
  }
  getBrands()  {
    this.recipeService.getBrands({
      q: 'all'
    }, null)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.brands = response.data;
            this.productInfo.brand_id = 0;
          }
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
            let anyIndex = this.categories.findIndex((a: any) => {
              return a.name.toLowerCase().includes('any');
            });
            if (anyIndex > -1) {
              let any = this.categories[anyIndex];
              this.categories.splice(this.categories.findIndex((a: any) => {
                return a.name.toLowerCase().includes('any');
              }) , 1);
              this.categories.unshift(any);
            }
            this.productInfo.category_id = 0;
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
}
