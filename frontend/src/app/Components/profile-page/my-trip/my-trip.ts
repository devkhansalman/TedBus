import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BusService } from '../../../service/bus';
import { ReviewService } from '../../../service/review.service';
import { ReviewModal } from '../../review-modal/review-modal';
import { WriteReviewModal } from '../../write-review-modal/write-review-modal';

@Component({
  selector: 'app-my-trip',
  standalone: false,
  templateUrl: './my-trip.html',
  styleUrl: './my-trip.css',
})
export class MyTrip implements OnInit, OnChanges {
  @Input() booking: any[] = [];

  // Map booking ID to existing review status
  reviewMap: { [bookingId: string]: boolean } = {};

  constructor(
    private busbooking: BusService,
    private route: ActivatedRoute,
    private reviewService: ReviewService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.routeConfig?.path === 'my-trips') {
      const savedUser = sessionStorage.getItem('Loggedinuser');
      if (!savedUser) return;

      try {
        const user = JSON.parse(savedUser);
        const customerId = user._id || user.id;
        if (customerId) {
          this.busbooking.getbusmongo(customerId).subscribe({
            next: (bookings) => {
              this.booking = bookings;
              this.loadReviewStatuses();
            },
            error: (error) => console.error('Unable to load trips', error),
          });
        }
      } catch {
        sessionStorage.removeItem('Loggedinuser');
      }
    } else {
      this.loadReviewStatuses();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['booking'] && this.booking) {
      this.loadReviewStatuses();
    }
  }

  loadReviewStatuses(): void {
    if (!this.booking || this.booking.length === 0) return;

    this.booking.forEach((trip) => {
      const bId = String(trip._id || trip.id || '');
      if (!bId) return;

      this.reviewService.checkEligibility(bId).subscribe({
        next: (res) => {
          this.reviewMap[bId] = res.hasReview;
          this.cdr.markForCheck();
        },
        error: () => {
          this.reviewMap[bId] = false;
          this.cdr.markForCheck();
        },
      });
    });
  }

  isCompleted(trip: any): boolean {
    const isStatusCompleted = String(trip?.status || '').toLowerCase() === 'completed';
    const depDateStr = trip?.departureDetails?.date || trip?.bookingDate;
    let isDatePassed = false;
    if (depDateStr) {
      const depDate = new Date(depDateStr);
      if (!isNaN(depDate.getTime())) {
        isDatePassed = new Date().getTime() >= depDate.getTime();
      }
    }
    return isStatusCompleted || isDatePassed;
  }

  openWriteReview(trip: any): void {
    const dialogRef = this.dialog.open(WriteReviewModal, {
      data: { booking: trip },
      width: '520px',
      maxWidth: '95vw',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadReviewStatuses();
      }
    });
  }

  openViewReview(trip: any): void {
    const busId = trip.busId || trip._id || trip.id;
    this.dialog.open(ReviewModal, {
      data: {
        busid: busId,
        operatorname: trip.operatorName || 'Tedbus Partner',
      },
      width: '680px',
      maxWidth: '95vw',
    });
  }
}
