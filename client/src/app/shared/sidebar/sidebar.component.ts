import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../service/recipe.service';
import { SessionStorageService } from '../util/sessionStorage.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  showMenu = '';
  showSubMenu = '';
  menuList: any = [];
  @Output() closeMenu = new EventEmitter<void>();
  public sidebarnavItems: any = [];
  constructor(
    private router: Router,
    public recipeService: RecipeService,
    public sessionStorageService: SessionStorageService
  ) {}

  // End open close
  ngOnInit() {
    this.recipeService.menus.subscribe((response: any) => {
      if (response && response.length > 0) {
        response.forEach((element: any) => {
          this.sidebarnavItems.push(element);
        });
        this.menuList = this.flatten(JSON.parse(JSON.stringify(this.sidebarnavItems)));
      }
    });
  }

  addExpandClass(element: any) {
    if (element.title === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element.title;
    }
    if (element.submenu && element.submenu.length > 0) {
      this.sidebarnavItems.forEach((sidebarnavItem: any) => {
        sidebarnavItem.open = '';
      });
      element.isopen = !element.isopen;
      element.open = (element.isopen) ? 'in' : '';
    }
    if (element.isopen && (element.title === 'POS' || element.title === 'Purchases')) {
      this.recipeService.refreshStats.next();
    }
    if (element.path) {
      this.router.navigate([element.path]);
    }
  }

  setMenus(submenu: any) {
    this.sessionStorageService.showMobileMenu = !this.sessionStorageService.showMobileMenu;
    this.closeMenu.emit();
    this.recipeService.setReadOnly(submenu.is_write === 0);
  }

  setReadOnly() {
    if (this.menuList.length > 0) {
      let currentMenu: any = this.menuList.filter((e: any) => (e.path === this.router.url));
      this.recipeService.setReadOnly(currentMenu[0].is_write === 0);
    }
  }
  flatten(items: any) {
    const flat: any = [];
    items.forEach((item: any) => {
      flat.push(item);
      if (Array.isArray(item.submenu) && item.submenu.length > 0) {
        flat.push(...this.flatten(item.submenu));
        delete item.submenu;
      }
      delete item.submenu;
    });
    return flat;
  }

  logout() {
    sessionStorage.removeItem('retail_pos');
    sessionStorage.removeItem('refresh');
    this.sessionStorageService.showMobileMenu = false;
    this.router.navigate(['/login']);
  }
}
