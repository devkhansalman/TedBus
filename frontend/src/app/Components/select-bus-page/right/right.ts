import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BusService } from '../../../service/bus';
import { Bus } from '../../../model/bus.model';
import { Route } from '../../../model/routes.model';

@Component({
  selector: 'app-right',
  standalone: false,
  templateUrl: './right.html',
  styleUrl: './right.css',
})
export class Right implements OnInit {
  matchedbus: Bus[] = [];
  route: Route | null = null;
  seats: { [key: string]: any } = {};
  isLoading: boolean = false;
  errorMessage: string = '';

  departurevar: string = '';
  arrival: string = '';
  date: string = '';

  // Inject ChangeDetectorRef — required because this app has NO zone.js
  // (zone.js is absent from package.json). Without it, async HTTP callbacks
  // don't trigger Angular's change detection, so the UI stays frozen.
  constructor(
    private activatedRoute: ActivatedRoute,
    private busservice: BusService,
    private cdr: ChangeDetectorRef
  ) {}

  getkeys() {
    return Object.keys(this.seats);
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const departure = params['departure'];
      const arrival   = params['arrival'];
      const date      = params['date'];

      if (!departure || !arrival || !date) return;

      this.departurevar = departure;
      this.arrival      = arrival;
      this.date         = date;
      this.isLoading    = true;
      this.errorMessage = '';
      this.cdr.detectChanges(); // show "Loading..." immediately

      this.busservice.GETBUSDETAILS(departure, arrival, date).subscribe({
        next: (response: any) => {
          this.matchedbus = response.matchedBuses || [];
          this.route      = response.route || null;
          this.seats      = response.busidwithseatobj || {};
          this.isLoading  = false;
          // console.log('Buses fetched:', this.matchedbus);
          // console.log('Route:', this.route);
          this.cdr.detectChanges(); // <-- KEY FIX: force UI update after async HTTP
        },
        error: (err: any) => {
          // console.error('Failed to fetch buses:', err);
          this.errorMessage = 'Failed to load buses. Please try again.';
          this.isLoading    = false;
          this.cdr.detectChanges(); // also force update on error
        }
      });
    });
  }
}