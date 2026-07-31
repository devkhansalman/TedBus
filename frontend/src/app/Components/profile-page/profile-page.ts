import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BusService } from '../../service/bus';
import { Booking } from '../../model/booking.model';

@Component({
  selector: 'app-profile-page',
  standalone: false,
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  selecteditem: string = 'trips';
  currentcustomer: any = [];
  currentname: string = '';
  currentemail: string = '';
  mytrip: any[] = [];

  handlelistitemclick(selected: string): void {
    this.selecteditem = selected;
    this.cdr.detectChanges();
  }

  constructor(
    private busbooking: BusService, 
    private route: ActivatedRoute, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.selecteditem = params['tab'];
        this.cdr.detectChanges();
      }
    });

    this.currentcustomer = sessionStorage.getItem('Loggedinuser');
    if (this.currentcustomer) {
      const user = JSON.parse(this.currentcustomer);
      this.currentname = user.name;
      this.currentemail = user.email;
      const customerId = user._id || user.id || user.googleId;
      if (customerId) {
        this.busbooking.getbusmongo(customerId).subscribe((response: any) => {
          this.mytrip = response;
          this.cdr.detectChanges();
        });
      }
    }
  }
}
