import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReviewService } from '../../service/review.service';
import { Review } from '../../model/review.model';

export interface ReviewDialogData {
  busid: string;
  operatorname: string;
}

@Component({
  selector: 'app-review-modal',
  standalone: false,
  templateUrl: './review-modal.html',
})
export class ReviewModal implements OnInit {
  busid: string = '';
  operatorname: string = '';
  reviews: Review[] = [];
  isLoading: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReviewDialogData,
    public dialogRef: MatDialogRef<ReviewModal>,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {
    if (data) {
      this.busid = data.busid || '';
      this.operatorname = data.operatorname || '';
    }
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    const targetBusId = this.busid || 'all';
    this.isLoading = true;

    this.reviewService.getBusReviews(targetBusId).subscribe({
      next: (res) => {
        this.reviews = res.reviews || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.reviews = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
