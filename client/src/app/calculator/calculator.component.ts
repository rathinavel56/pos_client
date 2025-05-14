import { TableUtil } from './../shared/util/tableUtil';
import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';

@Component({
  templateUrl: './calculator.component.html'
})
export class CalculatorComponent extends BaseComponent implements OnInit {
  calculateRecipes: any = [];
  recipes: any = [];
  ingredients: any = [];
  config:any;
  isNoRecords:any = true;
  isTreeView: any = false;
  calculateRecipeUpload: any = '';
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.getRecipes();
    this.config = {
        displayKey:"name", //if objects array passed which key to be displayed defaults to description
        search:true, //true/false for the search functionlity defaults to false,
        height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
        placeholder:'Search', // text to be displayed when no item is selected defaults to Select,
        customComparator: ()=>{}, // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
        moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
        noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
        searchPlaceholder:'Search', // label thats displayed in search input,
        searchOnKey: 'name' // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
    };
  }

  exportTable() {
    TableUtil.exportTableToExcel("sumOfIngredients", "calculator", true);
  }

  add() {
    this.calculateRecipes.push({
      recipe_id: this.recipes[0].id,
      recipe_name: this.recipes[0].name,
      quantity: null,
      unit: this.recipes[0].unit.name
    });
  }
  selectionChanged(e: any, indexOfelement: any) {
    if (e && e.value && e.value.id) {
      this.calculateRecipes[indexOfelement].recipe_id = e.value.id;
      this.calculateRecipes[indexOfelement].recipe_name = e.value.name;
      this.calculateRecipes[indexOfelement].unit = e.value.unit.name;
      this.calculateRecipes[indexOfelement].quantity = null;
    } else {
      this.calculateRecipes[indexOfelement].recipe_id = null;
      this.calculateRecipes[indexOfelement].recipe_name = null;
      this.calculateRecipes[indexOfelement].unit = null;
      this.calculateRecipes[indexOfelement].quantity = null;
    }
  }
  getRecipes()  {
    this.recipeService.getRecipes({
      isLoadRelatioship: false,
      isLoadAll: true
    }, null)
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          this.recipes = response.data;
          this.add();
        }
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  getCalculateIngredients(errorNames: any)  {
    this.calculateRecipes = this.calculateRecipes.filter((e:any) => e.quantity != null && e.quantity != undefined && e.quantity.toString().trim() != '');
    if (this.calculateRecipes.length > 0) {
      this.showLoading();
      this.recipeService.getCalculateIngredients({
        data : this.calculateRecipes,
        isTreeView : this.isTreeView
      })
      .subscribe((response: any) => {
            if (response.data && response.data.length > 0) {
              this.ingredients = response.data;
              //this.getTree();
              this.isNoRecords = false;
            } else {
              this.isNoRecords = true;
            }
           this.clearLoading();
           if (errorNames && errorNames.length > 0) {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Invalid Receipes : ' + errorNames.toString()
              });
            }
          },
          (err: any) => {
            this.networkIssue();
         });
    } else {
      this.add();
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill the required fields'
      });
    }
  }
  getTree() {
    const dataSource: any = [];
    let parent: any = 1;
    let children: any = 1;
    this.ingredients.forEach((item: any) => {
      dataSource.push({
        text: item.name,
        value: `0.${parent}`
      });
      const childrens: any = item.calculatedIngredients;
      if (childrens.length > 0) {
        childrens.forEach((subitem: any) => {
          dataSource.push({
              text : subitem.name,
              value : subitem.id
          });
          children++;
        });
      }
      parent++;
    });
    //this.treeService.initialize(dataSource);
  }
  cancel() {
    this.calculateRecipes = [];
    this.ingredients = [];
    this.add();
  }
  onFileChange(ev: any) {
    let workBook: any = null;
    let jsonData: any = null;
    const reader: any = new FileReader();
    const file: any = ev.target.files[0];
    reader.onload = (event: any) => {
      const data: any = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet: any = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      if (jsonData.Sheet1 && jsonData.Sheet1.length > 0) {
        let importCalculateRecipes: any = [];
        let errorNames: any = [];
        jsonData.Sheet1.forEach((element: any) => {
          let receipe: any = this.recipes.find((e: any) => e.name.replace(/\s/g,'').toLowerCase() === element.Recipes.replace(/\s/g,'').toLowerCase());
          if (receipe) {
            importCalculateRecipes.push({
              recipe_id: receipe.id,
              recipe_name: element.Recipes,
              quantity: element.quantity,
              unit: receipe.unit.name,
              price: receipe.cost,
            });
          } else {
            errorNames.push(element.Recipes);
          }
        });
        if (importCalculateRecipes.length > 0) {
          this.calculateRecipes =  importCalculateRecipes;
          this.getCalculateIngredients(errorNames);
        } else {
          this.calculateRecipes = [];
        }
      }
      this.calculateRecipeUpload = '';
    }
    reader.readAsBinaryString(file);
  }
}
