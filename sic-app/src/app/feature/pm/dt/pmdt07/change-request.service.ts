// src/app/core/services/change-request.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import type { ChangeRequest, ImpactAnalysis } from './change-request.model';


import { PaginationResponse } from '../../../../core/model/sic-base-model';

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
  }): Observable<PaginationResponse<ChangeRequest>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<PaginationResponse<ChangeRequest>>(this.baseUrl, { params: httpParams });
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
  // ใน change-request.service.ts เพิ่ม
  createChangeRequest(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }
  submitForApproval(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/submit`, {});
  }
  approve(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/approve`, {});
  }
  reject(id: string, reason?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/reject`, { reason });
  }
  implement(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/implement`, {});
  }
  markAssigneeComplete(id: string, userId: string, targetId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/assignees/complete`, {}, { params: { userId, targetId } });
  }
  checkEditLock(targetType: string, targetId: string): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/api/pm/edit-sessions/check`, { params: { targetType, targetId } });
  }
}