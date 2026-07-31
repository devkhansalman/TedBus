import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private busservice: BusService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
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
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.errorMessage = this.translate.instant('ERROR.FAILED_TO_LOAD_BUSES');
          this.isLoading    = false;
          this.cdr.detectChanges();
        }
      });
    });
  }
}