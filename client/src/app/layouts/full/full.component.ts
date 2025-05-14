import { Component, OnInit, HostListener } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import { SessionStorageService } from "../../shared/util/sessionStorage.service";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";

@Component({
  selector: "app-full-layout",
  templateUrl: "./full.component.html",
  styleUrls: ["./full.component.scss"],
})
export class FullComponent implements OnInit {
  hostName: string = "";
  year: any;
  isOtherWeb: boolean = false;
  public config: PerfectScrollbarConfigInterface = {};

  constructor(public router: Router, public sessionStorageService: SessionStorageService) {
    this.hostName =
      window.location.hostname !== "localhost"
        ? window.location.hostname
        : "vijaypos.info";
    this.isOtherWeb =
      this.hostName === "vijaypos.info" ||
      this.hostName === "18.221.91.241";
    this.year = new Date().getFullYear();
  }

  public innerWidth: number = 0;
  public defaultSidebar: string = "";
  public expandLogo = false;
  public sidebartype = "full";

  Logo() {
    this.expandLogo = !this.expandLogo;
  }
  closeSideMenu() {
    this.sessionStorageService.showMobileMenu = !this.sessionStorageService.showMobileMenu;
  }

  ngOnInit() {
    if (this.router.url === "/") {
      this.router.navigate(["/starter"]);
    }
    this.defaultSidebar = this.sidebartype;
    this.handleSidebar();
  }

  @HostListener("window:resize", ["$event"])
  onResize() {
    this.handleSidebar();
  }

  handleSidebar() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 1170) {
      this.sidebartype = "mini-sidebar";
    } else {
      this.sidebartype = this.defaultSidebar;
    }
  }

  toggleSidebarType() {
    switch (this.sidebartype) {
      case "full":
        this.sidebartype = "mini-sidebar";
        break;

      case "mini-sidebar":
        this.sidebartype = "full";
        break;

      default:
    }
  }
}
