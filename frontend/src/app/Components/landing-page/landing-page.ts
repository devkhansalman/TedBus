import { Component } from '@angular/core';
import { Dialog } from './dialog/dialog';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  fromOption:string=''
  toOption:string=''
  date:string=''
  constructor(private router: Router, public dialog: MatDialog) { }

  fromEvent(option:string){
    this.fromOption=option;
    // console.log(option);
  }
  toEvent(option:string){
    this.toOption=option;
    // console.log(option);
  }
  matchDate(event:any){
    if(event.value){
      const date= new Date(event.value);
      const day = date.getDate().toString().padStart(2,'0')
      const month = (date.getMonth()+1).toString().padStart(2,'0')
      const year = date.getFullYear();
      this.date=`${year}-${month}-${day}`
    }
    else this.date="null"
    // console.log(this.date); 
  }
  isLoggedIn():boolean{
    return !!sessionStorage.getItem("Loggedinuser")
  }
  submit(){
    if(!this.isLoggedIn){
      alert("Login to continue")
    }
    else{

    
    if(this.fromOption && this.toOption && this.date){
      if (this.fromOption === 'Delhi' && this.toOption === 'Jaipur' || this.fromOption === 'Mumbai' && this.toOption === 'Goa' || this.fromOption === 'Bangalore' && this.toOption === 'Mysore' || this.fromOption === 'Kolkata' && this.toOption === 'Darjeeling' || this.fromOption === 'Chennai' && this.toOption === 'Pondicherry') {
        this.router.navigate(['select-bus'],{
          queryParams:{
            departure:this.fromOption,
            arrival:this.toOption,
            date:this.date
          }
        })
      }
        else {
        const dialogRef = this.dialog.open(Dialog);

        dialogRef.afterClosed().subscribe(result => {
          // console.log(`Dialog result: ${result}`);
        });
      }
    }
    else {
      alert("fill up the details!!!")
    }
  }
  }
}
