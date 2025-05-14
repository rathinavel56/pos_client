import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './menu-location.component.html'
})
export class MenuLocationComponent extends BaseComponent implements OnInit {
  isSearch: boolean = true;
  isAdd: boolean = false;
  isEdit: boolean = false;
  locations: any = [];
  name: any = '';
  id: any = '';
  lastPage: any;
  page: any;
  currentPage: any = 1;
  sortBy: any = 'name';
  sortOrder: any = 'ASC';
  logoFile: any;
  filesUploded: any;
  formData: any;
  isSubmitted: any = false;
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
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
  add() {
    this.isAdd = true;
    this.isSearch = false;
    this.name = '';
  }
  edit(location: any): void {
    this.isEdit = true;
    this.isSearch = false;
    this.id = location.id;
    this.name = location.name;
    this.logoFile = location.attachment;
    this.scrollTop();
  }
  cancel(): void {
    this.isAdd = false;
    this.isEdit = false;
    this.isSearch = true;
    this.name = '';
    this.sortBy = 'name';
    this.sortOrder = 'ASC';
    this.logoFile = '';
    this.filesUploded = '';
    this.formData = '';
    this.isSubmitted = false;
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
    this.isSubmitted = true;
    if (id || (this.name && (this.logoFile || this.filesUploded))) {
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
  uploadFile(event: any) {
    this.filesUploded = event.target.files;
  }
  deleteAttachment() {
    this.logoFile = undefined;
  }
  downloadFile(attachment: any) {
    let hostName =
      window.location.hostname !== "localhost"
        ? "http://" + window.location.hostname
        : "http://vijaypos.info";
    let link: any = document.createElement("a");
    link.href = hostName + '/assets/download/logo/' + attachment.file_name;
    document.body.appendChild(link);
    let fileExt: any = attachment.file_name.split('.').pop();
    link.download = attachment.file_name + '.' + fileExt;
    link.target = '_blank';
    link.click();
    document.body.removeChild(link);
  }
  getRecords() {
    this.recipeService.getMenuLocations({
        name: this.name ? this.name : null,
        sort_by: this.sortBy,
        sort_order: this.sortOrder
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data.data.length > 0) {
            this.locations = response.data.data;
            this.page = response.data.current_page;
            this.lastPage = response.data.total;
          } else {
            this.locations = [];
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
    this.formData = new FormData();
    if (this.filesUploded && this.filesUploded.length > 0) {
      this.formData.append('file', this.filesUploded[0], this.filesUploded[0].name);
    }
    this.formData.append('data', JSON.stringify({
      id: id ? id : this.id,
      name: this.name,
      is_active: id ? false : true
    }));
    this.recipeService.saveMenuLocations(this.formData)
        .subscribe((response: any) => {
          this.clearLoading();
          if (id) {
            Swal.fire(
              'Deleted!',
              'Your Locations has been deleted.',
              'success'
            );
          } else {
            Swal.fire(
              'Saved',
              'Your Locations has been saved.',
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
