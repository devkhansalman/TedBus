import { Component, Input, OnInit } from '@angular/core';

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

  constructor() {}

  ngOnInit(): void {
    // Fix: use reduce for correct sum, and length for count
    if (this.rating && this.rating.length > 0) {
      const sum = this.rating.reduce((acc, val) => acc + val, 0);
      this.totalreview = this.rating.length;
      this.avgrating = +(sum / this.totalreview).toFixed(1);
    } else {
      this.avgrating = 0;
      this.totalreview = 0;
    }

    // Guard against null routedetails while data is loading
    const duration = this.routedetails?.duration ?? 0;

    // Fix: normalize busType to lowercase and strip spaces/slashes for reliable matching
    // DB has: "Standard", "standard", "Sleeper", "A/C Seater", "AC Seater", "AC Sleeper"
    const normalizedType = this.bustype.toLowerCase().replace(/[\s\/\-]/g, '');

    if (normalizedType === 'standard') {
      this.seatprivce = 50 * Math.floor(duration) / 2;
      this.bustypename = 'Standard';
    } else if (normalizedType === 'sleeper') {
      this.seatprivce = 100 * Math.floor(duration) / 2;
      this.bustypename = 'Sleeper';
    } else if (normalizedType === 'acseater') {
      // Matches: "A/C Seater", "AC Seater"
      this.seatprivce = 125 * Math.floor(duration) / 2;
      this.bustypename = 'A/C Seater';
    } else if (normalizedType === 'acsleeper') {
      // Matches: "AC Sleeper"
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
}