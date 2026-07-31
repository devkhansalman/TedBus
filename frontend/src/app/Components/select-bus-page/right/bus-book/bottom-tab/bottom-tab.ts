import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReviewModal } from '../../../../review-modal/review-modal';

@Component({
  selector: 'app-bottom-tab',
  standalone: false,
  templateUrl: './bottom-tab.html',
  styleUrl: './bottom-tab.css',
})
export class BottomTab {
  @Input() filledseats: number[] = [];
  @Input() seatprice: number = 0;
  @Input() routedetials: any;
  @Input() busarrivaltime: number = 0;
  @Input() busdeparturetime: number = 0;
  @Input() operatorname: string = '';
  @Input() busid: string = '';

  tabstate: boolean[] = [false, false, false, false, false];

  constructor(public dialog: MatDialog) {}

  handletabstate(value: number): void {
    if (value === 2) {
      // Reviews tab -> Open ReviewModal dialog
      this.dialog.open(ReviewModal, {
        data: {
          busid: this.busid,
          operatorname: this.operatorname,
        },
        width: '680px',
        maxWidth: '95vw',
      });
      return;
    }

    for (let i = 0; i < this.tabstate.length; i++) {
      this.tabstate[i] = i === value && !this.tabstate[i];
    }
  }
}
