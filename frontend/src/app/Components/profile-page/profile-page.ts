import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  }

  constructor(private busbooking: BusService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.selecteditem = params['tab'];
      }
    });

    this.currentcustomer = sessionStorage.getItem('Loggedinuser');
    if (this.currentcustomer) {
      const user = JSON.parse(this.currentcustomer);
      this.currentname = user.name;
      this.currentemail = user.email;
      if (user._id) {
        this.busbooking.getbusmongo(user._id).subscribe((response: any) => {
          this.mytrip = response;
        });
      }
    }
  }
}
