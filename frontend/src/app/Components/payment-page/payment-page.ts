import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dataservice } from '../../service/dataservice';
import { HttpClient } from '@angular/common/http';
import { BusService } from '../../service/bus';
import { Booking } from '../../model/booking.model';

@Component({
  selector: 'app-payment-page',
  standalone: false,
  templateUrl: './payment-page.html',
  styleUrl: './payment-page.css',
})
export class PaymentPage implements OnInit {
  passseatarray: number[] = [];
  passfare: number = 0;
  routedetails: any = null;
  busdepauturetime: number = 0;
  busarrivaltime: number = 0;
  customerid: any = {};
  operatorname: string = '';
  passengerdetails: any = [];
  email: string = '';
  fare: number = 0;
  busid: string = '';
  phonenumber: string = '';
  departuredetails: any = {};
  arrivaldetails: any = {};
  duration: string = '';
  isbuisnesstravel: boolean = false;
  isinsurance: boolean = false;
  iscoviddonated: boolean = false;
  bookingdate: string = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private dataservice: Dataservice,
    private http: HttpClient,
    private busservice: BusService,
    private cdr: ChangeDetectorRef   // Fix: force change detection in zoneless app
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const rawSeats = params['selectedseat'];
      const email = params['passemail'];
      const phoneNumber = params['passphn'];
      const isBusinessTravel = params['passisbuisness'];
      const isInsurance = params['passinsurance'];
      const passFare = params['seatprice'];
      const busId = params['busid'];
      const busArrivalTime = params['busarrivaltime'];
      const busDepartureTime = params['busdeparturetime'];
      const iscoviddonated = params['passiscoviddonate'];
      const operatorname = params['operatorname'];

      this.operatorname = operatorname;

      // Parse seat numbers from string route params to actual number array
      if (Array.isArray(rawSeats)) {
        this.passseatarray = rawSeats.map((s: string) => +s);
      } else if (rawSeats) {
        this.passseatarray = String(rawSeats).split(',').map((s: string) => +s);
      } else {
        this.passseatarray = [];
      }

      this.email = email;
      this.phonenumber = phoneNumber;
      this.isbuisnesstravel = isBusinessTravel === 'true' || isBusinessTravel === true;
      this.isinsurance = isInsurance === 'true' || isInsurance === true;
      this.passfare = +passFare;
      this.busid = busId;
      this.busarrivaltime = +busArrivalTime;
      this.busdepauturetime = +busDepartureTime;
      this.iscoviddonated = iscoviddonated === 'true' || iscoviddonated === true;

      this.getloggedinuser();
      this.cdr.detectChanges();
    });

    this.dataservice.currentdata.subscribe(data => {
      this.routedetails = data;
      // console.log('Route details from dataservice:', data);
      this.cdr.detectChanges();
    });

    this.dataservice.passdata.subscribe(data => {
      this.passengerdetails = data;
      // console.log('Passenger details from dataservice:', data);
      this.cdr.detectChanges();
    });
  }

  getloggedinuser(): any {
    const loggedinuserjson = sessionStorage.getItem('Loggedinuser');
    if (loggedinuserjson) {
      this.customerid = JSON.parse(loggedinuserjson);
    } else {
      alert('please login to continue');
    }
    return null;
  }

  makepayment(): void {
    if (!this.routedetails) {
      alert('Route details not loaded. Please go back and try again.');
      return;
    }
    const date = new Date();
    
    let myBooking: Booking = {
      customerId: this.customerid._id,
      passengerDetails: this.passengerdetails,
      email: this.customerid.email,
      phoneNumber: String(this.phonenumber),
      fare: this.passfare * this.passseatarray.length,
      status: 'upcoming',
      busId: String(this.busid),
      bookingDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      seats: this.passseatarray,
      departureDetails: {
        city: this.routedetails.departureLocation.name,
        time: this.busdepauturetime,
        date: this.bookingdate
      },
      arrivalDetails: {
        city: this.routedetails.arrivalLocation.name,
        time: String(this.busarrivaltime),
        date: this.bookingdate
      },
      duration: String(this.routedetails.duration),
      isBusinessTravel: this.isbuisnesstravel,
      isInsurance: this.isinsurance,
      isCovidDonated: this.iscoviddonated
    };

    console.log('Submitting booking:', myBooking);
    this.busservice.addbusmongo(myBooking).subscribe({
      next: (response) => {
        // console.log('Booking success', response);
        alert('Booking confirmed!');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Booking failed', error);
        // alert('Booking failed. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }
}
