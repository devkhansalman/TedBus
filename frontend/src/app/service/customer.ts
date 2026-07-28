import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
      name: user.name,
      email: user.email,
      googleId: user.id,
      profilePicture: user.picture,
    };

    return this.http.post<Customers>(this.apiurl, customer);
  }
}
