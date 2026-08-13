import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { PmPaymentModel } from './pmdt20A.model';

@Injectable({ providedIn: 'root' })
export class Pmdt20AService {
  private http = inject(HttpClient);

  getById(id: string): Observable<PmPaymentModel> {
    return this.http.get<PmPaymentModel>(`${apiBaseUrl}/api/pm/payments/${id}`);
  }

  getPaging(params: { invoiceId?: string; page?: number; size?: number; sortBy?: string; sortDirection?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params.invoiceId) httpParams = httpParams.set('invoiceId', params.invoiceId);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);

    return this.http.get(`${apiBaseUrl}/api/pm/payments/paging`, { params: httpParams });
  }

  save(data: Partial<PmPaymentModel>): Observable<string> {
    return this.http.post<string>(`${apiBaseUrl}/api/pm/payments/save`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${apiBaseUrl}/api/pm/payments/${id}`);
  }
}
