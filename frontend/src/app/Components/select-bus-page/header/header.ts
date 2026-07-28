import { Component } from '@angular/core';
import {ActivatedRoute} from '@angular/router'
@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  departure:String=''
  arrival:String=''
  date:String=''
  constructor(private route:ActivatedRoute){
  }
  ngOnInit():void{
    this.route.queryParams.subscribe(params=>{
      const departure=params['departure']
      const arrival=params['arrival']
      const date=params['date']
      // const departure=params['departure']

      this.departure=departure
      this.arrival=arrival
      this.date=date
    })
  }
}
