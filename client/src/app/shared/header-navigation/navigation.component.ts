import { Component, EventEmitter, Output } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { RecipeService } from '../service/recipe.service';
import { SessionStorageService } from '../util/sessionStorage.service';
import { BaseComponent } from '../../base.component';

import packageJson from '../../../../package.json';
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html'
})
export class NavigationComponent  extends BaseComponent {
  @Output()
  toggleSidebar = new EventEmitter<void>();
  clockHandle: any;
  clock: any;
  userName: any;
  menuList: any = [];
  mainMenu: any;
  showSearch = false;
  statsHeader: any = {
    net: 0,
    discount: 0,
    total: 0
  };
  arrTimes = [];
  iCount = 0; // start
  timesToTest = 5;
  tThreshold = 150; //ms
  testImage = "http://www.google.com/images/phd/px.gif"; // small image in your server
  dummyImage = new Image();
  isConnectedFast = false;
  version: string = packageJson.version;
  constructor(public router: Router, public recipeService: RecipeService, public sessionStorageService: SessionStorageService) {
    super(recipeService, router);
    let sidebarnavItems: any = [];
    this.recipeService.menus.subscribe((response: any) => {
      if (response && response.length > 0) {
        response.forEach((element: any) => {
          sidebarnavItems.push(element);
        });
        this.menuList = this.flatten(JSON.parse(JSON.stringify(sidebarnavItems)));
        this.checkUrl(this.router.url);
        this.mainMenu = this.menuList.find((e: any) => {
          return e.path !== '';
        });
      }
    });
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
         this.checkUrl(event.url);
         if (event.url.includes('/billing')) {
          setTimeout(() => {
            this.stats();
          }, 2000);
         }
      }
      this.setUserInfo();
    });
    this.recipeService.refreshStats.subscribe(() => {
      this.stats(true);
    });
    if (this.router.url.includes('/billing')) {
      this.stats(true);
    }
    this.setUserInfo();
  }

  checkUrl(url: any) {
    if (url.indexOf('/login') !== 0 && url.indexOf('/change-password') !== 0) {
      let menu: any = this.menuList.find((e: any) => {
        return e.path === url;
      });
      if (!menu) {
        menu = this.mainMenu;
        this.router.navigate([menu.path]);
        return false;
      }
    }
    return false;
  }
  changePassword() {
    this.router.navigate(['/change-password']);
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

  setUserInfo() {
    let userDetail: any = sessionStorage.getItem('hotbread') ? JSON.parse(sessionStorage.getItem('hotbread') || '{}') : null;
    if (userDetail) {
      this.userName = userDetail.session_detail.name;
      this.clockHandle = setInterval(()=>{
        this.clock = new Date().toLocaleString();
      },1000);
    }
  }

  navigateToMainMenu() {
    this.router.navigate([this.mainMenu.path]);
  }

  stats(refresh?:any) {
    if (refresh) {
      this.showLoading();
    }
    this.recipeService.stats({
      isBilling: this.router.url.includes('/billing')
    })
    .subscribe((response: any) => {
        if (response.data) {
          this.statsHeader = response.data;
        } else {
          this.statsHeader = {
            net: 0,
            discount: 0,
            total: 0
          };
        }
        this.statsHeader?.menus.forEach((element: any) => {
          let currentId: any = document.getElementById('menu-' + element.id);
          if (null !== currentId) {
            currentId.innerHTML = +element.count > 0 ? '&nbsp;(' + element.count + ')' : '';
          }
        });
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }

  logout() {
    sessionStorage.removeItem('hotbread');
    sessionStorage.removeItem('refresh');
    this.sessionStorageService.showMobileMenu = false;
    this.router.navigate(['/login']);
  }

  // testLatency(cb: any) {
  //   let tStart = new Date().getTime();
  //   if (this.iCount < (this.timesToTest-1)) {
  //     this.dummyImage.src = this.testImage + '?t=' + tStart;
  //     this.dummyImage.onload = function() {
  //       let tEnd = new Date().getTime();
  //       let tTimeTook = tEnd-tStart;
  //       this.arrTimes[this.iCount] = tTimeTook;
  //       this.testLatency(cb);
  //       this.iCount++;
  //     };
  //   } else {
  //     /** calculate average of array items then callback */
  //     let sum = this.arrTimes.reduce(
  //       (a: any, b: any) =>
  //         a + b,
  //       0
  //     );
  //     let avg = sum / this.arrTimes.length;
  //     cb(avg);
  //   }
  // }

  // checkSpeed() {
  //   testLatency(function(avg){
  //     this.isConnectedFast = (avg <= this.tThreshold);
  //     /** output */
  //     document.body.appendChild(
  //       document.createTextNode("Time: " + (avg.toFixed(2)) + "ms - isConnectedFast? " + this.isConnectedFast);
  //     );
  //   });
  // }
}
