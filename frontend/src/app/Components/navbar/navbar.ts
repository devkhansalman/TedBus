import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Customer } from '../../service/customer';
import { Customers } from '../../model/customers.model';

declare var google: any;

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, AfterViewInit {

  isLoggedIn = false;

  constructor(
    private router: Router,
    private customerservice: Customer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = !!sessionStorage.getItem("Loggedinuser");

    google.accounts.id.initialize({
      client_id: "23806936469-5l4854derbp1fospau6nf9imp66t0nfj.apps.googleusercontent.com",
      callback: (response: any) => this.handlelogin(response)
    });
  }

  ngAfterViewInit(): void {
    this.rendergooglebutton();
  }

  private rendergooglebutton(): void {
    const googlebtn = document.getElementById("google-btn");

    if (googlebtn) {
      google.accounts.id.renderButton(googlebtn, {
        theme: "outline",
        size: "medium",
        shape: "pill",
        width: 150
      });
    }
  }

  private decodetoken(token: string): any {
    return JSON.parse(atob(token.split(".")[1]));
  }

  handlelogin(response: any): void {
    const payload = this.decodetoken(response.credential);

    const fallbackUser: Partial<Customers> = {
      name: payload.name,
      email: payload.email,
      googleId: payload.sub,
      profilePicture: payload.picture
    };

    this.customerservice.addcustomermongo(payload).subscribe({

      next: (res) => {
        sessionStorage.setItem("Loggedinuser", JSON.stringify(res));

        this.isLoggedIn = true;

        // Force Angular to update the template
        this.cdr.detectChanges();

        this.router.navigateByUrl("/");
      },

      error: (err) => {
        console.error(err);

        sessionStorage.setItem("Loggedinuser", JSON.stringify(fallbackUser));

        this.isLoggedIn = true;

        // Force Angular to update the template
        this.cdr.detectChanges();

        this.router.navigateByUrl("/");
      }

    });
  }

  handlelogout(): void {
    google.accounts.id.disableAutoSelect();

    sessionStorage.removeItem("Loggedinuser");

    this.isLoggedIn = false;

    this.cdr.detectChanges();

    window.location.reload();
  }

  navigate(route: string, tab?: string): void {
    if (tab) {
      this.router.navigate([route], { queryParams: { tab } });
    } else {
      this.router.navigate([route]);
    }
  }
}