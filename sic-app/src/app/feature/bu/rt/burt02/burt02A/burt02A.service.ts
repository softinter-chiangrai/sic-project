// src/app/feature/bu/rt/burt02/burt02A/burt02A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Burt02AModel } from './burt02A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Burt02AService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/bu/customers`;

  getCustomerById(id: string): Observable<Burt02AModel> {
    return this.http.get<Burt02AModel>(`${this.baseUrl}/${id}`);
  }

  createCustomer(data: Partial<Burt02AModel>): Observable<Burt02AModel> {
    return this.http.post<Burt02AModel>(this.baseUrl, data);
  }

  updateCustomer(id: string, data: Partial<Burt02AModel>): Observable<Burt02AModel> {
    return this.http.put<Burt02AModel>(`${this.baseUrl}/${id}`, data);
  }
}
