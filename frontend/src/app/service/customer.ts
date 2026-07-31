import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customers } from '../model/customers.model';
import { url } from '../config';

@Injectable({
  providedIn: 'root',
})
export class Customer {
  private apiurl: string = `${url}customer`;

  constructor(private http: HttpClient) {}

  addcustomermongo(user: any): Observable<Customers> {
    const customer: Customers = {
      name: user.name || (user.email ? user.email.split('@')[0] : 'User'),
      email: user.email,
      googleId: user.sub || user.googleId || user.id || '',
      profilePicture: user.picture || user.profilePicture || user.profilepicture || '',
    };

    return this.http.post<Customers>(this.apiurl, customer);
  }

  getThemePreference(email: string): Observable<{ themePreference: 'light' | 'dark' }> {
    return this.http.get<{ themePreference: 'light' | 'dark' }>(`${url}api/profile/theme`, {
      headers: this.profileHeaders(email),
    });
  }

  updateThemePreference(email: string, themePreference: 'light' | 'dark'): Observable<{ themePreference: 'light' | 'dark' }> {
    return this.http.put<{ themePreference: 'light' | 'dark' }>(`${url}api/profile/theme`, { themePreference }, {
      headers: this.profileHeaders(email),
    });
  }

  getLanguagePreference(email: string): Observable<{ preferredLanguage: string }> {
    return this.http.get<{ preferredLanguage: string }>(`${url}users/preferences/language`, {
      headers: this.profileHeaders(email),
    });
  }

  updateLanguagePreference(email: string, preferredLanguage: string): Observable<{ preferredLanguage: string }> {
    return this.http.patch<{ preferredLanguage: string }>(`${url}users/preferences/language`, { preferredLanguage }, {
      headers: this.profileHeaders(email),
    });
  }

  private profileHeaders(email: string): HttpHeaders {
    return new HttpHeaders({ 'x-user-email': email });
  }
}
