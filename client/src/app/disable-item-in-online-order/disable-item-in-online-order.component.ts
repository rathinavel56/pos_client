import { Component, OnInit } from "@angular/core";
import { RecipeService } from "../shared/service/recipe.service";
import { BaseComponent } from "../base.component";
import { Router } from "@angular/router";

@Component({
  templateUrl: "./disable-item-in-online-order.component.html",
})
export class DisableItemInOnlineOrderComponent extends BaseComponent implements OnInit {
  disabledItems: any = [];
  items: any = [];
  constructor(
    public recipeService: RecipeService,
    public router: Router
  ) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.getDisableOnlineRecipes();
  }
  getDisableOnlineRecipes()  {
    this.recipeService.getDisableOnlineRecipes(null)
    .subscribe((response: any) => {
        this.disabledItems = [];
        if (response.data && response.data.length > 0) {
          response.data.forEach((element: any) => {
              this.disabledItems.push(element.receipe_id);
          });
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
        let itms: any = [];
        if (response.data && response.data.length > 0) {
          response.data.forEach((element: any) => {
            if (element.is_show_in_pos === 1) {
              element.checked = this.disabledItems.includes(element.id);
              itms.push(element);
            }
          });
        }
        itms.sort((a: any, b: any) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
        this.items = itms;
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  saveDisableOnlineRecipes() {
    this.showLoading();
    let disabledI: any = [];
    let checkedDisabledI = this.items.filter((e: any) => e.checked === true);
    if (checkedDisabledI.length > 0) {
      checkedDisabledI.forEach((element: any) => {
        disabledI.push(element.id);
      });
    }
    this.recipeService.saveDisableOnlineRecipes({
      items: disabledI
    })
    .subscribe((response: any) => {
        this.getDisableOnlineRecipes();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
}
