import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import { Router } from '@angular/router';

@Component({
  templateUrl: './menu.component.html'
})
export class MenuComponent extends BaseComponent implements OnInit {
  menus: any;
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.getRecords();
  }
  getRecords() {
    this.showLoading();
    this.recipeService.getResMenus({

    }, null)
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          this.menus = response.data;
        } else {
          this.menus = [];
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
}
