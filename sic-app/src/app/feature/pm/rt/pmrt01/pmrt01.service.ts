import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  id: string;
  code: string;
  firstNameEn: string;
  lastNameEn: string;
  firstNameLocal?: string;
  lastNameLocal?: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  taxId?: string;
  addressEn?: string;
  addressLocal?: string;
  countryId?: string;
  provinceId?: string;
  districtId?: string;
  subDistrictId?: string;
  zipCode?: string;
  uploadGroupId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface CustomerFilterParams {
  keyword?: string;
  status?: 'all' | 'active' | 'inactive';
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  projectId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Pmrt01Service {
  private http = inject(HttpClient);
  private baseUrl = '/api/customers';

  getCustomers(params: CustomerFilterParams): Observable<PaginatedResponse<Customer>> {
    let httpParams = new HttpParams()
      .set('page', params.page?.toString() || '1')
      .set('size', params.size?.toString() || '10');

    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status && params.status !== 'all') httpParams = httpParams.set('status', params.status);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);

    return this.http.get<PaginatedResponse<Customer>>(this.baseUrl, { params: httpParams });
  }

  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`);
  }

  createCustomer(data: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(this.baseUrl, data);
  }

  updateCustomer(id: string, data: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/${id}`, data);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleActive(id: string, isActive: boolean): Observable<Customer> {
    return this.http.patch<Customer>(`${this.baseUrl}/${id}/toggle`, { isActive });
  }

  exportCustomers(params: CustomerFilterParams): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status && params.status !== 'all') httpParams = httpParams.set('status', params.status);
    return this.http.get(`${this.baseUrl}/export`, {
      params: httpParams,
      responseType: 'blob',
    });
  }
}