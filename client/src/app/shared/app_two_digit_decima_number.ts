import { Directive, ElementRef, HostListener, Input } from '@angular/core';
@Directive({
  selector: '[appTwoDigitDecimaNumber]'
})

export class TwoDigitDecimaNumberDirective {
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,3}$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-'];

  @Input('appTwoDigitDecimaNumber') decimal:any;

  constructor(private el: ElementRef) {
  }
  @HostListener('keydown', ['$event'])

  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if(this.decimal){
      if (this.specialKeys.indexOf(event.key) !== -1) {
        return;
      }
      let current: string = this.el.nativeElement.value;
      let next: string = current.concat(event.key);
      if (next && !String(next).match(this.regex)) {
        event.preventDefault();
      }
    }else{
      const charCode = (event.which) ? event.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 105)) {
        event.preventDefault();
      }
      return;
    }
  }
}
