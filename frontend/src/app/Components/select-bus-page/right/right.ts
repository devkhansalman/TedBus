import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BusService } from '../../../service/bus';
import { Bus } from '../../../model/bus.model';
import { Route } from '../../../model/routes.model';

@Component({
  selector: 'app-right',
  standalone:false,
  templateUrl: './right.html',
  styleUrl: './right.css',
})
export class Right implements OnInit{
 matchedbus:Bus[]=[]
 routes:Route[]=[]
 seats:{[key:string]:any}={}


 departurevar:string=''
 arrival:string=''
 date:string=''

 constructor(private route:ActivatedRoute,private busservice:BusService){}

 getkeys(){
  return Object.keys(this.seats)
 }
 ngOnInit(): void {
   this.route.queryParams.subscribe(params=>{
    const departure=params['departure'];
    const arrival=params['arrival'];
    const date=params['date'];
    this.departurevar=departure
    this.arrival=arrival
    this.date=date
   });
   this.busservice.GETBUSDETAILS(this.departurevar,this.arrival,this.date).subscribe((response:any)=>{
    
    this.matchedbus=response.matchedBuses;
    this.routes=response.route;
    this.seats=response.busidwithseatobj;
    // console.log(this.routes)
   })

 }

}