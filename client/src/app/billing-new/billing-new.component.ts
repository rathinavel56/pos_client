import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import jspreadsheet from "jspreadsheet-ce";

@Component({
  selector: 'app-billing-new',
  templateUrl: './billing-new.component.html',
  styleUrls: ['./billing-new.component.scss']
})
export class BillingNewComponent implements OnInit, AfterViewInit {
@ViewChild("spreadsheet", { static: false }) spreadsheet!: ElementRef<any>;
spreadsheetInstance: any;
  constructor() { }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    if (this.spreadsheet) {
      // Create the spreadsheet
    jspreadsheet(this.spreadsheet.nativeElement, {
      worksheets: [
        {
          data: [
            ['Yes', '#ff0000'],
            ['No', '#00ff00']
          ],
          minDimensions: [6, 4],
          columns: [
            {
              type: "dropdown",
              width: 100,
              source: ["Yes", "No"]
            },
            {
              type: "color",
              width: 100,
              render: "square"
            }
          ],
          allowComments: true,
          comments: {
            A1: "Select Yes or No",
            B1: "Choose a colour."
          }
        }
      ],
      onkeydown: (instance: any, e: KeyboardEvent) => {
        console.log('instance', instance , e)
      }
    } as any);
    }

  }

}
