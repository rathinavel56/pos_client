import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './recipe.component.html'
})
export class RecipeComponent extends BaseComponent implements OnInit {
  isSearch: boolean = true;
  isAdd: boolean = false;
  isEdit: boolean = false;
  units: any = [];
  recipes: any = [];
  categories: any = [];
  ingredients: any = [];
  isIngredients: any = [{
    name: 'All',
    value: ''
  },{
    name: 'Yes',
    value: true
  },{
    name: 'No',
    value: false
  }];
  days: any = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  recipeData: any = {
    id: null,
    name: '',
    unit_id: '',
    category_id: '',
    eod_days: '',
    yield: '',
    hsn_code: '',
    manufacturing_price: '',
    manufacturing_price_updated_at: '',
    is_pos_auto_debit: false,
    is_sku_analysis: false,
    is_auto_split_in_billing: false,
    is_ingredient: false,
    is_show_in_pos: '',
    image_url: '',
    is_request_stock: false,
    is_dashbord: false,
    is_online_sale: true,
    pos_return: false,
    addon: false,
    unit_size: 1,
    ingredients: [],
    food_type: false
  };
  name: any = '';
  id: any = '';
  config: any;
  lastPage: any;
  page: any;
  prices: any = [];
  paymentModes: any = [];
  configLocation: any;
  locations: any = [];
  currentPage: any = 1;
  sortBy: any = 'name';
  sortOrder: any = 'ASC';
  dayConfig: any;
  constructor(public recipeService: RecipeService, public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.getRecords();
    this.getProductList();
    this.getUnits();
    this.getCategories();
    this.getLocations();
    this.getPaymentModes();
    this.dayConfig = {
      search: true,
      height: "auto",
      placeholder: "Search",
      customComparator: () => {},
      moreText: "more",
      noResultsFound: "No results found!",
      searchPlaceholder: "Search"
    };
    this.configLocation = {
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
    this.config = {
        displayKey: 'displayName',
        search: true,
        height: 'auto',
        placeholder: 'Search',
        customComparator: ()=>{},
        moreText: 'more',
        noResultsFound: 'No results found!',
        searchPlaceholder: 'Search',
        searchOnKey: 'displayName'
    };
  }
  addNewPrices(isPush?: boolean) {
    if (isPush) {
      this.prices.push({
        location_id: '',
        location: null,
        payment_mode: this.paymentModes[0],
        payment_mode_id: this.paymentModes[0].id,
        selling_SGST_percentage: 0,
        selling_CGST_percentage: 0,
        selling_IGST_percentage: 0,
        selling_cess_percentage: 0,
        selling_price: 0
      });
    } else {
      this.prices = [];
      this.paymentModes.forEach((element: any) => {
        this.prices.push({
          location_id: 0,
          location: null,
          payment_mode: element,
          payment_mode_id: element.id,
          selling_SGST_percentage: 0,
          selling_CGST_percentage: 0,
          selling_IGST_percentage: 0,
          selling_cess_percentage: 0,
          selling_price: 0
        });
      });
    }
  }
  populatePriceForDefault() {
    this.paymentModes.forEach((element: any) => {
      let priceDetail = this.prices.find((e: any) => e.location_id === 0 && element.id === e.payment_mode_id);
      if (!priceDetail) {
        let defaultPriceDetail;
        if (element.is_online === 0) {
          defaultPriceDetail = this.prices.find((e: any) => e.location_id === 0 && 1   === e.payment_mode_id);
        }
        if (!defaultPriceDetail) {
          defaultPriceDetail = {
            selling_price: 0,
            selling_SGST_percentage: 0,
            selling_CGST_percentage: 0,
            selling_IGST_percentage: 0,
            selling_cess_percentage: 0
          };
        }
        this.prices.push({
          location_id: 0,
          location: null,
          payment_mode: element,
          payment_mode_id: element.id,
          selling_SGST_percentage: defaultPriceDetail.selling_SGST_percentage,
          selling_CGST_percentage: defaultPriceDetail.selling_CGST_percentage,
          selling_IGST_percentage: defaultPriceDetail.selling_IGST_percentage,
          selling_cess_percentage: defaultPriceDetail.selling_cess_percentage,
          selling_price: defaultPriceDetail.selling_price
        });
      }
    });
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
  getPaymentModes() {
    this.recipeService.getPaymentModes().subscribe(
      (response: any) => {
        if (response.data && response.data.length > 0) {
          this.paymentModes = response.data;
        } else {
          this.paymentModes = [];
        }
      },
      () => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Internal Server Error",
        });
      }
    );
  }
  addIngredients() {
    if (this.ingredients && this.ingredients.length > 0) {
      this.recipeData.ingredients.push({
        id: this.ingredients[0].id,
        displayName: this.ingredients[0].displayName,
        quantity: null
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please add Products to proceed further.",
      });
    }
  }
  posChange() {
    if (this.recipeData.is_show_in_pos === true) {
      this.recipeData.is_dashbord = false;
      this.recipeData.is_online_sale = true;
      this.recipeData.pos_return = true;
      this.recipeData.pos_return = true;
      this.addNewPrices();
    } else {
      this.recipeData.pos_return = false;
      this.recipeData.pos_return = true;
      this.recipeData.is_sku_analysis = false;
      this.prices = [];
    }
  }
  add() {
    this.isAdd = true;
    this.isSearch = false;
    this.name = '';
  }
  edit(): void {
    this.isEdit = true;
    this.isSearch = false;
  }
  sorting(sort: any) {
    this.sortOrder = (this.sortBy === sort) ? ((this.sortOrder === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords();
  }
  cancel(): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.recipeData = {
      id: null,
      name: '',
      category_id: '',
      eod_days: '',
      unit_id: '',
      yield: '',
      hsn_code: '',
      image_url: '',
      unit_size: 1,
      is_ingredient: false,
      manufacturing_price: '',
      manufacturing_price_updated_at: '',
      is_sku_analysis: false,
      is_auto_split_in_billing: false,
      is_show_in_pos: '',
      is_request_stock: false,
      is_pos_auto_debit: false,
      is_dashbord: false,
      is_online_sale: true,
      addon: false,
      pos_return: false,
      isDelete: false,
      ingredients: [],
      food_type: false
    };
    this.sortBy = 'name';
    this.sortOrder = 'ASC';
    this.addIngredients();
    this.showLoading();
    this.getRecords();
  }
  search(isReset: boolean) {
    if (isReset) {
      this.cancel();
    }
    this.showLoading();
    this.getRecords();
  }
  getUnits()  {
    this.recipeService.getUnits()
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.units = response.data;
            this.recipeData.unit_id = this.units[0].id;
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
            this.recipeData.category_id = 0;
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  online_sale(e: any) {
    if (!e.target.checked) {
      this.prices = this.prices.filter((e: any) => e.payment_mode.is_online === 0);
    }
  }
  submit(id: any) {
    let ingredients = this.recipeData.ingredients.filter((e: any) => e.id !== null && e.quantity !== null);
    if (id || (this.recipeData.name && this.recipeData.unit_id  && this.recipeData.yield && ingredients.length > 0)) {
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
            this.recipeData.id = id;
            this.recipeData.isDelete = id ? true : false;
            this.saveDetails(id);
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
  updatePrice(recipe: any) {
    this.showLoading();
    this.recipeService.manufacturingPrice(recipe)
        .subscribe((response: any) => {
          recipe.manufacturing_price = {
            price: response.price
          };
          this.clearLoading();
            Swal.fire(
              'Saved',
              'Your Recipe Manufuring Price has been Completed.',
              'success'
            );
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  onKeyDownEvent(e: any) {
    if (this.isSearch) {
      this.search(false);
    }
  }
  selectionChanged(e: any, indexOfelement: any) {
    if (e && e.value && e.value.id) {
      this.recipeData.ingredients[indexOfelement].id = e.value.id;
    } else {
      this.recipeData.ingredients[indexOfelement].id = null;
    }
  }
  onFocusZeroClear(data: any, field: any) {
    if (data[field].toString().length === 1 && data[field] == 0) {
      data[field] = null;
    }
  }
  saveDetails(id: any) {
    this.recipeData.ingredients = this.recipeData.ingredients.filter((e: any) => e.id !== null && e.quantity !== null);
    let request : any;
    this.recipeData.is_show_in_pos = !this.recipeData.is_show_in_pos ? 0 : 1;
    if (this.recipeData.is_show_in_pos === 1 || this.recipeData.is_show_in_pos === true) {
      let priceCheck = this.prices.filter((e: any) => (+e.selling_price > 0)).length;
      if (priceCheck === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please fill Atleast one Price'
        });
        return;
      }
      request = this.recipeData;
      request.prices = this.prices.filter((v: any) => (+v.selling_price > 0));
    } else {
      request = this.recipeData;
      request.prices = [];
    }
    this.recipeData.unit_size = (+this.recipeData.unit_size > 0) ? +this.recipeData.unit_size : 1;
    this.showLoading();
    let recipeRequest = JSON.parse(JSON.stringify(this.recipeData));
    recipeRequest.eod_days = (recipeRequest.eod_days && recipeRequest.eod_days.length > 0) ? recipeRequest.eod_days.toString() : null;
    this.recipeService.saveRecipes(recipeRequest)
        .subscribe((response: any) => {
          this.clearLoading();
          if (id) {
            Swal.fire(
              'Deleted!',
              'Your Recipe has been deleted.',
              'success'
            );
          } else {
            Swal.fire(
              'Saved',
              'Your Recipe has been saved.',
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
  getProductList() {
      this.recipeService.getProducts({
        isLoadRecipe: true
      }, null)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            let ingredientList = response.data;
            this.ingredients = [];
            ingredientList.forEach((element: any) => {
              if(element.name) {
                let brand: any = element.brand ? '(' + element.brand.name +') ' : '';
                this.ingredients.push({
                  id: element.id,
                  displayName: element.name + brand + (element.unit ? ' (' + element.unit.name + ')' : '')
                });
              }
            });
            this.addIngredients();
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  removeRecipe(removeIndex: any) {
    this.recipeData.ingredients.splice(removeIndex, 1);
  }
  removePrice(removeIndex: any) {
    this.prices.splice(removeIndex, 1);
  }
  locationSelectionChanged(price: any, e: any) {
    if (e && e.value && e.value.id) {
      price.location_id = e.value.id;
    } else {
      price.location_id = null;
      price.location = null;
    }
  }
  paymentModeSelectionChanged(price: any, e: any) {
    if (e && e.value && e.value.id) {
      price.payment_mode_id = e.value.id;
    } else {
      price.payment_mode_id = null;
      price.payment_mode = null;
    }
  }
  getRecipeById(id: any) {
    this.showLoading();
    this.recipeService.getRecipeById({
      id: id
    })
    .subscribe((response: any) => {
        let ingredientDetails: any = [];
        response.data.recipe_products.forEach((element: any) => {
          ingredientDetails.push({
            id: element.parent_recipe_id ? -(element.parent_recipe_id) : element.product_id,
            displayName: element.parent_recipe_id ? (element.parent_recipe.name + ' (' + element.parent_recipe.unit.name + ')') : (element.ingredient.name + '(' + element.ingredient.brand.name +') ' + ' (' + element.ingredient.unit.name + ')'),
            quantity: element.quantity
          });
        });
        this.recipeData = {
          id: response.data.id,
          name: response.data.name,
          category_id: response.data.category_id,
          eod_days: (response.data.eod_days && response.data.eod_days.length > 0) ? response.data.eod_days.split(',') : [],
          unit_id: response.data.unit_id,
          yield: response.data.yield,
          is_ingredient: response.data.is_ingredient,
          image_url: response.data.image_url,
          hsn_code: response.data.hsn_code,
          manufacturing_price: response.data.manufacturing_price ? response.data.manufacturing_price.price : '',
          manufacturing_price_updated_at: response.data.manufacturing_price ? response.data.manufacturing_price.updated_at : '',
          is_request_stock: response.data.is_request_stock,
          is_show_in_pos: response.data.is_show_in_pos,
          unit_size: response.data.unit_size,
          is_auto_split_in_billing: response.data.is_auto_split_in_billing,
          is_sku_analysis: response.data.is_sku_analysis,
          is_pos_auto_debit: response.data.is_pos_auto_debit,
          is_dashbord: response.data.is_dashbord,
          is_online_sale: response.data.is_online_sale,
          addon: response.data.addon,
          pos_return: response.data.pos_return,
          isDelete: false,
          ingredients: ingredientDetails,
          food_type: response.data.food_type
        };
        this.prices = [];
        if (response.data.is_show_in_pos === 1) {
          if (response.data.prices && response.data.prices.length > 0) {
            response.data.prices.forEach((e: any) => {
              this.prices.push({
                location_id: e.location_id,
                location: e.location,
                payment_mode: e.payment_mode,
                payment_mode_id: e.payment_mode_id,
                selling_SGST_percentage: e.selling_SGST_percentage,
                selling_CGST_percentage: e.selling_CGST_percentage,
                selling_IGST_percentage: e.selling_IGST_percentage,
                selling_cess_percentage: e.selling_cess_percentage,
                selling_price: e.selling_price
              });
            });
            this.populatePriceForDefault();
          } else {
            this.addNewPrices();
          }
        }
        this.edit();
        this.scrollTop();
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  setPagination(currentPage : any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords();
  }
  getRecords()  {
    this.recipeService.getRecipes({
      isLoadRelatioship: false,
      is_show_in_pos: (this.recipeData.is_show_in_pos && this.recipeData.is_show_in_pos !== 'Any') ? JSON.parse(this.recipeData.is_show_in_pos) : null,
      name: this.recipeData.name ? this.recipeData.name : null,
      category_id: this.recipeData.category_id,
      is_ingredient: this.recipeData.is_ingredient,
      sort_by: this.sortBy,
      sort_order: this.sortOrder
    }, this.currentPage)
    .subscribe((response: any) => {
      if (response.data && response.data.data.length > 0) {
          this.recipes = response.data.data;
          this.page = response.data.current_page;
          this.lastPage = response.data.total;
        } else {
          this.recipes = [];
          this.page = 0;
          this.lastPage = 0;
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
}
