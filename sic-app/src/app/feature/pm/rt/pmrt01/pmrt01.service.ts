// src/app/feature/pm/rt/pmrt01/pmrt01.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Pmrt01Model, pmrt01, PaginatedResponse, pmrt01FilterParams } from './pmrt01.model';

@Injectable({
  providedIn: 'root',
})
export class Pmrt01Service {
  private http = inject(HttpClient);
  private baseUrl = '/api/pmrt01s';

  getpmrt01s(params: pmrt01FilterParams): Observable<PaginatedResponse<pmrt01>> {
    let httpParams = new HttpParams()
      .set('page', params.page?.toString() || '1')
      .set('size', params.size?.toString() || '10');

    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status && params.status !== 'all')
      httpParams = httpParams.set('status', params.status);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);

    return this.http.get<PaginatedResponse<pmrt01>>(this.baseUrl, { params: httpParams });
  }

  getpmrt01ById(id: string): Observable<pmrt01> {
    return this.http.get<pmrt01>(`${this.baseUrl}/${id}`);
  }

  getCustomer(id: string): Observable<Pmrt01Model> {
    return this.http.get<Pmrt01Model>(`${this.baseUrl}/${id}`);
  }

  createpmrt01(data: Partial<pmrt01>): Observable<pmrt01> {
    return this.http.post<pmrt01>(this.baseUrl, data);
  }

  updatepmrt01(id: string, data: Partial<pmrt01>): Observable<pmrt01> {
    return this.http.put<pmrt01>(`${this.baseUrl}/${id}`, data);
  }

  deletepmrt01(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleActive(id: string, isActive: boolean): Observable<pmrt01> {
    return this.http.patch<pmrt01>(`${this.baseUrl}/${id}/toggle`, { isActive });
  }

  exportpmrt01s(params: pmrt01FilterParams): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    if (params.status && params.status !== 'all')
      httpParams = httpParams.set('status', params.status);
    return this.http.get(`${this.baseUrl}/export`, {
      params: httpParams,
      responseType: 'blob',
    });
  }
}
