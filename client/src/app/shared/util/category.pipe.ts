import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoryfilter'
})
export class CategoryPipe implements PipeTransform {

  transform(items: any[], searchTerm: any) {
    // when our serach is undefined or null
    if (!searchTerm) {
      return items;
    }
    let filteredItems = items.filter(item => {
      const currentItem = item['category'] ? item['category']['id'] : (item['product'] ? item['product']['category']['id'] : (item['receipe'] ? item['receipe']['category']['id'] : item['product_pos']['category']['id']));
      return (searchTerm && searchTerm.length > 0) ? searchTerm.findIndex((e: any) => (e.id === currentItem)) > -1 : true;
    });
    return filteredItems;
  }
}
