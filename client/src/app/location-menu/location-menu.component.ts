import { filter } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './location-menu.component.html'
})
export class LocationMenuComponent extends BaseComponent implements OnInit {
  menus: any = [];
  dailyMenus: any;
  dailyMenu: any;
  menuId: any;
  menu_id: any;
  locationId: any;
  config: any;
  isShowLocation: any = false;
  location_id: any = '';
  location_name: any = '';
  locations: any = [];
  isSearch: any = false;
  searched: any;
  hotelMenuDetails: any = [];
  menuUrl: any = '';
  constructor(public recipeService: RecipeService, public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.menuUrl = 'http://vijaypos.co.in/?name=';
    if (window.location.hostname === 'retailpos.info') {
      this.menuUrl = 'http://vijaypos.co.in/?name=';
    } else if (window.location.hostname === 'vijaypos.info' || window.location.hostname === '18.221.91.241') {
      this.menuUrl = 'http://vijaypos.info/service/menu/?name=';
    }
    this.getDailyMenus();
    let userDetail: any = sessionStorage.getItem('hotbread') ? JSON.parse(sessionStorage.getItem('hotbread') || '{}') : null;
    if (userDetail) {
      this.isShowLocation = (userDetail.session_detail.location_id== 0);
    }
    if (this.isShowLocation) {
      this.getMenuLocations();
    }
    this.config = {
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
  }
  chooseMenu() {
    this.isSearch = true;
  }
  saveDetails() {
      this.showLoading();
      let deactived_menus: any = this.hotelMenuDetails.filter((e: any) => (e.is_active === false));
      if (deactived_menus.length > 0) {
        let id: any = [];
        deactived_menus.forEach((element: any) => {
          id.push(element.id);
        });
        deactived_menus = id.toString();
      } else {
        deactived_menus = '';
      }
      this.recipeService.saveDailyMenu({
        location_id: this.isShowLocation ? this.location_id : undefined,
        menu_id: this.menu_id,
        daily_menu: this.dailyMenu,
        deactived_menus: deactived_menus
      })
      .subscribe((response: any) => {
        this.clearLoading();
          Swal.fire(
            'Saved',
            'Your Menu has been saved.',
            'success'
          );
        this.isSearch = false;
        this.menu_id = '';
        this.menuId = '';
        this.searched = false;
        this.getRecords(false);
      },
      (err: any) => {
        this.networkIssue();
      });
  }
  getDailyMenus() {
    this.recipeService.getDailyMenus({
        isLoadAll: true
      })
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.dailyMenus = response.data;
          } else {
            this.dailyMenus = [];
          }
          if (!this.isShowLocation) {
            this.getRecords(false);
          }
        },
        (err: any) => {
          this.networkIssue();
        });
  }
  getRecords(searched: any) {
    this.showLoading();
    this.recipeService.getDailyMenu({
      location_id: this.isShowLocation ? this.location_id : undefined
    })
    .subscribe((response: any) => {
        if (response.data && response.data.hotel_menu) {
          this.dailyMenu = response.data.hotel_menu;
          let deactived_menus = response.data.deactived_menus.split(',');
          this.setMenu(deactived_menus);
          this.menu_id = this.dailyMenu.id;
          this.menuId = response.data.hotel_menu;
          this.location_name = response.data.location.name;
        }
        this.searched = searched;
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  setMenu(deactived_menus: any) {
    this.hotelMenuDetails = [];
    this.dailyMenu.hotel_menu_details.forEach((element: any) => {
      let category: any = '(' + element.category.name + ')';
      let subCategory: any = (element.sub_category.id > 0) ? (' ('+ element.sub_category.name + ')') : '';
      let menuName: any = category + subCategory;
      let menuId: any = element.hotel_menu_id + '_'+ element.id;
      if (element.price > 0) {
        this.hotelMenuDetails.push({
          id: menuId,
          menuName: element.name + ' ' + menuName,
          price: element.price,
          is_active: (!deactived_menus ||!(deactived_menus.indexOf(menuId) > -1))
        });
      } else {
        element.prices.forEach((price: any) => {
          menuId = menuId + '_'+ price.id;
          this.hotelMenuDetails.push({
            id: menuId,
            menuName: element.name + ' (Variant : ' + price.quantity + ') ' + ' ' + menuName,
            price: price.price,
            is_active: (!deactived_menus || !(deactived_menus.indexOf(menuId) > -1))
          });
        });
      }
    });
  }
  getMenuLocations() {
    this.recipeService.getMenuLocations({
      q: 'all'
    }, null)
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
         this.locations = response.data;
         this.locationId = this.locations[0];
        } else {
          this.locations = [];
        }
        this.location_id = this.locations[0].id;
        this.getRecords(false);
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  locationSelectionChanged(e: any) {
    if (e && e.value && e.value.id) {
      this.location_id = e.value.id;
      this.location_name = e.value.name;
      this.menu_id = '';
      this.menuId = '';
      this.dailyMenu = '';
      this.searched = false;
    }
  }
  menuSelectionChanged(e: any) {
    if (e && e.value && e.value.id) {
      this.menu_id = e.value.id;
      this.dailyMenu = e.value;
      this.setMenu(e.value.deactived_menus);
    }
  }
  cancel() {

  }
}
