// src/app/feature/pm/rt/pmrt01A/pmrt01A.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CustomerModel } from './pmrt01A.model';
import { environment } from '../../../../../../environments/environment';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class Pmrt01AService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/su-customer';

  // Combobox endpoints
  apiGetLovPersonType = environment.apiBaseUrl + '/api/bu/burt01/lov-person-type';
  apiGetComboboxTitle = environment.apiBaseUrl + '/api/bu/burt01/combobox-title';
  apiGetComboboxCountry = environment.apiBaseUrl + '/api/bu/burt01/combobox-country';
  apiGetComboboxProvince = environment.apiBaseUrl + '/api/bu/burt01/combobox-province';
  apiGetComboboxDistrict = environment.apiBaseUrl + '/api/bu/burt01/combobox-district';
  apiGetComboboxSubDistrict = environment.apiBaseUrl + '/api/bu/burt01/combobox-sub-district';

  // ===== CRUD =====

  getCustomers(
    businessId: string,
    page: number,
    size: number,
    keyword?: string
  ): Observable<PageResponse<CustomerModel>> {
    let params = new HttpParams()
      .set('businessId', businessId)
      .set('page', page.toString())
      .set('size', size.toString());
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<PageResponse<CustomerModel>>(this.baseUrl, { params });
  }

  getCustomer(id: string): Observable<CustomerModel> {
    return this.http.get<CustomerModel>(`${this.baseUrl}/${id}`);
  }

  createCustomer(businessId: string, data: CustomerModel): Observable<CustomerModel> {
    const params = new HttpParams().set('businessId', businessId);
    return this.http.post<CustomerModel>(this.baseUrl, data, { params });
  }

  updateCustomer(id: string, data: CustomerModel): Observable<CustomerModel> {
    return this.http.put<CustomerModel>(`${this.baseUrl}/${id}`, data);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getActiveCustomers(businessId: string): Observable<CustomerModel[]> {
    const params = new HttpParams().set('businessId', businessId);
    return this.http.get<CustomerModel[]>(`${this.baseUrl}/active`, { params });
  }

  searchCustomers(businessId: string, keyword: string, page: number, size: number) {
    const params = new HttpParams()
      .set('businessId', businessId)
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<CustomerModel>>(`${this.baseUrl}/search`, { params });
  }
}