import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-small-seats',
  standalone: false,
  templateUrl: './small-seats.html',
  styleUrl: './small-seats.css',
})
export class SmallSeats {
@Input() seatno:number=0
@Input() alreadybookedseats:number[]=[]
@Input() selectedseats:number[]=[]
@Output() seatselected:EventEmitter<number> =new EventEmitter<number>()

getcolor(seatno:number):string{
  if(this.selectedseats.includes(seatno)){
    return 'blue';
  }else if(this.alreadybookedseats.includes(seatno)){
    return 'red';
  }else{
    return 'black'
  }
}
onclick():void{
  this.seatselected.emit(this.seatno)
}
handleselectedseats(seatno:number):void{
}
handleseatbooking(seatno:number){
  if(!this.alreadybookedseats.includes(this.seatno)){
    if(this.selectedseats.includes(this.seatno)){
      const seatindex= this.selectedseats.indexOf(seatno)
      this.selectedseats.splice(seatindex,1)
    }else{
      this.selectedseats.push(this.seatno)
    }
  }
}

}
