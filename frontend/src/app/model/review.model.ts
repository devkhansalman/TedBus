export interface Review {
  _id?: string;
  customerId: string;
  customerName: string;
  bookingId: string;
  routeId?: string;
  busId: string;
  operatorName: string;
  departure?: string;
  arrival?: string;
  rating: number;
  review: string;
  createdAt?: string;
}
