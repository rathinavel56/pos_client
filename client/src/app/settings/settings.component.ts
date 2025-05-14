import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './settings.component.html'
})
export class SettingsComponent extends BaseComponent implements OnInit {
  currentPassword: any;
  password: any;
  confirmPassword: any;
  settings: any;
  config: any;
  categories: any;
  formData: any;
  mobile: any;
  otpMsg: any;
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
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
    this.showLoading();
    this.getCategories();
  }
  categoriesSelectionChanged(setting: any, eve: any) {
    setting.value = '';
    let values: any = [];
    if (eve && eve.value && eve.value.length > 0) {
      eve.value.forEach((element: any) => {
        values.push(element.id);
      });
      setting.value = values.toString();
    }
  }
  getRecords() {
    this.showLoading();
    this.recipeService.settings({
          type: (this.router.url.includes('/business-settings') ? 1 : 0)
        })
        .subscribe((response: any) => {
          response.data.forEach((element: any) => {
            if (element.description.includes('Categories')) {
              element.categories = [];
              if (element.value) {
                let categories = element.value.split(',');
                categories.forEach((category: any) => {
                  element.categories.push(this.categories.find((cat: any) => (cat.id === +category)));
                });
              }
            }
          });
          this.settings = response.data;
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  clearZero(setting: any, key: any, settingDetail: any) {
    setting[key] = (+setting[key] > 0) ? setting[key] : 0;
    this.correctRange(settingDetail);
  }
  correctRange(settingDetail: any) {
    settingDetail['value1'] = +settingDetail['value1'] ? settingDetail['value1'] : +settingDetail['value'];
    let lastValue = +settingDetail['value1'];
    if (settingDetail.childrens && settingDetail.childrens.length > 0) {
      settingDetail.childrens.forEach((element: any, i: any) => {
        element['value'] = lastValue + 1;
        if ((settingDetail.childrens.length-1) === i) {
          element['value1'] = '';

        } else {
          element['value1'] = +element['value1'] ? element['value1'] : +element['value'];
        }
        lastValue = +element['value1'];
      });
    }
  }
  submit() {
    let ranges = this.settings.filter((e: any) => (e.is_range === 1));
    let isNotRange = false;
    if (ranges.length > 0) {
      let a = 0;
      ranges.forEach((element: any, index: any) => {
        if (index === 0) {
          element.value = 0;
        }
        if (!isNotRange && ((+element.value > +element.value1))) {
          isNotRange = true;
        } else if (!isNotRange) {
          a = +element.value1;
        }
        if (element.childrens && element.childrens.length > 0) {
          let percentage = +element.value2;
          element.childrens.forEach((ele: any, index1: any) => {
              let value1 = ele.value1;
              ele.value = +a;
              if (index1 === (element.childrens.length -1)) {
                value1 = (+ele.value + 1);
                ele.value1 = '';
                ele.value2 = (ele.value2 !== '') ? ele.value2 : percentage;
              } else if (!ele.value1) {
                ele.value1 = (ele.value + 1);
              }
              if (!isNotRange && ((+ele.value > +value1))) {
                isNotRange = true;
              } else if (!isNotRange) {
                a = +ele.value1;
              }
              percentage = +element.value2;
          });
        } else {
          element.value1 = '';
        }
      });
      if (isNotRange) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Please Correct The Ranges'
        });
        return;
      }
    }
    this.showLoading();
    this.formData = new FormData();
    this.formData.append('data', JSON.stringify({
      details: this.settings.filter((e: any) => e.type !== 'label')
    }));
    this.recipeService.setting(this.formData)
        .subscribe((response: any) => {
          if (response && response.status === 'success') {
            Swal.fire(
              'Saved',
              'Your Settings has been saved.',
              'success'
            );
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Internal Server Error'
            });
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  deleteSetting(setting: any, settingDetail: any) {
    setting.is_active = false;
    settingDetail.childrens = settingDetail.childrens.filter((e: any) => (e.is_active === true || e.is_active === 1)).length;
    this.sortRanges(settingDetail);
  }
  addRange(settingDetail: any) {
    let detail = JSON.parse(JSON.stringify(settingDetail));
    detail.parent_id = 0;
    detail.value = '';
    detail.value1 = '';
    detail.value2 = '';
    if (settingDetail.childrens && settingDetail.childrens.length > 0) {
      settingDetail.childrens.push(detail);
    } else {
      settingDetail.childrens = [detail];
    }
    this.correctRange(settingDetail);
    this.sortRanges(settingDetail);
  }
  sortRanges(element: any) {
      element.value = 0;
      let a = +element.value1;
      if (element.childrens && element.childrens.length > 0) {
        element.childrens.forEach((ele: any, index1: any) => {
            ele.value = (index1 === 0) ? +a : (a +1);
            if (index1 === (element.childrens.length -1)) {
              ele.value1 = '';
            } else if (!ele.value1) {
              ele.value1 = (ele.value + 1);
            }
            a = +ele.value1;
        });
      } else {
        element.value1 = '';
      }
  }
  getCategories()  {
    this.recipeService.getCategories({
      q: 'all'
    }, null)
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.categories = response.data;
            this.getRecords();
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  testOtp() {
    if (!this.mobile || this.mobile.length < 10) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please Correct The Mobile Number'
      });
      return;
    }
    this.otpMsg = '';
    this.showLoading();
    this.recipeService.testOtp({
        mobile: this.mobile
      })
      .subscribe((response: any) => {
        this.otpMsg = response.message;
          if (response && response.success) {
            Swal.fire(
              'Success',
              'Otp Success',
              'success'
            );
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Internal Server Error'
            });
          }          
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
}
