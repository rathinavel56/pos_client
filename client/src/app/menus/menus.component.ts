import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DragulaService } from "ng2-dragula";
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './menus.component.html'
})
export class MenusComponent extends BaseComponent implements OnInit, OnDestroy {
  menus: any = [];
  categories: any;
  subcategories: any;
  lastPage: any;
  page: any;
  idEdit: any = '';
  name: any = '';
  subs = new Subscription();
  currentPage: any = 1;
  sortBy: any = 'name';
  sortOrder: any = 'ASC';
  isAdd: any = false;
  isEdit: any = false;
  isSearch: any = true;
  config: any;
  category_id: any = '';
  sub_category_id: any = '';
  isSubmitted: any = false;
  isDelete: any = false;
  menudetails: any = [{
    category_id: '',
    sub_category_id: '',
    name: '',
    description: '',
    order_id: 1,
    price: '',
    prices: [
      {
        quantity: '',
        price: ''
      }
    ]
  }];
  removeHotelMenuDetailId: any = [];
  constructor(public recipeService: RecipeService, public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    // this.dragulaService.createGroup('menu-details', {
    //   revertOnSpill: true
    // });
    this.getRecords();
    this.getCategories();
    this.getSubcategories();
    // this.subs.add(this.dragulaService.drop('menu-details')
    //   .subscribe(({ name, el, target, source, sibling }) => {
    //     this.rearrangeOrder();
    //   })
    // );
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
  rearrangeOrder() {
    setTimeout(()=> {
      let i: any = 1;
      document.querySelectorAll('.order_id').forEach(function(ele: any) {
        ele.value = i;
        ele.parentElement.childNodes[0].innerHTML = '#' + i;
        i++;
      });
      i = 0;
      this.menudetails.forEach((e: any) => {
        const orderId: any = document.getElementById('order_id_' + i) as HTMLInputElement;
        e.order_id = orderId.value;
        i++;
      });
    }, 500);
  }
  removeMenuDetail(id: any) {
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
            this.removeHotelMenuDetailId.push(id);
          }
        });
  }
  add() {
    this.isAdd = true;
    this.isSearch = false;
    this.clear();
  }
  clear() {
    this.name = '';
    this.category_id = '';
    this.sub_category_id = '';
    this.isSubmitted = false;
    this.isDelete = false;
    this.menudetails = [{
      category_id: '',
      sub_category_id: '',
      name: '',
      description: '',
      order_id: 1,
      price: '',
      prices: [
        {
          quantity: '',
          price: ''
        }
      ]
    }];
  }
  edit(menu: any): void {
    this.isAdd = false;
    this.isEdit = true;
    this.isSearch = false;
    this.idEdit = menu.id;
    this.name = menu.name;
    this.menudetails = menu.hotel_menu_details;
  }
  submit(id: any) {
    this.isSubmitted = true;
    let menudetailsFiltered = this.menudetails.filter((e: any) => e.category_id && e.name && ((e.price && e.price > 0) ||(e.prices.filter((ele: any) => (ele.quantity && ele.price)).length > 0)));
    if (id || (this.name && menudetailsFiltered.length > 0)) {
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
            this.isDelete = id ? true : false;
            this.idEdit = id;
            this.saveDetails(id);
          }
        })
      } else {
        menudetailsFiltered.forEach((e: any) => {
          e.prices = (!e.price || e.price === 0) ? e.prices.filter((ele: any) => (ele.quantity && ele.price)) : [];
        });
        this.menudetails = menudetailsFiltered;
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
  saveDetails(id: any) {
    this.showLoading();
    this.recipeService.saveResMenus({
          id : this.idEdit ? this.idEdit : undefined,
          name: this.name,
          menudetails: this.menudetails,
          removeHotelMenuDetailId: this.removeHotelMenuDetailId,
          isDelete: this.isDelete
        })
        .subscribe((response: any) => {
          this.clearLoading();
          if (id) {
            Swal.fire(
              'Deleted!',
              'Your Menu has been deleted.',
              'success'
            );
          } else {
            Swal.fire(
              'Saved',
              'Your Menu has been saved.',
              'success'
            );
          }
          this.getRecords();
          this.cancel();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  sorting(sort: any) {
    this.sortOrder = (this.sortBy === sort) ? ((this.sortOrder === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords();
  }
  search(isReset: boolean) {
    if (isReset) {
      this.cancel();
    }
    this.showLoading();
    this.getRecords();
  }
  addprice(indexOfelement: any) {
    this.menudetails[indexOfelement].prices.push(
      {
        quantity: '',
        price: ''
      }
    );
  }
  addmenus() {
    this.menudetails.push({
      category_id: '',
      sub_category_id: '',
      name: '',
      description: '',
      order_id: this.menudetails.length + 1,
      price: '',
      prices: [
        {
          quantity: '',
          price: ''
        }
      ]
    });
  }
  removeMenu(removeIndex: any, id: any) {
    this.menudetails.splice(removeIndex, 1);
    this.removeHotelMenuDetailId.push(id);
  }
  cancel(): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.idEdit = '';
    this.sortBy = 'name';
    this.sortOrder = 'ASC';
    this.clear();
  }
  onKeyDownEvent(e: any) {
    if (this.isSearch) {
      this.search(false);
    }
  }
  getCategories() {
    this.recipeService.getCategories({
        isLoadAll: true
      }, null)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.categories = response.data;
          } else {
            this.categories = [];
          }
        },
        (err: any) => {
          this.networkIssue();
        });
  }
  getSubcategories() {
    this.recipeService.getSubcategories({
        isLoadAll: true
      }, null)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.subcategories = response.data;
          } else {
            this.subcategories = [];
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getRecords() {
    this.showLoading();
    this.recipeService.getResMenus({
      name: this.name,
      sort_by: this.sortBy,
      sort_order: this.sortOrder
    },this.currentPage)
    .subscribe((response: any) => {
        if (response.data && response.data && response.data.data.length > 0) {
          this.menus = response.data.data;
        } else {
          this.menus = [];
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  categorySelectionChanged(e: any, indexOfelement: any) {
    if (e && e.value && e.value.id) {
      if (indexOfelement === 0 || indexOfelement) {
        this.menudetails[indexOfelement].category_id = e.value.id;
      } else {
        this.category_id = e.value.id;
      }
    } else {
      if (indexOfelement === 0 || indexOfelement) {
        this.menudetails[indexOfelement].category_id = '';
      } else {
        this.category_id = '';
      }
    }
  }
  subCategorySelectionChanged(e: any, indexOfelement: any) {
    if (e && e.value && e.value.id) {
      if (indexOfelement === 0 || indexOfelement) {
        this.menudetails[indexOfelement].sub_category_id = e.value.id;
      } else {
        this.sub_category_id = e.value.id;
      }
    } else {
      if (indexOfelement === 0 || indexOfelement) {
        this.menudetails[indexOfelement].sub_category_id = '';
      } else {
        this.sub_category_id = '';
      }
    }
  }
  ngOnDestroy() {
    // this.dragulaService.remove('menu-detail');
    // this.subs.unsubscribe();
  }
}
