import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../base.component';
import { RecipeService } from '../shared/service/recipe.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-translation',
  templateUrl: './translation.component.html',
  styleUrls: ['./translation.component.scss']
})
export class TranslationComponent extends BaseComponent implements OnInit {
    languages: any = [];
    details: any = [];
    constructor(public recipeService: RecipeService,public router: Router) {
      super(recipeService, router);
    }
    ngOnInit() {
      this.showLoading();
      this.getLanguages();
    }
    getLanguages() {
      this.recipeService.getLanguages({q: 'all'}).subscribe((response: any) => {
        this.languages = response.data;
        this.getRecords();
       });
    }
    getRecords() {
      this.recipeService.getTranslations({
          language_id: this.languages[0].id,
        })
        .subscribe((response: any) => {
            if (response.data && response.data.length > 0) {
              this.details = response.data;
            } else {
              this.details = [{
                key_text: '',
                english:'',
                value: ''
              }];
            }
            this.clearLoading();
          },
          (err: any) => {
            this.networkIssue();
         });
    }
    saveDetails() {
      this.showLoading();
        this.recipeService.saveTranslation({
            details: this.details,
            language_id: this.languages[0].id
          })
          .subscribe((response: any) => {
            this.clearLoading();
              Swal.fire(
                'Saved',
                'Your Languages has been saved.',
                'success'
              );
            this.getRecords();
          },
          (err: any) => {
            this.networkIssue();
         });
    }
    addLanguage() {
      this.details.push({
        key_text: '',
        english: '',
        value: ''
      });
    }

}
