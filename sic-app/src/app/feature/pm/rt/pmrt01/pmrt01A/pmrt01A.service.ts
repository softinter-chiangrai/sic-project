// src/app/feature/pm/rt/pmrt01/pmrt01A/pmrt01A.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerModel } from './pmrt01A.model';
import { PaginationResponse } from '../../../../../../core/model/sic-base-model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmrt01AService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/su-customer';

  // Combobox endpoints (คงเดิม)
  apiGetLovPersonType = environment.apiBaseUrl + '/api/business/lov-person-type';
  apiGetComboboxTitle = environment.apiBaseUrl + '/api/business/combobox-title';
  apiGetComboboxCountry = environment.apiBaseUrl + '/api/business/combobox-country';
  apiGetComboboxProvince = environment.apiBaseUrl + '/api/business/combobox-province';
  apiGetComboboxDistrict = environment.apiBaseUrl + '/api/business/combobox-district';
  apiGetComboboxSubDistrict = environment.apiBaseUrl + '/api/business/combobox-sub-district';

  // ===== CRUD =====

  getCustomers(
    businessId: string,
    page: number,
    size: number,
    keyword?: string,
    sortBy?: string,
    sortDir?: 'asc' | 'desc'
  ): Observable<PaginationResponse<CustomerModel>> {
    let params = new HttpParams()
      .set('businessId', businessId)
      .set('page', page.toString())
      .set('size', size.toString());
    if (keyword) params = params.set('keyword', keyword);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortDir) params = params.set('sortDir', sortDir);
    return this.http.get<PaginationResponse<CustomerModel>>(this.baseUrl, { params });
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

  searchCustomers(businessId: string, keyword: string, page: number, size: number): Observable<PaginationResponse<CustomerModel>> {
    const params = new HttpParams()
      .set('businessId', businessId)
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginationResponse<CustomerModel>>(`${this.baseUrl}/search`, { params });
  }
}