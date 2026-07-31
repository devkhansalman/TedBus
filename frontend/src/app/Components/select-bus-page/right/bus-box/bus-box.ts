import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ReviewService } from '../../../../service/review.service';
import { ReviewModal } from '../../../review-modal/review-modal';

@Component({
  selector: 'app-bus-box',
  templateUrl: './bus-box.html',
  styleUrl: './bus-box.css',
  standalone: false
})
export class BusBox implements OnInit {
  @Input() rating: number[] = [];
  @Input() operatorname: string = '';
  @Input() bustype: string = '';
  @Input() departuretime: string = '';
  @Input() reschedulable: number = 0;
  @Input() livetracking: number = 0;
  @Input() filledseats: any[] = [];
  @Input() routedetails: any = null;
  @Input() busid: string = '';

  avgrating: number = 0;
  totalreview: number = 0;
  seatprivce: number = 0;
  bustypename: string = '';
  busdeparturetime: number = 0;
  busarrivaltime: number = 0;

  constructor(
    public dialog: MatDialog,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  openRouteMap(): void {
    const depart = this.routedetails?.departureLocation?.name || 'Delhi';
    const arrival = this.routedetails?.arrivalLocation?.name || 'Jaipur';
    this.router.navigate(['/route-details'], {
      queryParams: {
        depart,
        arrival,
        busId: this.busid
      }
    });
  }

  ngOnInit(): void {
    if (this.rating && this.rating.length > 0) {
      const sum = this.rating.reduce((acc, val) => acc + val, 0);
      this.totalreview = this.rating.length;
      this.avgrating = +(sum / this.totalreview).toFixed(1);
    } else {
      this.avgrating = 0;
      this.totalreview = 0;
    }

    if (this.busid) {
      this.reviewService.getBusReviews(this.busid).subscribe({
        next: (res) => {
          if (res.reviews && res.reviews.length > 0) {
            this.totalreview = res.reviews.length;
            const sum = res.reviews.reduce((acc, r) => acc + r.rating, 0);
            this.avgrating = +(sum / res.reviews.length).toFixed(1);
          }
        },
        error: () => {}
      });
    }

    const duration = this.routedetails?.duration ?? 0;
    const normalizedType = this.bustype.toLowerCase().replace(/[\s\/\-]/g, '');

    if (normalizedType === 'standard') {
      this.seatprivce = 50 * Math.floor(duration) / 2;
      this.bustypename = 'Standard';
    } else if (normalizedType === 'sleeper') {
      this.seatprivce = 100 * Math.floor(duration) / 2;
      this.bustypename = 'Sleeper';
    } else if (normalizedType === 'acseater') {
      this.seatprivce = 125 * Math.floor(duration) / 2;
      this.bustypename = 'A/C Seater';
    } else if (normalizedType === 'acsleeper') {
      this.seatprivce = 150 * Math.floor(duration) / 2;
      this.bustypename = 'A/C Sleeper';
    } else {
      this.seatprivce = 75 * Math.floor(duration) / 2;
      this.bustypename = this.bustype || 'Non-A/C';
    }

    const numericvalue = parseInt(this.departuretime, 10) || 0;
    this.busdeparturetime = numericvalue;
    this.busarrivaltime = (numericvalue + duration) % 24;
  }

  openReviews(): void {
    this.dialog.open(ReviewModal, {
      data: {
        busid: this.busid,
        operatorname: this.operatorname,
      },
      width: '680px',
      maxWidth: '95vw',
    });
  }
}