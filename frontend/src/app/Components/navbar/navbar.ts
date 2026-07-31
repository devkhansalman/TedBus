import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Customer } from '../../service/customer';
import { Customers } from '../../model/customers.model';
import { ThemeService } from '../../service/theme.service';
import { LanguageService } from '../../service/language.service';
import { NotificationService } from '../../service/notification.service';
import { Subscription } from 'rxjs';

declare var google: any;

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, AfterViewInit, OnDestroy {

  isLoggedIn = false;
  isNotificationPanelOpen = false;
  isMobileMenuOpen = false;
  unreadCount = 0;
  private notificationSub: Subscription | null = null;

  constructor(
    private router: Router,
    private customerservice: Customer,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService,
    public languageService: LanguageService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Unconditionally subscribe to unreadCount$ so Navbar badge receives updates
    this.notificationSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
      this.cdr.detectChanges();
    });

    const savedUser = sessionStorage.getItem("Loggedinuser");
    if (!savedUser) {
      const defaultUser: Partial<Customers> = { name: 'Demo User', email: 'demo@tedbus.com' };
      sessionStorage.setItem("Loggedinuser", JSON.stringify(defaultUser));
      this.isLoggedIn = true;
    } else {
      try {
        const user = JSON.parse(savedUser) as Customers;
        if (user.email) {
          this.themeService.loadUserTheme(user.email, user.themePreference);
          this.languageService.loadUserLanguage(user.email, user.preferredLanguage);
        }
        this.isLoggedIn = true;
      } catch {
        const defaultUser: Partial<Customers> = { name: 'Demo User', email: 'demo@tedbus.com' };
        sessionStorage.setItem("Loggedinuser", JSON.stringify(defaultUser));
        this.isLoggedIn = true;
      }
    }

    this.notificationService.fetchUnreadCount();

    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: "23806936469-5l4854derbp1fospau6nf9imp66t0nfj.apps.googleusercontent.com",
        callback: (response: any) => this.handlelogin(response)
      });
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
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
        this.themeService.loadUserTheme(res.email, res.themePreference);
        this.languageService.loadUserLanguage(res.email, res.preferredLanguage);
        
        if (!this.notificationSub) {
          this.notificationSub = this.notificationService.unreadCount$.subscribe(count => {
            this.unreadCount = count;
            this.cdr.detectChanges();
          });
        }
        this.notificationService.fetchUnreadCount();

        this.isLoggedIn = true;
        this.cdr.detectChanges();
        this.router.navigateByUrl("/");
      },
      error: (err) => {
        console.error(err);
        sessionStorage.setItem("Loggedinuser", JSON.stringify(fallbackUser));
        this.isLoggedIn = true;
        this.cdr.detectChanges();
        this.router.navigateByUrl("/");
      }
    });
  }

  handlelogout(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }

    sessionStorage.removeItem("Loggedinuser");
    this.themeService.clearUserTheme();
    this.languageService.clearUserLanguage();

    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
      this.notificationSub = null;
    }
    this.unreadCount = 0;
    this.isNotificationPanelOpen = false;
    this.isMobileMenuOpen = false;
    this.isLoggedIn = false;

    this.cdr.detectChanges();
    window.location.reload();
  }

  navigate(route: string, tab?: string): void {
    this.isMobileMenuOpen = false;
    if (tab) {
      this.router.navigate([route], { queryParams: { tab } });
    } else {
      this.router.navigate([route]);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  switchLanguage(langCode: string): void {
    this.languageService.useLanguage(langCode);
  }

  toggleNotifications(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
