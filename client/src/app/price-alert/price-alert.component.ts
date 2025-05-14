import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './price-alert.component.html'
})
export class PriceAlertComponent extends BaseComponent implements OnInit {
  priceAlerts: any;
  dtOptions: DataTables.Settings = {};
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.dtOptions = {
      order:[[1, 'desc']]
    };
    this.getRecords();
  }
  getRecords() {
    this.showLoading();
    this.recipeService.priceAlerts()
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          this.priceAlerts = response.data;
        } else {
          this.priceAlerts = [];
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  deleteAlertPrice(id: any) {
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
        this.showLoading();
        this.recipeService.removePriceAlerts({
          id: id,
          is_active: false
        })
        .subscribe((response: any) => {
            this.priceAlerts.splice(this.priceAlerts.findIndex((a: any) => {
              return a.id === id;
            }) , 1);
            this.clearLoading();
          },
          (err: any) => {
            this.networkIssue();
        });
      }
    });
  }
}
