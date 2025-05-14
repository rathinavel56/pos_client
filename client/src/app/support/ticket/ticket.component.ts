import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../../shared/service/recipe.service';
import { BaseComponent} from '../../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './ticket.component.html'
})
export class TicketComponent extends BaseComponent implements OnInit {
  isAdd: boolean = false;
  questions: any = [];
  categories: any = [];
  id: any = '';
  lastPage: any;
  page: any;
  currentPage: any = 1;
  sortBy: any = 'name';
  sortOrder: any = 'ASC';
  questionDetail: any;
  config: any;
  isSubmitted: boolean = false;
  questionsTypes: any;
  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.getCategories();
    this.getQuestionsTypes();
    this.getRecords(null);
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
    this.questionDetail = {
      name: '',
      category_id: '',
      question_details: [{
        question_id: '',
        question_type_id: '',
        question_type: '',
        name: '',
        options: ''
      }]
    };
  }
  categoryChanged(eve: any) {
    if (eve && eve.value) {
      this.questionDetail.category_id = eve.value.id;
    } else {
      this.questionDetail.category_id = '';
    }
  }
  add() {
    this.isAdd = true;
    this.questionDetail = {
      name: '',
      category_id: '',
      question_details: [{
        question_id: '',
        question_type_id: '',
        question_type: '',
        name: '',
        options: ''
      }]
    };
  }
  addQuestions() {
    this.questionDetail.question_details.push({
      question_id: '',
      question_type_id: '',
      question_type: '',
      name: '',
      options: ''
    });
  }
  selectionChanged(event: any, detail: any) {
    if (event && event.value && event.value.id) {
      detail.question_type_id = event.value.id;
    } else {
      detail.question_type_id = null;
      detail.options = '';
    }
  }
  cancel(): void {
    this.isAdd = false;
    this.isSubmitted = false;
    this.questionDetail = {
      name: '',
      category_id: '',
      question_details: [{
        question_id: '',
        question_type_id: '',
        question_type: '',
        name: '',
        options: ''
      }]
    };
    this.sortBy = 'name';
    this.sortOrder = 'ASC';
  }
  onKeyDownEvent(e: any) {
    if (!this.isAdd) {
      this.search(false);
    }
  }
  search(isReset: boolean) {
    if (isReset) {
      this.cancel();
    }
    this.showLoading();
    this.getRecords(this.questionDetail.name ? this.questionDetail.name : null);
  }
  removeQuestion(index: any) {
    this.questionDetail.question_details.splice(index, 1);
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
      } else {
        this.isSubmitted = true;
        if (this.validData()) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill the required fields'
          });
        } else {
          this.saveDetails();
        }
      }
  }
  validData() {
    return (!this.questionDetail.name || !this.questionDetail.category_id || (this.questionDetail.question_details.filter((e: any) => (!e.question_type_id || !e.question_type || (e.question_type && e.question_type.is_options === 1 && !e.options))).length > 0));
  }
  setPagination(currentPage : any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords(this.questionDetail.name ? this.questionDetail.name : null);
  }
  getRecords(q: any) {
    this.recipeService.getQuestions({
        q: q ? q : null,
        sort_by: this.sortBy,
        sort_order: this.sortOrder
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data.data && response.data.data.length > 0) {
            this.questions = response.data.data;
            this.page = response.data.current_page;
            this.lastPage = response.data.total;
          } else {
            this.questions = [];
            this.page = 0;
            this.lastPage = 0;
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getQuestionsTypes() {
    this.recipeService.getQuestionsTypes()
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.questionsTypes = response.data;
          } else {
            this.questionsTypes = [];
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  saveDetails(id?: any) {
    this.questionDetail.id = id ? id : undefined;
    this.showLoading();
      this.recipeService.saveQuestion(this.questionDetail)
        .subscribe((response: any) => {
          this.clearLoading();
          if (id) {
            Swal.fire(
              'Deleted!',
              'Your Question has been deleted.',
              'success'
            );
          } else {
            Swal.fire(
              'Saved',
              'Your Question has been saved.',
              'success'
            );
          }
          this.cancel();
          this.getRecords(null);
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  sorting(sort: any) {
    this.sortOrder = (this.sortBy === sort) ? ((this.sortOrder === 'ASC') ? 'DESC' : 'ASC')  : 'ASC';
    this.sortBy = sort;
    this.showLoading();
    this.currentPage = 1;
    this.getRecords(this.questionDetail.name ? this.questionDetail.name : null);
  }
  getCategories() {
    this.recipeService.getCategoriesTicket({
      q: 'all'
    }, 1)
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
          this.categories = response.data;
        } else {
          this.categories = [];
        }
      },
      (err: any) => {
        this.networkIssue();
     });
  }
}
