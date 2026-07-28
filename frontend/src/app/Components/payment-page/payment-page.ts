import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-page',
  standalone: false,
  templateUrl: './payment-page.html',
  styleUrl: './payment-page.css',
})
export class PaymentPage implements OnInit{
    passseatarray:any[]=[]
  passfare:number=0
  routedetails:any=[]
  busdepauturetime:number=0
  busarrivaltime:number=0
  customerid:any={}
  operatorname:string=''
  passengerdetails:any=[]
  email:string=''
  fare:number=0
  busid:string=''
  phonenumber:string=''
  departuredetails:any={}
  arrivaldetails:any={}
  duration:string=''
  isbuisnesstravel:boolean=false
  isinsurance:boolean=false
  iscoviddonated:Boolean=false
  bookingdate:string=new Date().toISOString().split('T')[0]
// constructor(private route:ActivatedRoute, private dataservice : DataserviceService,private http:HttpClient,private busservice:BusService){}
constructor(private route:ActivatedRoute){}
ngOnInit(): void {
  this.route.params.subscribe(params=>{
    const passSeatsArray = params['selectedseat'];
    const email = params['passemail'];
    const phoneNumber = params['passphn'];
    const isBusinessTravel = params['passisbuisness'];
    const isInsurance = params['passinsurance'];
    const passFare=params['seatprice'];
    const busId=params['busid'];
    const busArrivalTime=params['busarrivaltime'];
    const busDepartureTime=params['busdeparturetime'];
    const iscoviddonated=params['passiscoviddonate'];
    const operatorname=params['operatorname']
    this.operatorname=operatorname
    this.passseatarray=passSeatsArray
    this.email=email
    this.phonenumber=phoneNumber
    this.isbuisnesstravel=isBusinessTravel
    this.isinsurance=isInsurance
    this.passfare=passFare
    this.busid=busId
    this.busarrivaltime=busArrivalTime
    this.busdepauturetime=busDepartureTime  
  })
}
}
