import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Dataservice } from '../../../../service/dataservice';

export interface PassengerDetail {
  name: string;
  age: string;
  gender: string;
}

@Component({
  selector: 'app-bus-booking-form',
  standalone: false,
  templateUrl: './bus-booking-form.html',
  styleUrl: './bus-booking-form.css',
})
export class BusBookingForm implements OnChanges {
  @Input() selectedseat: number[] = [];
  @Input() seatprice: number = 0;
  @Input() routedetails: any;
  @Input() busid: string = '';
  @Input() busarrivaltime: number = 0;
  @Input() busdeparturetime: number = 0;
  @Input() operatorname: string = '';

  // Stepper State (1: Seats, 2: Passengers, 3: Contact, 4: Extras, 5: Fare & Payment)
  currentStep: number = 1;
  maxReachedStep: number = 1;

  // Passenger Details
  passdetails: PassengerDetail[] = [];
  passengerErrors: { [key: number]: { name?: string; age?: string; gender?: string } } = {};
  expandedPassengerIndex: number = 0;

  // Contact Details
  passemail: string = '';
  passphn: string = '';
  passisbuisness: boolean = false;
  sendupdates: boolean = true;
  contactErrors: { email?: string; phone?: string } = {};

  // Travel Extras
  passinsurance: boolean = true;
  passiscovid: boolean = false;
  couponCode: string = '';
  appliedCoupon: string = '';
  couponDiscount: number = 0;
  couponError: string = '';
  couponSuccess: string = '';

