import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { PmMaRenewalModel } from './pmdt18A.model';

@Injectable({ providedIn: 'root' })
export class Pmdt18AService {
  private http = inject(HttpClient);

  getById(id: string): Observable<PmMaRenewalModel> {
    return this.http.get<PmMaRenewalModel>(`${apiBaseUrl}/api/pm/ma-renewals/${id}`);
  }

  getPaging(params: { projectId?: string; page?: number; size?: number; sortBy?: string; sortDirection?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params.projectId) httpParams = httpParams.set('projectId', params.projectId);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);

    return this.http.get(`${apiBaseUrl}/api/pm/ma-renewals/paging`, { params: httpParams });
  }

  save(data: Partial<PmMaRenewalModel>): Observable<string> {
    return this.http.post<string>(`${apiBaseUrl}/api/pm/ma-renewals/save`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${apiBaseUrl}/api/pm/ma-renewals/${id}`);
  }
}
