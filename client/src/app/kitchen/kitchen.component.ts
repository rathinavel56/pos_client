import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent } from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './kitchen.component.html'
})
export class KitchenComponent extends BaseComponent implements OnInit {
  tables: any = [];
  userDetail: any;
  isShowLocation: any;
  constructor(public recipeService: RecipeService, public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.userDetail = sessionStorage.getItem("retail_pos")
      ? JSON.parse(sessionStorage.getItem("retail_pos") || "{}")
      : null;
    if (this.userDetail) {
      this.isShowLocation = this.userDetail.session_detail.location_id == 0;
    }
    this.getRecords();
  }
  getRecords() {
    this.tables = [];
    this.recipeService.tablePendingOrders(null)
      .subscribe((response: any) => {
        let tableDetails = response.data;
        if (tableDetails.length > 0) {
          tableDetails = tableDetails.reduce((acc: { [key: number]: any[] }, order: any) => {
            if (!acc[order.table.table_no]) {
              acc[order.table.table_no] = [];
            }
            acc[order.table.table_no].push(order);
            return acc;
          }, {});
          tableDetails = Object.keys(tableDetails)
            .map(tableNo => ({
              table_no: +tableNo, // Convert key to number
              orders: tableDetails[+tableNo]
            }))
            .sort((a, b) => a.table_no - b.table_no);
            tableDetails.forEach((element: any) => {
              let groupedCart = element.orders.reduce((acc: any, item: any) => {
                if (!acc[item.uniq]) {
                  acc[item.uniq] = item;
                  acc[item.uniq].details = [];
                } else {
                  acc[item.uniq].details.push(item);
                }
                return acc;
              }, {});
              element.orders = Object.values(groupedCart).reduce((acc: any, curr) => acc.concat(curr), []);
              this.tables.push(element);
            });
            
        }
        this.clearLoading();
      },
        (err: any) => {
          this.networkIssue();
        });
  }
  saveDetails(request: any) {
    this.showLoading();
    this.recipeService.tableUpdatePendingOrder(request)
      .subscribe((response: any) => {
        this.getRecords();
        Swal.fire(
          'Saved',
          'Your Details has been saved.',
          'success'
        );
      },
        (err: any) => {
          this.networkIssue();
        });
  }
}
