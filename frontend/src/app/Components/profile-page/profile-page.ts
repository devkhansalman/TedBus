import { Component,OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-page',
  standalone: false,
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage{
  selecteditem:string='trips';
  currentcustomer:any=[]
  currentname:string=''
  currentemail:string=''
  mytrip:any[]=[
    {passengerDetails: [],}
  ]
  handlelistitemclick(selected:string):void{
    this.selecteditem=selected
  }
  // constructor(private busbooking:BusService){}
  ngOnInit(): void {
    this.currentcustomer=sessionStorage.getItem('Loggedinuser')
    const user=JSON.parse(this.currentcustomer)
    this.currentname=user.name;
    this.currentemail=user.email;
    // this.busbooking.getbusmongo(user._id).subscribe((response:any)=>{
    //   this.mytrip=response
    //   console.log(this.mytrip)
    // }
  
  }
}
