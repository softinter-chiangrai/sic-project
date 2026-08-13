import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { PmDeliveryModel, PmDeliveryGateCheckResponse } from './pmdt18.model';

@Injectable({ providedIn: 'root' })
export class Pmdt18Service {
  private http = inject(HttpClient);

  getPaging(params: { projectId?: string; page: number; size: number; sortBy?: string; sortDirection?: string }): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());
    if (params.projectId) {
      httpParams = httpParams.set('projectId', params.projectId);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }
    return this.http.get(`${apiBaseUrl}/api/pm/delivery/paging`, { params: httpParams });
  }

  getById(id: string): Observable<PmDeliveryModel> {
    return this.http.get<PmDeliveryModel>(`${apiBaseUrl}/api/pm/delivery/${id}`);
  }

  save(data: Partial<PmDeliveryModel>): Observable<string> {
    return this.http.post<string>(`${apiBaseUrl}/api/pm/delivery/save`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${apiBaseUrl}/api/pm/delivery/${id}`);
  }

  getGateCheck(projectId: string, deliveryId?: string): Observable<PmDeliveryGateCheckResponse> {
    let httpParams = new HttpParams().set('projectId', projectId);
    if (deliveryId) {
      httpParams = httpParams.set('deliveryId', deliveryId);
    }
    return this.http.get<PmDeliveryGateCheckResponse>(`${apiBaseUrl}/api/pm/delivery/gate-check`, { params: httpParams });
  }
}
