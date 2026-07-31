import { Component, Inject, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Customer } from '../../service/customer';
import { Customers } from '../../model/customers.model';

declare var google: any;

@Component({
  selector: 'app-sign-in-modal',
  standalone: false,
  templateUrl: './sign-in-modal.html',
})
export class SignInModal implements OnInit, AfterViewInit {
  name: string = '';
  email: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<SignInModal>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private customerService: Customer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      try {
        google.accounts.id.initialize({
          client_id: '23806936469-5l4854derbp1fospau6nf9imp66t0nfj.apps.googleusercontent.com',
          callback: (response: any) => this.handleGoogleLogin(response)
        });
      } catch (e) {
        console.warn('Google accounts initialization error in modal:', e);
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.renderGoogleModalButton();
    }, 100);
  }

  private renderGoogleModalButton(): void {
    const btnContainer = document.getElementById('google-modal-btn');
    if (btnContainer && typeof google !== 'undefined' && google.accounts) {
      try {
        google.accounts.id.renderButton(btnContainer, {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          width: 280
        });
      } catch (e) {
        console.warn('Google renderButton error in modal:', e);
      }
    }
  }

  private decodeToken(token: string): any {
    return JSON.parse(atob(token.split('.')[1]));
  }

  handleGoogleLogin(response: any): void {
    try {
      const payload = this.decodeToken(response.credential);
      const userPayload = {
        name: payload.name,
        email: payload.email,
        sub: payload.sub,
        picture: payload.picture
      };

      this.isLoading = true;
      this.customerService.addcustomermongo(userPayload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.dialogRef.close(res);
        },
        error: (err) => {
          this.isLoading = false;
          const fallbackUser: Partial<Customers> = {
            name: payload.name,
            email: payload.email,
            googleId: payload.sub,
            profilePicture: payload.picture
          };
          this.dialogRef.close(fallbackUser);
        }
      });
    } catch (err) {
      console.error('Error handling google token', err);
    }
  }

  onSubmitManual(): void {
    if (!this.email || !this.email.includes('@')) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    const userName = this.name.trim() || this.email.split('@')[0];
    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      name: userName,
      email: this.email.trim(),
      googleId: '',
      profilePicture: ''
    };

    this.customerService.addcustomermongo(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.dialogRef.close(res);
      },
      error: (err) => {
        this.isLoading = false;
        // Fallback user if backend error
        const fallbackUser: Partial<Customers> = {
          name: userName,
          email: this.email.trim()
        };
        this.dialogRef.close(fallbackUser);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
