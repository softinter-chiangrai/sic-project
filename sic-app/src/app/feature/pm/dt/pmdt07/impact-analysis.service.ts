// src/app/core/services/impact-analysis.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ImpactAnalysis {
  id?: string;
  changeRequestId: string;
  dfdImpact?: string;
  erImpact?: string;
  uiImpact?: string;
  apiImpact?: string;
  testImpact?: string;
  mandayImpact?: number;
  timelineImpact?: number;
  costImpact?: string;
  impactedRequirementIds?: string[];
  impactedSpecIds?: string[];
  impactedTaskIds?: string[];
  impactedTestCaseIds?: string[];
  impactedBugIds?: string[];
  impactedTableNames?: string[];
  analysisStatus?: 'AUTO' | 'MANUAL';
  analyzedAt?: string;
  analyzedBy?: string;
}

@Injectable({ providedIn: 'root' })
export class ImpactAnalysisService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/pm/impact-analysis';

  getByChangeRequest(changeRequestId: string): Observable<ImpactAnalysis> {
    return this.http.get<ImpactAnalysis>(`${this.baseUrl}/change-request/${changeRequestId}`);
  }

  save(data: ImpactAnalysis): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/save`, data);
  }

  autoDetect(changeRequestId: string): Observable<ImpactAnalysis> {
    return this.http.post<ImpactAnalysis>(`${this.baseUrl}/auto-detect/${changeRequestId}`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}