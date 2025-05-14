import { Component, Input } from '@angular/core';
import Swal from 'sweetalert2'; 
@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html'
})
export class TreeViewComponent {
  @Input() data: any;
  writeChecked(Obj: any) {
    Obj.checked = Obj.value.is_write ? Obj.value.is_write : false;
  }
}
