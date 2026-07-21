// src/app/core/services/change-request.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import type { ChangeRequest, ImpactAnalysis } from './change-request.model';


export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class ChangeRequestService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/pm/change-requests'; // สมมติ endpoint
  private impactUrl = environment.apiBaseUrl + '/api/pm/impact-analysis';

  // ===== Change Request CRUD =====
  getChangeRequests(params?: {
    projectId?: string;
    requirementId?: string;
    status?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }): Observable<PageResponse<ChangeRequest>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<PageResponse<ChangeRequest>>(this.baseUrl, { params: httpParams });
  }

  getChangeRequest(id: string): Observable<ChangeRequest> {
    return this.http.get<ChangeRequest>(`${this.baseUrl}/${id}`);
  }

  saveChangeRequest(data: ChangeRequest): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/save`, data);
  }

  deleteChangeRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ===== Impact Analysis =====
  getImpactByChangeRequest(changeRequestId: string): Observable<ImpactAnalysis> {
    return this.http.get<ImpactAnalysis>(`${this.impactUrl}/change-request/${changeRequestId}`);
  }

  autoDetectImpact(changeRequestId: string): Observable<ImpactAnalysis> {
    return this.http.post<ImpactAnalysis>(`${this.impactUrl}/auto-detect/${changeRequestId}`, {});
  }

  saveImpactAnalysis(data: ImpactAnalysis): Observable<string> {
    return this.http.post<string>(`${this.impactUrl}/save`, data);
  }

  deleteImpactAnalysis(id: string): Observable<void> {
    return this.http.delete<void>(`${this.impactUrl}/${id}`);
  }
}