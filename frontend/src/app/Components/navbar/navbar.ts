import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Customer } from '../../service/customer';
import { Customers } from '../../model/customers.model';
import { ThemeService } from '../../service/theme.service';
import { LanguageService } from '../../service/language.service';
import { NotificationService } from '../../service/notification.service';
import { SignInModal } from '../sign-in-modal/sign-in-modal';
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
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.notificationSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
      this.cdr.detectChanges();
    });

    const savedUser = sessionStorage.getItem("Loggedinuser");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as Customers;
        if (user && user.email) {
          this.isLoggedIn = true;
          this.themeService.loadUserTheme(user.email, user.themePreference);
          this.languageService.loadUserLanguage(user.email, user.preferredLanguage);
          this.notificationService.fetchUnreadCount();
        } else {
          this.isLoggedIn = false;
        }
      } catch {
        this.isLoggedIn = false;
        sessionStorage.removeItem("Loggedinuser");
      }
    } else {
      this.isLoggedIn = false;
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.rendergooglebutton();
    }, 300);
  }

  private rendergooglebutton(): void {
    if (this.isLoggedIn) return;

    if (typeof google !== 'undefined' && google.accounts) {
      try {
        google.accounts.id.initialize({
          client_id: "23806936469-7c99sb1b7dr8c994vic0t2cjl8pohog6.apps.googleusercontent.com",
          callback: (response: any) => this.handlelogin(response)
        });

        const googlebtn = document.getElementById("google-btn");
        if (googlebtn) {
          google.accounts.id.renderButton(googlebtn, {
            theme: "outline",
            size: "medium",
            shape: "rectangular",
            width: 140
          });
        }
      } catch (err) {
        console.warn("Google button render error:", err);
      }
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
        this.saveUserAndSetLoggedIn(res);
        this.router.navigateByUrl("/");
      },
      error: (err) => {
        console.error('Customer save error:', err);
        this.saveUserAndSetLoggedIn(fallbackUser);
        this.router.navigateByUrl("/");
      }
    });
  }

  openSignInModal(): void {
    this.closeMobileMenu();
    const dialogRef = this.dialog.open(SignInModal, {
      width: '440px',
      maxWidth: '95vw',
      panelClass: 'auth-modal-dialog'
    });

    dialogRef.afterClosed().subscribe((resUser) => {
      if (resUser) {
        this.saveUserAndSetLoggedIn(resUser);
      }
    });
  }

  saveUserAndSetLoggedIn(user: any): void {
    sessionStorage.setItem("Loggedinuser", JSON.stringify(user));
    this.isLoggedIn = true;

    if (user.email) {
      this.themeService.loadUserTheme(user.email, user.themePreference);
      this.languageService.loadUserLanguage(user.email, user.preferredLanguage);
    }

    if (!this.notificationSub) {
      this.notificationSub = this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      });
    }
    this.notificationService.fetchUnreadCount();

    this.cdr.detectChanges();
  }

  handlelogout(): void {
    this.closeMobileMenu();
    if (typeof google !== 'undefined' && google.accounts) {
      try {
        google.accounts.id.disableAutoSelect();
      } catch (_) {}
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
    this.isLoggedIn = false;

    this.cdr.detectChanges();

    setTimeout(() => {
      this.rendergooglebutton();
    }, 100);
  }

  navigate(route: string, tab?: string): void {
    this.closeMobileMenu();
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
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      document.body.style.overflow = '';
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }
}

