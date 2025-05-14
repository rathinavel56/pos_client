import { RecipeService } from './shared/service/recipe.service';
import Swal from 'sweetalert2';
import { Router } from "@angular/router";
export class BaseComponent {
  menuList: any = [];
  constructor(public recipeService: RecipeService,public router: Router) {
  }

  showLoading() {
    Swal.fire({
      title: 'Loading...',
      html: 'Please wait...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });
  }
  clearLoading() {
    Swal.close();
  }
  scrollTop() {
    window.scroll(0, 0);
  }
  networkIssue() {
    this.clearLoading();
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Network issue please check your internet'
    });
  }
}
