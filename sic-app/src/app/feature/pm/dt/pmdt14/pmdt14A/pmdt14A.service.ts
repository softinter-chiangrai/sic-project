import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { PmDeliveryModel, PmDeliveryGateCheckResponse } from './pmdt18A.model';

@Injectable({ providedIn: 'root' })
export class Pmdt18AService {
  private http = inject(HttpClient);

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
