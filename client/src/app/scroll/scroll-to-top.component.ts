import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss']
})
export class ScrollToTopComponent {
  windowFromTopScrolled: boolean = false;
  windowFromBottomScrolled: boolean = false;
  @HostListener("window:scroll", [])
  onWindowScroll() {
      this.windowFromTopScrolled = (window.scrollY === 0);
      this.windowFromBottomScrolled = ((window.innerHeight + window.scrollY) >= document.body.offsetHeight);
  }
  scrollToTop() {
      (function smoothscroll() {
          window.scrollTo(0, 0);
      })();
  }
  scrollToBottom() {
    (function smoothscroll() {
      window.scrollTo(0, document.body.scrollHeight);
    })();
  }
}
