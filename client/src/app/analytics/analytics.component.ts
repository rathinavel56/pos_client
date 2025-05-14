import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import { Router } from '@angular/router';
import { SessionStorageService } from '../shared/util/sessionStorage.service';
@Component({
  templateUrl: './analytics.component.html'
})
export class AnalyticsComponent extends BaseComponent implements OnInit {
  sales: any = [];
  items: any = [];
  selectedItems: any = [];
  chooseDateFrom: any;
  isSubmitted: any = false;
  title: any = '';
  config: any;
  isLoaded: boolean = false;
  constructor(public recipeService: RecipeService,public router: Router, public sessionStorageService: SessionStorageService) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.selectedItems = [];
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
    if (this.router.url.includes('/sold-out-timing')) {
      this.getProductList();
    }
  }
  getRecords() {
    this.isSubmitted = true;
    if (this.router.url.includes('/sale-analytics')) {
      this.saleAnalytics();
    } else if (this.router.url.includes('/sku-analytics')) {
      this.skuAnalytics();
    } else if (this.router.url.includes('/sold-out-timing')) {
      this.importantDishAnalytics();
    } else if (this.router.url.includes('/category-analytics')) {
      this.categoryAnalytics();
    }
  }

  saleAnalytics() {
    this.showLoading();
    this.recipeService.saleAnalytics({
        dateFrom: this.chooseDateFrom
      })
      .subscribe((response: any) => {
          if (response && response.data && response.data.length > 0) {
            this.sales = response.data;
            this.title = response.title;
          } else {
            this.sales = [];
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  skuAnalytics() {
    this.showLoading();
    this.recipeService.skuAnalytics({
        dateFrom: this.chooseDateFrom
      })
      .subscribe((response: any) => {
          if (response && response.data && response.data.length > 0) {
            this.sales = response.data;
            this.title = response.title;
          } else {
            this.sales = [];
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  importantDishAnalytics() {
    this.showLoading();
    let productIds: any = [];
    let recipeIds: any = [];
    if (this.selectedItems && this.selectedItems.length > 0) {
      this.selectedItems.forEach((element: any) => {
        if (element.product_id) {
          productIds.push(element.product_id);
        } else if (element.receipe_id) {
          recipeIds.push(element.receipe_id);
        }
      });
    }
    this.recipeService.importantDishAnalytics({
        dateFrom: this.chooseDateFrom,
        products_ids: (productIds.length > 0) ? productIds : undefined,
        recipe_ids: (recipeIds.length > 0) ? recipeIds : undefined
      })
      .subscribe((response: any) => {
          if (response && response.data && response.data.length > 0) {
            response.data.forEach((element: any) => {
              if (element.details && element.details.length > 0) {
                element.details.forEach((detail: any) => {
                  if (detail.data && detail.data.length > 0) {
                    detail.data.forEach((detailInfo: any) => {
                      detailInfo.text = this.dateTimeText(detailInfo.datetime);
                    });
                  }
                });
              }
            });
            this.sales = response.data;
            this.title = response.title;
          } else {
            this.sales = [];
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  dateTimeText(dateTime: any) {
    let greeting;
    let nowDate: any = new Date(dateTime);
    let nowHour: any = nowDate.getHours();
    let nowMinute: any = nowDate.getMinutes();
    let nowSecond: any = nowDate.getSeconds();
    if (nowMinute < 10) {
        nowMinute = '0' + nowMinute;
    }
    if (nowSecond < 10) {
        nowSecond = '0' + nowSecond;
    }
    if (nowHour < 16) {
        greeting = 'm';
    } else if (nowHour < 20) {
        greeting = 'a';
    } else {
        greeting = 'e';
    }
    return greeting;
  }
  categoryAnalytics() {
    this.showLoading();
    this.recipeService.categoryAnalytics({
        dateFrom: this.chooseDateFrom
      })
      .subscribe((response: any) => {
          if (response && response.data && response.data.length > 0) {
            this.sales = response.data;
            this.title = response.title;
          } else {
            this.sales = [];
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getProductList() {
    this.items = [];
    this.recipeService.getProductList()
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          let prod: any = [];
          response.data.forEach((element: any) => {
            if (element.is_show_in_pos === 1) {
              if (element.name && element.brand && element.brand.name) {
                element.name = element.name + ' (' + element.brand.name + ')';
              }
              element.product_id = element.id;
              prod.push(element);
            }
          });
          this.items = prod;
        }
        this.getRecipes();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  getRecipes()  {
    this.recipeService.getRecipes({
      isLoadRelatioship: false,
      isLoadAll: true
    }, null)
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          response.data.forEach((element: any) => {
            if (element.is_show_in_pos === 1) {
              element.receipe_id = element.id;
              this.items.push(element);
            }
          });
        }
        this.items.sort((a: any, b: any) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
        this.items.unshift({
          id: '',
          name: 'Any'
        });
        this.isLoaded = true;
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  itemChanged(e: any) {
    setTimeout(() => {
      if (e && e.value && e.value.length > 0 && this.selectedItems.find((ev: any) => ev.id === '')) {
        this.selectedItems = [];
        this.selectedItems.push({
            id: '',
            name: 'Any'
          });
      }
    }, 0);
  }
}
