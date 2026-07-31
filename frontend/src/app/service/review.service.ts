import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../model/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  createReview(payload: {
    customerId: string;
    bookingId: string;
    rating: number;
    review: string;
  }): Observable<{ success: boolean; message: string; review?: Review }> {
    return this.http.post<{ success: boolean; message: string; review?: Review }>(
      `${this.baseUrl}/reviews`,
      payload
    );
  }

  getBusReviews(busId: string): Observable<{ success: boolean; reviews: Review[] }> {
    return this.http.get<{ success: boolean; reviews: Review[] }>(
      `${this.baseUrl}/reviews/bus/${busId}`
    );
  }

  checkEligibility(bookingId: string): Observable<{ hasReview: boolean; review: Review | null }> {
    return this.http.get<{ hasReview: boolean; review: Review | null }>(
      `${this.baseUrl}/reviews/check/${bookingId}`
    );
  }
}
