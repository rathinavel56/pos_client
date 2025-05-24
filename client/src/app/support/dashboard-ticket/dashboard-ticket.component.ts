import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../../shared/service/recipe.service';
import { BaseComponent} from '../../base.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  templateUrl: './dashboard-ticket.component.html'
})
export class DashboardTicketComponent extends BaseComponent implements OnInit {
  isAdd: boolean = false;
  questions: any = [];
  question: any;
  categories: any = [];
  id: any = '';
  lastPage: any;
  page: any;
  currentPage: any = 1;
  sortBy: any = 'id';
  sortOrder: any = 'DESC';
  questionDetail: any;
  config: any;
  isSubmitted: boolean = false;
  tickets: any = [];
  questionId: any;
  configPlain: any;
  ticketNo: any;
  isShowLocation: any = false;
  locations: any = [];
  location: any;
  ticketDetails: any;
  isEngineer: any = false;
  loginId: any = false;
  loginLocationId: any = false;
  engineers: any = [];
  locationEngineers: any = [];
  ticketStatus: any = [];
  formData: any;
  filesUploded: any;
  files: any = [];

  constructor(public recipeService: RecipeService,public router: Router) {
    super(recipeService, router);
  }
  ngOnInit() {
    this.showLoading();
    this.questionDetail = {
      id: '',
      name: '',
      category_id: '',
      location: '',
      status: '',
      status_id: '',
      question_details: [{
        question_id: '',
        question_type_id: '',
        question_type: '',
        name: '',
        options: '',
        answer: '',
        value1: '',
        value2: ''
      }]
    };
    this.getCategories();
    this.getRecords();
    this.getTicketStatus();
    let userDetail: any = sessionStorage.getItem('retail_pos') ? JSON.parse(sessionStorage.getItem('retail_pos') || '{}') : null;
    if (userDetail) {
      this.isShowLocation = (userDetail.session_detail.location_id == 0);
      this.isEngineer = (userDetail.session_detail.is_engineer == true);
      if (this.isShowLocation || this.isEngineer) {
        this.loginId = +userDetail.session_detail.id;
        this.loginLocationId = +userDetail.session_detail.location_id;
        this.getEngineers();
      }
    }
    if (this.isShowLocation) {
      this.getLocations();
    }
    this.configPlain = {
      search: true,
      height: 'auto',
      placeholder: 'Search',
      customComparator: ()=>{},
      moreText: 'more',
      noResultsFound: 'No results found!',
      searchPlaceholder: 'Search'
    };
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
  }
  getLocations() {
    this.recipeService.getLocations({
      q: 'all'
    }, null)
    .subscribe((response: any) => {
        if (response.data && response.data.length > 0) {
         this.locations = response.data;
        } else {
          this.locations = [];
        }
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  add() {
    this.isAdd = true;
    this.questionDetail = {
      name: '',
      category_id: '',
      location: '',
      status: '',
      status_id: '',
      question_details: [{
        question_id: '',
        question_type_id: '',
        question_type: '',
        name: '',
        options: ''
      }]
    };
  }
  addTicket() {
    this.questionDetail.question_details.push({
      question_id: '',
      question_type_id: '',
      question_type: '',
      name: '',
      options: ''
    });
    this.question = '';
  }
  selectionChanged(event: any, detail: any) {
    if (event && event.value && event.value.id) {
      detail.question_type_id = event.value.id;
    } else {
      detail.question_type_id = null;
      detail.options = '';
    }
  }
  selectionChang(event: any, detail: any) {
    if (event && event.value && event.value.length !== 0) {
      detail.answer = event.value;
    } else {
      detail.answer = '';
    }
  }
  datetimepickerChg(detail: any) {
    setTimeout(()=>{
      detail.value2 = (!detail.value2) ? '00:00:00' : detail.value2;
      detail.answer = (detail.value1) ? (detail.value1 + ' ' + (detail.value2)) : '';
    }, 0);
  }
  checkBoxSelected($eve: any, detail: any, option: any) {
    if ($eve && $eve.currentTarget && $eve.currentTarget.checked) {
      detail.answer.push(option);
    } else {
      detail.answer.splice(detail.answer.indexOf(option), 1);
    }
  }
  radioSelected($eve: any, detail: any, option: any) {
    if ($eve && $eve.currentTarget && $eve.currentTarget.checked) {
      detail.answer = option;
    } else {
      detail.answer = '';
    }
  }
  questionChange($eve: any) {
    let locationId = this.questionDetail.location;
    if ($eve && $eve.value && $eve.value.id) {
      this.questionDetail = $eve.value;
      this.questionDetail.location = locationId;
    } else {
      let category = this.questionDetail.category;
      this.questionDetail = {
        name: '',
        category_id: '',
        location: locationId,
        category: category,
        status: '',
        status_id: '',
        question_details: [{
          question_id: '',
          question_type_id: '',
          question_type: '',
          name: '',
          options: ''
        }]
      };
      this.question = '';
    }
  }
  cancel(): void {
    this.ticketNo = '';
    this.isAdd = false;
    this.isSubmitted = false;
    this.question = '';
    this.files = [];
    this.questionDetail = {
      name: '',
      category_id: '',
      location: '',
      status: '',
      status_id: '',
      question_details: [{
        question_id: '',
        question_type_id: '',
        question_type: '',
        name: '',
        options: ''
      }]
    };
    this.sortBy = 'id';
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
    this.getRecords();
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
    return (!this.question || (this.isShowLocation && !this.questionDetail.location) || !this.questionDetail.category_id || (this.questionDetail.question_details.filter((e: any) => (!e.question_type_id || !e.question_type || (e.question_type && e.question_type.is_options === 1 && !e.options))).length > 0));
  }
  setPagination(currentPage : any) {
    this.showLoading();
    this.currentPage = currentPage;
    this.getRecords();
  }
  getRecords() {
    this.recipeService.getTickets({
        ticketNo: this.ticketNo,
        location_id: this.questionDetail.location ? this.questionDetail.location.id : undefined,
        category_id: this.questionDetail.category ? this.questionDetail.category.id : undefined,
        status_id: (this.questionDetail && this.questionDetail.status) ? this.questionDetail.status.id : undefined,
        sort_by: this.sortBy,
        sort_order: this.sortOrder
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data.data && response.data.data.length > 0) {
            this.tickets = response.data.data;
            this.page = response.data.current_page;
            this.lastPage = response.data.total;
          } else {
            this.tickets = [];
            this.page = 0;
            this.lastPage = 0;
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getTicketStatus() {
    this.recipeService.getTicketStatus()
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.ticketStatus = response.data;
          } else {
            this.ticketStatus = [];
          }
          this.clearLoading();
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  getEngineers() {
    this.recipeService.getUsers({
        q: 'all',
        is_engineer: true
      }, this.currentPage)
      .subscribe((response: any) => {
          if (response.data && response.data && response.data.length > 0) {
            this.engineers = response.data;
          } else {
            this.engineers = [];
          }
        },
        (err: any) => {
          this.networkIssue();
       });
  }
  downloadFile(data: any) {
    let hostName =
      window.location.hostname !== "localhost"
        ? "http://" + window.location.hostname
        : "http://vijaypos.info";
    let link: any = document.createElement("a");
    link.href = hostName + '/assets/download/ticket/' + data.file_name;
    document.body.appendChild(link);
    let fileExt: any = data.file_name.split('.').pop();
    link.download = data.file_name + '.' + fileExt;
    link.target = '_blank';
    link.click();
    document.body.removeChild(link);
  }
  ticketDetail(id: any) {
    this.showLoading();
    this.recipeService.ticketDetail({
        id: id
      })
      .subscribe((response: any) => {
        this.ticketDetails = response.data;
        this.ticketDetails.note = '';
        this.locationEngineers = this.engineers.filter((e: any) => ((e.location_id === 0) || (e.location_id === this.loginLocationId)));
        this.clearLoading();
      },
      (err: any) => {
        this.networkIssue();
     });
  }
  saveDetails(id?: any) {
    this.showLoading();
    this.formData = new FormData();
    if (this.files && this.files.length > 0) {
      this.files.forEach((element: any) => {
        this.formData.append('detail' + element.id, element.file, element.file.name);
      });
    }
    this.formData.append('data', JSON.stringify(this.questionDetail));
    this.recipeService.saveTicket(this.formData)
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
          this.getRecords();
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
    this.getRecords();
  }
  getCategories() {
    this.recipeService.getCategoriesTicket({
      q: 'all',
      is_question: 1
    }, null)
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
  getQuestionCategoryDetail($eve: any) {
    if ($eve && $eve.value && $eve.value.id) {
      this.recipeService.getQuestionCategoryDetail({
        id: $eve.value.id
      })
      .subscribe((response: any) => {
          if (response.data && response.data.length > 0) {
            this.questions = response.data;
          } else {
            this.questions = [];
          }
          this.question = '';
        },
        (err: any) => {
          this.networkIssue();
      });
    } else {
      this.question = '';
    }
  }
  uploadFile(event: any) {
    this.filesUploded = event.target.files;
  }
  uploadQuestionFile(event: any, detail: any) {
    let fileIndex = this.files.find((e: any) => e.id === detail.id);
    if (fileIndex > -1) {
      this.files.splice(fileIndex, 1);
    }
    if (event.target.files.length > 0) {
      this.files.push({
        id: detail.id,
        file: event.target.files[0]
      });
    }
  }
  ticketDetailUpdate() {
    if (this.ticketDetails.assigned_user && this.ticketDetails.notes) {
      this.formData = new FormData();
      if (this.filesUploded && this.filesUploded.length > 0) {
        this.formData.append('file', this.filesUploded[0], this.filesUploded[0].name);
      }
      this.formData.append('data', JSON.stringify({
        id: this.ticketDetails.id,
        note: this.ticketDetails.note,
        assigned_user_id: this.ticketDetails.assigned_user.id,
        created_user_id: this.ticketDetails.created_user.id,
        status_id: this.ticketDetails.status.id
      }));
      this.showLoading();
      this.recipeService.ticketDetailUpdate(this.formData)
        .subscribe((response: any) => {
          this.clearLoading();
          Swal.fire(
            'Saved',
            'Your Ticket has been Updated.',
            'success'
          );
          this.ticketDetail(this.ticketDetails.id);
        },
        (err: any) => {
          this.networkIssue();
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill the required fields'
      });
    }
  }
  clearTicketDetails() {
    let ticketDetailsFile: any = document.getElementById('ticketDetailsFile');
    if (ticketDetailsFile) {
      ticketDetailsFile.value = '';
    }
    this.ticketDetails = '';
  }
}
