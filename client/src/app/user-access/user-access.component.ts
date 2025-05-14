import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';
import { Router } from '@angular/router';

@Component({
  templateUrl: './user-access.component.html'
})
export class UserAccessComponent extends BaseComponent implements OnInit {
  isSearch: boolean = true;
  isAdd: boolean = false;
  isEdit: boolean = false;
  roles: any = [];
  roleDetails: any = [];
  menus: any = [];
  name: any = '';
  id: any = '';
  items: TreeviewItem[] = [];
  config = TreeviewConfig.create({
    hasAllCheckBox: true,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: true,
    maxHeight: 1000
  });
  sortBy: any = 'name';
  sortOrder: any = 'ASC';
  currentPage: any = 1;
  constructor(public recipeService: RecipeService, public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.getMenus();
    this.getRecords();
  }
  sorting(sort: any) {
    this.sortOrder = (this.sortBy === sort) ? ((this.sortOrder === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords();
  }
  add() {
    this.isAdd = true;
    this.isSearch = false;
    this.name = '';
  }
  edit(role: any): void {
    this.isEdit = true;
    this.isSearch = false;
    this.id = role.id;
    this.name = role.name;
    this.getRoleDetail(role);
    this.scrollTop();
  }
  cancel(): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.name = '';
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
    let menus: any = this.getMenuDetails();
    if (id || (this.name && menus.length > 0)) {
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
            this.saveDetails(id, menus);
          }
        })
      } else {
        this.saveDetails(id, menus);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill the required fields'
      });
    }
  }
  getRecords() {
      this.recipeService.getRoles({
        name: this.name,
        sort_by: this.sortBy,
        sort_order: this.sortOrder
      })
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.roles = response.data.filter((e: any) => e.id !== 0);
          } else {
            this.roles = [];
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getMenus() {
    this.recipeService.getMenuDetail()
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.menus = response.data;
          } else {
            this.menus = [];
          }
          this.setTreeView();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getRoleDetail(role: any) {
    this.showLoading();
    this.recipeService.getRoleDetail({
        id: role.id
      })
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.roleDetails = response.data;
          } else {
            this.roleDetails = [];
          }
          this.setTreeView();
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  saveDetails(id: any, menus: any) {
    if (id || menus.length > 0) {
      this.showLoading();
      let request: any;
      if (id) {
        request = {
          id: id
        };
      } else {
        request = {
          menus: menus,
          name: this.name,
          id: this.id ? this.id : undefined
        };
      }
      this.recipeService.saveRole(request)
          .subscribe((response: any) => {
            this.clearLoading();
            if (id) {
              Swal.fire(
                'Deleted!',
                'Your data has been deleted.',
                'success'
              );
            } else {
              Swal.fire(
                'Saved',
                'Your data has been saved.',
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
  }
  getMenuDetails() {
    let menus: any = [];
    this.items.forEach((element: any) => {
      if (element.children && element.children.length > 0) {
        element.children.forEach((e: any) => {
          if (e.checked) {
            menus.push(e.value);
          }
        });
      }
    });
    return menus;
  }
  setTreeView() {
    this.items = [];
    this.menus.forEach((element: any) => {
      let treeData: any;
      if (element.submenu && element.submenu.length > 0) {
        let childrens: any = [];
        element.submenu.forEach((child: any) => {
          let menuDtl: any = this.roleDetails.find((e: any) => child.id === e.menu_id);
          childrens.push({
            text: child.title,
            value: {
              id: child.id,
              parent_menu_id: child.parent_menu_id,
              is_write: (menuDtl && menuDtl.is_write)
            },
            is_write: child.is_write,
            isShowCheckox: true,
            checked: menuDtl ? true : false
          });
        });
        treeData = {
          text: element.title,
          value: {
            id: element.id,
            parent_menu_id: element.parent_menu_id
          },
          children: childrens
        };
      } else {
        treeData = {
          text: element.title,
          value: {
            id: element.id,
            parent_menu_id: element.parent_menu_id
          }
        };
      }
      this.items.push(treeData);
    });
  }
}
