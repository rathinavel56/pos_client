import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './category.component.html'
})
export class CategoryComponent extends BaseComponent implements OnInit {
  isSearch: boolean = true;
  isAdd: boolean = false;
  isEdit: boolean = false;
  categories: any = [];
  name: any = '';
  is_sku_analytics: any = false;
  is_category_analytics: any = false;
  id: any = '';
  step_size: any = 1;
  is_order: any = false;
  lastPage: any;
  page: any;
  currentPage: any = 1;
  sortBy: any = 'name';
  sortOrder: any = 'ASC';
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.getRecords(null);
  }
  add() {
    this.isAdd = true;
    this.isSearch = false;
    this.name = '';
    this.id = '';
    this.is_sku_analytics = false;
    this.is_category_analytics = false;
  }
  edit(category: any): void {
    this.isAdd = false;
    this.isEdit = true;
    this.isSearch = false;
    this.id = category.id;
    this.name = category.name;
    this.is_sku_analytics = category.is_sku_analytics;
    this.is_category_analytics = category.is_category_analytics;
    this.step_size = category.step_size;
    this.is_order = category.is_order;
    this.scrollTop();
  }
  cancel(): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.name = '';
    this.id = '';
    this.step_size = 1;
    this.is_order = '';
    this.is_sku_analytics = false;
    this.is_category_analytics = false;
    this.sortBy = 'name';
    this.sortOrder = 'ASC';
  }
  onKeyDownEvent(e: any) {
    if (this.isSearch) {
      this.search(false);
    }
  }
  search(isReset: boolean) {
    if (isReset) {
      this.cancel();
    }
    this.showLoading();
    this.getRecords(this.name ? this.name : null);
  }
  submit(id: any) {
    if (id || (this.name)) {
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
            this.saveDetails(id);
          }
        })
      } else {
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
  setPagination(currentPage : any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords(this.name ? this.name : null);
  }
  getRecords(q: any) {
    this.recipeService.getCategories({
        isLoadRecipe: false,
        q: q ? q : null,
        sort_by: this.sortBy,
        sort_order: this.sortOrder
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.categories = response.data;
            this.page = response.data.current_page;
            this.lastPage = response.data.total;
          } else {
            this.categories = [];
            this.page = 0;
            this.lastPage = 0;
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  saveDetails(id: any) {
    this.showLoading();
      this.recipeService.saveCategory({
          id: id ? id : this.id,
          name: this.name,
          is_active: id ? false : true,
          is_sku_analytics: this.is_sku_analytics,
          is_category_analytics: this.is_category_analytics,
          step_size: this.step_size,
          is_order: this.is_order,
        })
        .subscribe((response: any) => {
          this.clearLoading();
          if (id) {
            Swal.fire(
              'Deleted!',
              'Your Category has been deleted.',
              'success'
            );
          } else {
            Swal.fire(
              'Saved',
              'Your Category has been saved.',
              'success'
            );
          }
          this.cancel();
          this.getRecords(null);
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
    this.getRecords(this.name ? this.name : null);
  }
}
