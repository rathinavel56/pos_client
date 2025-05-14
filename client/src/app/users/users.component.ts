import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './users.component.html'
})
export class UsersComponent extends BaseComponent implements OnInit {
  isSearch: boolean = true;
  isAdd: boolean = false;
  isEdit: boolean = false;
  roles: any = [];
  locations: any = [];
  users: any = [];
  name: any = '';
  username: any = '';
  role_id: any = '';
  location_id: any = '';
  vendor_id: any = '';
  password: any = '';
  is_engineer: any = '';
  id: any = '';
  lastPage: any;
  page: any;
  currentPage: any = 1;
  sortBy: any = 'name';
  sortOrder: any = 'ASC';
  cats: any = [];
  catOg: any = [];
  config: any;
  categories: any = [];
  vendors: any = [];
  constructor(public recipeService: RecipeService, public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.getRecords();
    this.getRoles();
    this.getLocations();
    this.getCategoriesTicket();
    this.getVendors();
    this.getCategories();
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
  engineerChange($event: any) {
    if ($event.target.value === false) {
      this.categories = [];
    }
  }
  add() {
    this.isAdd = true;
    this.isSearch = false;
    this.name = '';
    this.is_engineer = false;
  }
  edit(user: any): void {
    this.isEdit = true;
    this.isSearch = false;
    this.id = user.id;
    this.name = user.name;
    this.username = user.username;
    this.role_id = user.role_id;
    this.location_id = user.location_id;
    this.vendor_id = user.vendor_id;
    this.password = user.password;
    this.is_engineer = user.is_engineer;
    this.categories = [];
    if (this.is_engineer === 1 && user.categories && user.categories.length > 0 && +this.role_id !== 4) {
      user.categories.forEach((element: any) => {
        this.categories.push(element.category);
      });
    } else if (user.categories && user.categories.length > 0 && +this.role_id === 4) {
      user.categories.forEach((element: any) => {
        this.categories.push(element.categoryog);
      });
    }
    this.scrollTop();
  }
  cancel(): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.username = '';
    this.id = '';
    this.name = '';
    this.location_id = '';
    this.password = '';
    this.vendor_id = '';
    this.is_engineer = '';
    this.role_id = null;
  }
  onKeyDownEvent(e: any) {
    if (this.isSearch) {
      this.search(false);
    }
  }
  getCategories()  {
    this.recipeService.getCategories({
      q: 'all'
    }, null)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.catOg = response.data;
            let anyIndex = this.catOg.findIndex((a: any) => {
              return a.name.toLowerCase().includes('any');
            });
            if (anyIndex > -1) {
              let any = this.categories[anyIndex];
              this.catOg.splice(this.catOg.findIndex((a: any) => {
                return a.name.toLowerCase().includes('any');
              }) , 1);
              this.catOg.unshift(any);
            }
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getCategoriesTicket()  {
    this.recipeService.getCategoriesTicket({
      q: 'all'
    }, null)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.cats = response.data;
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  search(isReset: boolean) {
    if (isReset) {
      this.cancel();
    }
    this.showLoading();
    this.getRecords();
  }
  sorting(sort: any) {
    this.sortOrder = (this.sortBy === sort) ? ((this.sortOrder === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords();
  }
  submit(id: any) {
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
      } else if (this.name !== '' && this.username !== '' && this.role_id >= 0 && this.password !== '' && (this.role_id === 0 || (this.role_id > 0 && (this.location_id === 0 || this.location_id))) && (this.is_engineer !== 1 || (this.is_engineer === 1 && this.categories.length > 0) || (+this.role_id === 4 && this.categories.length > 0))) {
        this.saveDetails(id);
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
    this.recipeService.getUsers({
      name: this.name ? this.name : '',
      is_engineer: this.is_engineer,
      sort_by: this.sortBy,
      sort_order: this.sortOrder
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data.data.length > 0) {
            this.users = response.data.data;
            this.page = response.data.current_page;
            this.lastPage = response.data.total;
          } else {
            this.users = [];
            this.page = 0;
            this.lastPage = 0;
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getVendors() {
    this.vendors = [];
    this.recipeService.getVendors({
        q: 'all'
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.vendors = response.data;
          }
          this.vendors.unshift({
            id: '',
            name: 'All'
          });
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  saveDetails(id: any) {
    this.showLoading();
      this.recipeService.saveUser({
          id: id ? id : this.id,
          name: this.name,
          username: this.username,
          password: this.password,
          role_id: this.role_id,
          location_id: this.location_id,
          vendor_id: this.vendor_id,
          is_active: id ? false : true,
          is_engineer: this.is_engineer,
          categories: this.categories
        })
        .subscribe((response: any) => {
          this.clearLoading();
          if (id) {
            Swal.fire(
              'Deleted!',
              'Your User has been deleted.',
              'success'
            );
          } else {
            Swal.fire(
              'Saved',
              'Your User has been saved.',
              'success'
            );
          }
          this.cancel();
          this.getRecords();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getRoles()  {
    this.recipeService.getRoles({
        q: 'all'
      })
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.roles = response.data;
            this.role_id = this.roles[0].id;
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getLocations()  {
    this.recipeService.getLocations({
      q: 'all'
    },null)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.locations = response.data;
            this.locations.unshift({
              id: 0,
              name: 'All'
            });
            this.location_id = this.locations[0].id;
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
}
