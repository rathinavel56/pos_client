import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './sub-category.component.html'
})
export class SubCategoryComponent extends BaseComponent implements OnInit {
  isSearch: boolean = true;
  isAdd: boolean = false;
  isEdit: boolean = false;
  subcategories: any = [];
  name: any = '';
  id: any = '';
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
    this.getRecords();
  }
  add() {
    this.isAdd = true;
    this.isSearch = false;
    this.name = '';
  }
  edit(subcategory: any): void {
    this.isAdd = false;
    this.isEdit = true;
    this.isSearch = false;
    this.id = subcategory.id;
    this.name = subcategory.name;
    this.scrollTop();
  }
  cancel(): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.name = '';
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
    this.getRecords();
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
    this.getRecords();
  }
  getRecords() {
    this.recipeService.getSubcategories({
        isLoadRecipe: false,
        name: this.name ? this.name : null,
        sort_by: this.sortBy,
        sort_order: this.sortOrder
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.subcategories = response.data;
            this.page = response.data.current_page;
            this.lastPage = response.data.total;
          } else {
            this.subcategories = [];
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
      this.recipeService.saveSubcategory({
          id: id ? id : this.id,
          name: this.name,
          is_active: id ? false : true
        })
        .subscribe((response: any) => {
          this.clearLoading();
          if (id) {
            Swal.fire(
              'Deleted!',
              'Your subcategory has been deleted.',
              'success'
            );
          } else {
            Swal.fire(
              'Saved',
              'Your subcategory has been saved.',
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
}
