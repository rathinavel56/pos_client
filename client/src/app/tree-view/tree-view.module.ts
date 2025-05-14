import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeViewComponent } from './tree-view.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
@NgModule({
  imports: [
    FormsModule,
    CommonModule
  ],
  declarations: [TreeViewComponent],
  exports: [TreeViewComponent]
})
export class TreeViewModule {

}
