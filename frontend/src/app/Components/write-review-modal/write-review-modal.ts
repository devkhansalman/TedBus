import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReviewService } from '../../service/review.service';
import { NotificationService } from '../../service/notification.service';

export interface WriteReviewDialogData {
  booking: any;
}

@Component({
  selector: 'app-write-review-modal',
  standalone: false,
  templateUrl: './write-review-modal.html',
})
export class WriteReviewModal {
  rating: number = 0;
  hoverRating: number = 0;
  reviewText: string = '';
  isSubmitting: boolean = false;
  errorMessage: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: WriteReviewDialogData,
    public dialogRef: MatDialogRef<WriteReviewModal>,
    private reviewService: ReviewService,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService
  ) {}

  setRating(r: number): void {
    this.rating = r;
  }

  setHoverRating(r: number): void {
    this.hoverRating = r;
  }

  submit(): void {
    if (this.rating === 0) {
      this.errorMessage = 'Please select a star rating.';
      return;
    }
    if (this.reviewText.trim().length < 30) {
      this.errorMessage = 'Review text must be at least 30 characters long.';
      return;
    }

    const booking = this.data.booking;
    const bId = booking._id || booking.id;
    let customerId = booking.customerId;
    if (!customerId) {
      const userStr = sessionStorage.getItem('Loggedinuser');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          customerId = u._id || u.id || u.googleId;
        } catch {}
      }
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.reviewService
      .createReview({
        customerId,
        bookingId: String(bId),
        rating: this.rating,
        review: this.reviewText.trim(),
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.notificationService.fetchUnreadCount();
          this.notificationService.fetchNotifications();
          this.dialogRef.close(true);
          this.snackBar.open('Review submitted successfully.', 'OK', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Failed to submit review.';
        },
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
