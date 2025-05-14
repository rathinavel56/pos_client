import { Component, Input, EventEmitter, Output } from '@angular/core';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';
import { BaseComponent} from '../../base.component';
import { RecipeService } from '../../shared/service/recipe.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-pagination',
	templateUrl: './pagination.component.html'
})
export class paginationComponent extends BaseComponent {
	@Input() lastPage: any;
	@Input() page: any;
	@Output() pageChangeEvent = new EventEmitter<number>();
	constructor(public recipeService: RecipeService, public router: Router) {
		super(recipeService, router);
	}
	pageChange() {
		this.pageChangeEvent.emit(this.page);
	}
}
