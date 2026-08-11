// src/app/feature/bu/rt/burt02/burt02.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Burt02Model } from './burt02.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Burt02Service {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/bu/customers`;

  getCustomers(): Observable<Burt02Model[]> {
    return this.http.get<Burt02Model[]>(this.baseUrl);
  }

  getCustomerById(id: string): Observable<Burt02Model> {
    return this.http.get<Burt02Model>(`${this.baseUrl}/${id}`);
  }

  createCustomer(data: Partial<Burt02Model>): Observable<Burt02Model> {
    return this.http.post<Burt02Model>(this.baseUrl, data);
  }

  updateCustomer(id: string, data: Partial<Burt02Model>): Observable<Burt02Model> {
    return this.http.put<Burt02Model>(`${this.baseUrl}/${id}`, data);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
