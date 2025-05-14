import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { RecipeComponent } from './recipe.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { SharedModule } from '../shared/shared.module';
const routes: Routes = [
  {
    path: '',
    component: RecipeComponent
  }
];

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    RouterModule.forChild(routes),
    SweetAlert2Module.forChild(),
    SelectDropDownModule,
    SharedModule
  ],
  declarations: [RecipeComponent]
})
export class RecipeModule {

}
