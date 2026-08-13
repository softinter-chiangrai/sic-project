// src/app/feature/pm/rt/pmrt02/pmrt02.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PmCustomerProject } from './pmrt02.model';
import { PaginationResponse } from '../../../../core/model/pagination.model';

@Injectable({ providedIn: 'root' })
export class Pmrt02Service {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/pm/customer-projects';

  private getBusinessId(): string {
    return localStorage.getItem('businessId') || '';
  }

  getProjects(params: {
    customerId?: string;
    keyword?: string;
    startDate?: string;   
    endDate?: string;     
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Observable<PaginationResponse<PmCustomerProject>> {
    let httpParams = new HttpParams().set('businessId', this.getBusinessId());

    if (params.customerId) httpParams = httpParams.set('customerId', params.customerId);
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.size !== undefined) httpParams = httpParams.set('size', String(params.size));
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);

    return this.http.get<PaginationResponse<PmCustomerProject>>(this.baseUrl, { params: httpParams });
  }

  getProject(id: string): Observable<PmCustomerProject> {
    let httpParams = new HttpParams().set('businessId', this.getBusinessId());
    return this.http.get<PmCustomerProject>(`${this.baseUrl}/${id}`, { params: httpParams });
  }

  createProject(project: Partial<PmCustomerProject>): Observable<{ data: string }> {
    const payload = { ...project, businessId: this.getBusinessId() };
    return this.http.post<{ data: string }>(this.baseUrl, payload);
  }

  updateProject(id: string, project: Partial<PmCustomerProject>): Observable<{ data: string }> {
    const payload = { ...project, businessId: this.getBusinessId() };
    return this.http.put<{ data: string }>(`${this.baseUrl}/${id}`, payload);
  }

  deleteProject(id: string): Observable<void> {
    let httpParams = new HttpParams().set('businessId', this.getBusinessId());
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { params: httpParams });
  }
}