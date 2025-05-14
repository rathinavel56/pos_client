import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchTerm: any, searchBy: string) {
    // when our serach is undefined or null
    if (!searchTerm) {
      return items;
    }
    if (searchTerm && searchTerm.value) {
      searchTerm = searchTerm.value.name;
    }
    // when there is partial or full match of the search term
    return items.filter(item => {
      const currentItem = item[searchBy];
      return currentItem.toString().toLowerCase().includes(searchTerm.trim().toLowerCase());
    });
  }
}
