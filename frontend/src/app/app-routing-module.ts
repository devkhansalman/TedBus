import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPage } from './Components/landing-page/landing-page'
import {SelectBusPage} from './Components/select-bus-page/select-bus-page'
import { PaymentPage } from './Components/payment-page/payment-page';
import { ProfilePage } from './Components/profile-page/profile-page';

const routes: Routes = [
  {path:'',component:LandingPage},
  {path:'select-bus',component:SelectBusPage},
  {path:'payment',component:PaymentPage},
  {path:'profile',component:ProfilePage},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
