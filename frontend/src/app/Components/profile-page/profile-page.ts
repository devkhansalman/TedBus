import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BusService } from '../../service/bus';
import { Customer } from '../../service/customer';
import { NotificationService } from '../../service/notification.service';
import { ThemeService } from '../../service/theme.service';
import { LanguageService } from '../../service/language.service';

@Component({
  selector: 'app-profile-page',
  standalone: false,
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  selecteditem: string = 'dashboard';
  currentcustomer: any = null;
  currentname: string = '';
  currentemail: string = '';
  currentphone: string = '';
  currentdob: string = '';
  currentgender: string = '';
  profilePicture: string = '';
  isGoogleUser: boolean = false;
  mytrip: any[] = [];

  // Edit Mode state
  isEditingProfile: boolean = false;
  editName: string = '';
  editPhone: string = '';
  editGender: string = '';
  editDob: string = '';
  saveMessage: string = '';

  // Logical derived metrics
  totalBookings: number = 0;
  completedTrips: number = 0;
  upcomingTrips: number = 0;
  totalSpent: number = 0;

  // Saved promotional coupons
  copiedCoupon: string = '';
  coupons = [
    { code: 'WEEKEND20', discount: '20% OFF', description: 'Valid on all weekend AC bus bookings', expiry: 'Aug 31, 2026' },
    { code: 'TEDBUS100', discount: 'Flat ₹100 OFF', description: 'Valid on first booking above ₹500', expiry: 'Sep 15, 2026' },
    { code: 'FIRSTTRIP', discount: '15% Cashback', description: 'Instant cashback to Tedbus Wallet', expiry: 'Dec 31, 2026' }
  ];

  constructor(
    private busbooking: BusService, 
    private customerService: Customer,
    private notificationService: NotificationService,
    private route: ActivatedRoute, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.selecteditem = params['tab'];
        this.cdr.detectChanges();
      }
    });

    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const savedUser = sessionStorage.getItem('Loggedinuser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentcustomer = user;
        this.currentname = user.name || (user.email ? user.email.split('@')[0] : 'Traveler');
        this.currentemail = user.email || '';
        
        const rawPhone = user.phone || user.mobile || user.phoneNumber;
        this.currentphone = (rawPhone && rawPhone !== 'Not Provided' && rawPhone !== 'Not Specified') ? rawPhone : '';

        const rawDob = user.dateOfBirth || user.dob;
        this.currentdob = (rawDob && rawDob !== 'Not Provided' && rawDob !== 'Not Specified') ? rawDob : '';

        const rawGender = user.gender;
        this.currentgender = (rawGender && rawGender !== 'Not Specified' && rawGender !== 'Not Provided') ? rawGender : '';

        this.profilePicture = user.profilePicture || user.picture || '';
        this.isGoogleUser = Boolean(user.googleId || user.sub || this.profilePicture || (user.email && user.email.includes('@gmail.com')));

        // Prep edit fields
        this.editName = this.currentname;
        this.editPhone = this.currentphone;
        this.editGender = this.currentgender;
        this.editDob = this.currentdob;

        const customerId = user._id || user.id || user.googleId || user.email;
        if (customerId) {
          this.busbooking.getbusmongo(customerId).subscribe({
            next: (response: any) => {
              this.processBookingStats(Array.isArray(response) ? response : []);
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error fetching customer bookings:', err);
              this.processBookingStats([]);
              this.cdr.detectChanges();
            }
          });
        }
      } catch (e) {
        console.error('Error reading session user:', e);
      }
    }
  }

  handlelistitemclick(selected: string): void {
    this.selecteditem = selected;
    this.cdr.detectChanges();
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (this.isEditingProfile) {
      this.editName = this.currentname;
      this.editPhone = this.currentphone;
      this.editGender = this.currentgender;
      this.editDob = this.currentdob;
    }
  }

  saveProfile(): void {
    this.currentname = this.editName.trim() || this.currentname;
    this.currentphone = this.editPhone.trim();
    this.currentgender = this.editGender;
    this.currentdob = this.editDob;

    if (this.currentcustomer) {
      this.currentcustomer.name = this.currentname;
      this.currentcustomer.phone = this.currentphone;
      this.currentcustomer.gender = this.currentgender;
      this.currentcustomer.dateOfBirth = this.currentdob;
      sessionStorage.setItem('Loggedinuser', JSON.stringify(this.currentcustomer));
    }

    const updatePayload = {
      name: this.currentname,
      phone: this.currentphone,
      gender: this.currentgender,
      dateOfBirth: this.currentdob
    };

    // Instantly trigger in-app notification locally
    this.notificationService.addLocalNotification({
      title: 'Profile Updated',
      message: 'Your profile information has been updated successfully.',
      type: 'system',
      priority: 'low',
      icon: 'account_circle'
    });

    if (this.currentemail) {
      this.customerService.updateProfileDetails(this.currentemail, updatePayload).subscribe({
        next: () => {
          this.notificationService.fetchNotifications();
          this.notificationService.fetchUnreadCount();
        },
        error: (err) => console.error('Backend profile update error:', err)
      });
    }

    this.isEditingProfile = false;
    this.saveMessage = 'Profile details updated successfully!';
    setTimeout(() => {
      this.saveMessage = '';
      this.cdr.detectChanges();
    }, 3000);
    this.cdr.detectChanges();
  }

  copyCoupon(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCoupon = code;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.copiedCoupon = '';
        this.cdr.detectChanges();
      }, 2000);
    }).catch(() => {
      this.copiedCoupon = code;
    });
  }

  get userInitials(): string {
    if (!this.currentname) return 'U';
    const parts = this.currentname.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  private processBookingStats(bookings: any[]): void {
    this.mytrip = bookings || [];
    this.totalBookings = this.mytrip.length;
    this.completedTrips = 0;
    this.upcomingTrips = 0;
    this.totalSpent = 0;

    const now = Date.now();
    this.mytrip.forEach((trip) => {
      const fare = Number(trip.fare || trip.price || trip.totalFare || 0);
      this.totalSpent += fare;

      const isCompletedStatus = String(trip?.status || '').toLowerCase() === 'completed';
      const depDateStr = trip?.departureDetails?.date || trip?.bookingDate;
      let isDatePassed = false;
      if (depDateStr) {
        const depDate = new Date(depDateStr);
        if (!isNaN(depDate.getTime())) {
          isDatePassed = now >= depDate.getTime();
        }
      }

      if (isCompletedStatus || isDatePassed) {
        this.completedTrips++;
      } else {
        this.upcomingTrips++;
      }
    });
  }
}
