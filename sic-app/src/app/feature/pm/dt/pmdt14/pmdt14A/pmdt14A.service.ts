import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { PmDeliveryModel, PmDeliveryGateCheckResponse } from './pmdt14A.model';

@Injectable({ providedIn: 'root' })
export class Pmdt14AService {
  private http = inject(HttpClient);

  getById(id: string): Observable<PmDeliveryModel> {
    return this.http.get<PmDeliveryModel>(`${apiBaseUrl}/api/pm/delivery/${id}`);
  }

  getPaging(params: { page?: number; size?: number; projectId?: string; keyword?: string; status?: string; deliveryType?: string; [key: string]: any }): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<any>(`${apiBaseUrl}/api/pm/delivery/paging`, { params: httpParams });
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

  getContractCombobox(projectId?: string): Observable<Array<{ value: string; text: string }>> {
    let httpParams = new HttpParams();
    if (projectId) {
      httpParams = httpParams.set('projectId', projectId);
    }
    return this.http.get<Array<{ value: string; text: string }>>(`${apiBaseUrl}/api/pm/contracts/combobox`, { params: httpParams });
  }

  generateDraft(data: { projectId?: string; deliveryName?: string; prompt?: string; model?: string }): Observable<any> {
    return this.http.post<any>(`${apiBaseUrl}/api/pm/delivery/generate/draft`, data);
  }
}
