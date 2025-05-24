import { Component, OnInit } from "@angular/core";
import { RecipeService } from "../shared/service/recipe.service";
import { BaseComponent } from "../base.component";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import * as XLSX from "xlsx";
import { TableUtil } from "../shared/util/tableUtil";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";


@Component({
  selector: "app-today-menu",
  templateUrl: "./today-menu.component.html",
})
export class TodayMenuComponent extends BaseComponent implements OnInit {
  receipes: any = [];
  locations: any = [];
  receipeInHand: any = [];
  requestUpload: any;
  modalReference: any;
  isPreview: any = false;
  isShowLocation: boolean = false;
  config: any;
  location_id: any = "";
  hostName: any;
  rootMenu: any;
  categoryLoading: any = false;
  categories: any = [];
  selectedCategories: any = [];
  exportHide = false;
  constructor(
    public recipeService: RecipeService,
    public router: Router,
    private modalService: NgbModal
  ) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.hostName =
      window.location.hostname !== "localhost"
        ? "http://" + window.location.hostname
        : "http://vijaypos.info";
    this.config = {
      displayKey: "name",
      search: true,
      height: "auto",
      placeholder: "Search",
      customComparator: () => {},
      moreText: "more",
      noResultsFound: "No results found!",
      searchPlaceholder: "Search",
      searchOnKey: "name",
    };
    let userDetail: any = sessionStorage.getItem("retail_pos")
      ? JSON.parse(sessionStorage.getItem("retail_pos") || "{}")
      : null;
    if (userDetail) {
      this.isShowLocation = userDetail.session_detail.location_id == 0;
      this.rootMenu = userDetail.root_menu;
    }
    if (this.isShowLocation) {
      this.getLocations();
    } else {
      this.getRecords();
    }
  }
  getLocations() {
    this.showLoading();
    this.recipeService
      .getLocations(
        {
          q: "all",
        },
        null
      )
      .subscribe(
        (response: any) => {
          if (response.data && response.data.length > 0) {
            this.locations = response.data;
          } else {
            this.locations = [];
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  locationSelectionChanged(e: any) {
    if (e && e.value && e.value.id) {
      this.location_id = e.value.id;
      this.getRecords();
    }
  }
  submit() {
    this.showLoading();
    this.recipeService
      .todayMenu({
        location_id: this.location_id ? this.location_id : null,
        details: this.receipes.filter((e: any) => +e.inHand > 0)
      })
      .subscribe(
        () => {
          this.clearLoading();
          Swal.fire("Saved!", "Saved Successfully.", "success");
          setTimeout(() => {
            this.router.navigate([this.rootMenu]);
          }, 2000);
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  export() {
    this.showLoading();
    this.exportHide = true;
    setTimeout(() => {
      let dataTableSelect: any = document.querySelector('#today_stock_length select');
      let ogValue: any = dataTableSelect.value;
      dataTableSelect.value = -1;
      dataTableSelect.dispatchEvent(new Event("change"));
      setTimeout(() => {
        TableUtil.exportTableToExcel("today_stock", "import", true);
        setTimeout(() => {
          dataTableSelect.value = ogValue;
          this.exportHide = false;
          dataTableSelect.dispatchEvent(new Event("change"));
          this.clearLoading();
        }, 1000);
      }, 1000);
    }, 1000);
  }
  onFileChange(ev: any) {
    let workBook: any = null;
    let jsonData: any = null;
    const reader: any = new FileReader();
    const file: any = ev.target.files[0];
    reader.onload = (event: any) => {
      const data: any = reader.result;
      workBook = XLSX.read(data, { type: "binary" });
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet: any = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      if (Object.values(jsonData) && Object.values(jsonData)[0]) {
        let errorNames: any = [];
        let jsonSheetData: any = Object.values(jsonData)[0];
        jsonSheetData = jsonSheetData.filter((pr: any) => (pr['Additional Stocks'] && +pr['Additional Stocks'] > 0));
        if (jsonSheetData && jsonSheetData.length > 0) {
          jsonSheetData.forEach((element: any) => {
            let receipeIndex: any = this.receipes.findIndex(
              (e: any) =>
                e.name.replace(/\s/g, "").toLowerCase() ===
                element['Receipe'].replace(/\s/g, "").toLowerCase());
            if (receipeIndex != -1) {
              let inHand = element['Additional Stocks'].toString().trim();
              this.receipes[receipeIndex].inHand = +inHand;
              this.receipes[receipeIndex].quantity = this.receipes[receipeIndex].parent_stocks + +inHand;
            } else {
              errorNames.push(element['Receipe']);
            }
          });
          if (errorNames && errorNames.length > 0) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Invalid Receipes : " + errorNames.toString(),
            });
          } else {
            Swal.fire("Import", "Completed", "success");
          }
        } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "No Valid Records",
            });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "No Records",
        });
      }
      this.requestUpload = "";
    };
    reader.readAsBinaryString(file);
  }
  openPop(content: any) {
    this.receipeInHand = this.receipes.filter((e: any) => (+e.inHand > 0));
    this.modalReference = this.modalService.open(content);
    let popUp = document.querySelector('.modal-dialog');
    if (popUp) {
      popUp.classList.remove('modal-dialog');
    }
    this.modalReference.result.then(() => {
    });
  }
  getRecords() {
    this.showLoading();
    this.categories = [];
    this.recipeService
      .todayMenu({
        location_id: this.location_id ? this.location_id : null
      })
      .subscribe(
        (response: any) => {
          if (response.data && response.data.length > 0) {
            response.data.forEach((element: any) => {
              if (this.categories.findIndex((e: any) => (e.id === element.category.id)) === -1) {
                this.categories.push(element.category);
              }
              element.parent_stocks = +element.quantity;
            });
            this.receipes = response.data;
          } else {
            this.receipes = [];
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
        }
      );
  }
  filterItems() {
    this.categoryLoading = true;
    this.dataTableShowAll();
  }
  dataTableShowAll() {
    this.showLoading();
    let dataTableSelect: any = document.querySelector('#today_stock_length select');
    let ogValue: any = dataTableSelect.value;
    dataTableSelect.value = -1;
    dataTableSelect.dispatchEvent(new Event("change"));
    setTimeout(() => {
      setTimeout(() => {
        dataTableSelect.value = ogValue;
        dataTableSelect.dispatchEvent(new Event("change"));
        this.categoryLoading = false;
        this.clearLoading();
      }, 1000);
    }, 1000);
  }
  incQty(receipe: any, e: any) {
    if (e.target.value) {
      receipe.quantity = +receipe.parent_stocks + +e.target.value;
    } else {
      receipe.quantity = +receipe.parent_stocks;
    }
  }
}
