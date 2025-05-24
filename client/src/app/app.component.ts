import { Component } from "@angular/core";
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from "@angular/router";
import { RecipeService } from "./shared/service/recipe.service";
import { BaseComponent } from "./base.component";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent extends BaseComponent {
  title = "app";
  year: any;
  constructor(public router: Router, public recipeService: RecipeService) {
    super(recipeService, router);
    this.recipeService.menus.subscribe((response: any) => {
      if (!response || response.length == 0) {
        let userDetail: any = sessionStorage.getItem("retail_pos")
          ? JSON.parse(sessionStorage.getItem("retail_pos") || "{}")
          : null;
        if (userDetail) {
          this.recipeService.getMenus().subscribe({
            next: (response: any) => {
              if (response.data && response.data.length > 0) {
                this.recipeService.setMenus(response.data);
              }
            }
          });
        }
      }
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart || event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        if (document.body && document.body.classList) {
          if (this.router.url.includes('/billing') === true) {
            document.body.classList.add('bg-none');
          } else {
            document.body.classList.remove('bg-none');
          }
        }
      }
    });
    this.year = (new Date()).getFullYear();
  }
}
