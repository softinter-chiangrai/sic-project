import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { PmInvoiceModel } from './pmdt20.model';

@Injectable({ providedIn: 'root' })
export class Pmdt20Service {
  private http = inject(HttpClient);

  getById(id: string): Observable<PmInvoiceModel> {
    return this.http.get<PmInvoiceModel>(`${apiBaseUrl}/api/pm/invoices/${id}`);
  }

  getPaging(params: { projectId?: string; page?: number; size?: number; sortBy?: string; sortDirection?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);

    return this.http.get(`${apiBaseUrl}/api/pm/invoices/paging`, { params: httpParams });
  }

  save(data: Partial<PmInvoiceModel>): Observable<string> {
    return this.http.post<string>(`${apiBaseUrl}/api/pm/invoices/save`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${apiBaseUrl}/api/pm/invoices/${id}`);
  }
}
