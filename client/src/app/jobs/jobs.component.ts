import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../shared/service/recipe.service';
import { BaseComponent} from '../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './jobs.component.html'
})
export class JobComponent extends BaseComponent implements OnInit {
  jobs: any = [];
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.getRecords();
  }
  getRecords() {
    this.jobs = [];
    this.recipeService.jobs()
      .subscribe((response: any) => {
          this.jobs = response.data;
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  updateJob(job: any) {
    this.showLoading();
    this.recipeService.job(job.url)
        .subscribe((response: any) => {
          this.clearLoading();
            Swal.fire(
              'Saved',
              'Your Job has been Completed.',
              'success'
            );
        },
        (err: any) => {
          this.networkIssue();
       });
  }
}
