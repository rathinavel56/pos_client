import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../shared/service/recipe.service';
import Swal from 'sweetalert2';
import { BaseComponent} from '../base.component';

@Component({
  selector: 'app-home',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent extends BaseComponent implements OnInit, OnDestroy {
  isOtherWeb: boolean = false;
  hostName: string = '';
  constructor(public router: Router, public recipeService: RecipeService, private renderer: Renderer2) {
    super(recipeService, router);
    this.hostName = (window.location.hostname !== 'localhost') ? window.location.hostname : 'vijaypos.info';
    this.isOtherWeb = (this.hostName === 'vijaypos.info' || this.hostName === '18.221.91.241');
    this.recipeService.menus.subscribe((response: any) => {
        if (response && response.length > 0 && ((response[0].submenu && response[0].submenu.length > 0) || (response[0].path))) {
          this.router.navigate([(response[0].submenu && response[0].submenu.length > 0) ? response[0].submenu[0].path : response[0].path]);
        }
      });
    }
    public submitted: any;
    public serviceResponse: any;
    public username: string  = '';
    public password: string  = '';
    screenLoad: any = false;
    sessionStorage: any;
  ngOnInit() {
    let userDetail: any = sessionStorage.getItem('hotbread') ? JSON.parse(sessionStorage.getItem('hotbread') || '{}') : null;
    this.router.navigate(['/starter']);
    if (!userDetail) {
      this.screenLoad = true;
    }
    this.renderer.addClass(document.body, 'clsLogin_Page');
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'clsLogin_Page');
  }

  onSubmit() {
      this.submitted = true;
      if (!this.username) {
        Swal.fire({
          icon: 'error',
          title: 'Mandatory',
          text: 'Username is required'
        });
        return;
      } else if (!this.password) {
        Swal.fire({
          icon: 'error',
          title: 'Mandatory',
          text: 'Passoword is required'
        });
        return;
      }
      this.showLoading();
      this.recipeService.login({
        username: this.username,
        password: this.password
      })
      .subscribe((response: any) => {
          this.submitted = false;
          if (response && response.status && response.data && response.data.username) {
              let loginData = {
                full_name: response.data.username,
                id: response.data.id,
                session_detail: response.data,
                root_menu: ''
              };
              if (response.data.menus && response.data.menus.length > 0 && response.data.menus[0].submenu.length > 0) {
                let submenu: any = response.data.menus[0].submenu;
                this.recipeService.setMenus(response.data.menus);
                loginData.root_menu = submenu[0].path;
                sessionStorage.setItem('hotbread', JSON.stringify(loginData));
                this.router.navigate([submenu[0].path]);
              }
          } else {
            this.clearLoading();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Username Or Password is invalid'
            });
          }
      });
  }

  onKeydown(event: any) {
    if (event.key === "Enter") {
      this.onSubmit();
    }
  }

}
