import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'phoneMask'
})
export class PhoneMaskPipe implements PipeTransform {

  transform(value: any, args?: any): any {
      return value ? 'XXXXXXX'+ value.substr(value.length - 3) : '';
    }
  }