  constructor(
    private router: Router,
    private dataservice: Dataservice,
    private translate: TranslateService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedseat'] && this.selectedseat) {
      while (this.passdetails.length < this.selectedseat.length) {
        this.passdetails.push({ name: '', age: '', gender: 'Male' });
      }
      if (this.passdetails.length > this.selectedseat.length) {
        this.passdetails = this.passdetails.slice(0, this.selectedseat.length);
      }
    }
  }

  // ─── STEP NAVIGATION & VALIDATION ─────────────────────────────────────────

  setStep(step: number): void {
    if (step <= this.maxReachedStep) {
      this.currentStep = step;
    }
  }

  goToStep2(): void {
    if (!this.selectedseat || this.selectedseat.length === 0) {
      return;
    }
    this.currentStep = 2;
    if (this.maxReachedStep < 2) this.maxReachedStep = 2;
  }

  validatePassengerDetails(): boolean {
    this.passengerErrors = {};
    let isValid = true;

    for (let i = 0; i < this.selectedseat.length; i++) {
      const pass = this.passdetails[i] || { name: '', age: '', gender: '' };
      const errors: { name?: string; age?: string; gender?: string } = {};

      if (!pass.name || pass.name.trim().length < 2) {
        errors.name = this.translate.instant('ERROR.NAME_REQUIRED');
        isValid = false;
      }
      if (!pass.age || Number(pass.age) < 1 || Number(pass.age) > 120) {
        errors.age = this.translate.instant('ERROR.AGE_INVALID');
        isValid = false;
      }
      if (!pass.gender) {
        errors.gender = this.translate.instant('ERROR.GENDER_REQUIRED');
        isValid = false;
      }

      if (Object.keys(errors).length > 0) {
        this.passengerErrors[i] = errors;
        if (isValid === false && this.expandedPassengerIndex !== i) {
          this.expandedPassengerIndex = i;
        }
      }
    }

    return isValid;
  }

  goToStep3(): void {
    if (this.validatePassengerDetails()) {
      this.currentStep = 3;
      if (this.maxReachedStep < 3) this.maxReachedStep = 3;
    }
  }

  validateContactDetails(): boolean {
    this.contactErrors = {};
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.passemail || !emailRegex.test(this.passemail.trim())) {
      this.contactErrors.email = this.translate.instant('ERROR.EMAIL_INVALID');
      isValid = false;
    }

    const phoneDigits = (this.passphn || '').replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      this.contactErrors.phone = this.translate.instant('ERROR.PHONE_INVALID');
      isValid = false;
    }

    return isValid;
  }

  goToStep4(): void {
    if (this.validateContactDetails()) {
      this.currentStep = 4;
      if (this.maxReachedStep < 4) this.maxReachedStep = 4;
    }
  }

  goToStep5(): void {
    this.currentStep = 5;
    if (this.maxReachedStep < 5) this.maxReachedStep = 5;
  }

  // ─── PASSENGER FORM HANDLERS ───────────────────────────────────────────────

  handlePassGender(genderValue: string, index: number): void {
    if (!this.passdetails[index]) {
      this.passdetails[index] = { name: '', age: '', gender: '' };
    }
    this.passdetails[index].gender = genderValue;
  }

  handlePassName(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    if (!this.passdetails[index]) {
      this.passdetails[index] = { name: '', age: '', gender: '' };
    }
    this.passdetails[index].name = target.value;
  }

  handlePassAge(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    if (!this.passdetails[index]) {
      this.passdetails[index] = { name: '', age: '', gender: '' };
    }
    this.passdetails[index].age = target.value;
  }

  togglePassengerCard(index: number): void {
    if (this.expandedPassengerIndex === index) {
      this.expandedPassengerIndex = -1;
    } else {
      this.expandedPassengerIndex = index;
    }
  }

  // ─── COUPONS ───────────────────────────────────────────────────────────────

  applyCoupon(): void {
    const code = (this.couponCode || '').trim().toUpperCase();
    this.couponError = '';
    this.couponSuccess = '';

    if (!code) {
      this.couponError = this.translate.instant('ERROR.COUPON_REQUIRED');
      return;
    }

    if (code === 'TEDBUS10' || code === 'FIRSTBUS' || code === 'RED100') {
      const baseFare = this.selectedseat.length * this.seatprice;
      this.couponDiscount = Math.min(Math.round(baseFare * 0.1), 150);
      this.appliedCoupon = code;
      this.couponSuccess = this.translate.instant('SUCCESS.COUPON_APPLIED');
    } else {
      this.couponError = this.translate.instant('ERROR.COUPON_INVALID');
    }
  }

  removeCoupon(): void {
    this.appliedCoupon = '';
    this.couponDiscount = 0;
    this.couponCode = '';
    this.couponSuccess = '';
    this.couponError = '';
  }

  // ─── FARE CALCULATIONS ─────────────────────────────────────────────────────

  getBaseFare(): number {
    return (this.selectedseat?.length || 0) * (this.seatprice || 0);
  }

  getInsuranceCost(): number {
    return this.passinsurance ? (this.selectedseat?.length || 0) * 15 : 0;
  }

  getCovidDonation(): number {
    return this.passiscovid ? 10 : 0;
  }

  getGstTax(): number {
    return Math.round(this.getBaseFare() * 0.05);
  }

  getTotalAmount(): number {
    const total = this.getBaseFare() + this.getInsuranceCost() + this.getCovidDonation() + this.getGstTax() - this.couponDiscount;
    return Math.max(total, 0);
  }

  // ─── PROCEED TO PAYMENT ────────────────────────────────────────────────────

  handleproceedtopay(): void {
    if (!this.validatePassengerDetails()) {
      this.currentStep = 2;
      return;
    }
    if (!this.validateContactDetails()) {
      this.currentStep = 3;
      return;
    }

    const routeParams = {
      operatorname: this.operatorname,
      selectedseat: this.selectedseat,
      passemail: this.passemail,
      passphn: this.passphn,
      passiscoviddonate: this.passiscovid,
      passisbuisness: this.passisbuisness,
      passinsurance: this.passinsurance,
      seatprice: this.seatprice,
      busid: this.busid,
      busarrivaltime: this.busarrivaltime,
      busdeparturetime: this.busdeparturetime
    };

    this.dataservice.passobj(this.passdetails);
    this.dataservice.sendobj(this.routedetails);
    this.router.navigate(['/payment', routeParams]);
  }
}
