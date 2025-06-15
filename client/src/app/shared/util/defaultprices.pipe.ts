// src/app/filters/default-prices.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'defaultPrices'
})
export class DefaultPricesPipe implements PipeTransform {
  transform(prices: any[]): any[] {
    return prices?.filter(p => p.is_default);
  }
}
