// sic-app/src/app/feature/bu/rt/burt06/burt06.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ApprovalFlow {
  id?: string;
  flowCode: string;
  flowName: string;
  documentType: string;
  approvalMode: string;
  description?: string;
  active: boolean;
  steps: ApprovalFlowStep[];
  rowVersion?: number;
}

export interface ApprovalFlowStep {
  id?: string;
  stepOrder: number;
  stepName: string;
  approverRole?: string;
  isRequired: boolean;
  timeoutDays?: number;
  canSkip: boolean;
  rowVersion?: number;
}

@Injectable({ providedIn: 'root' })
export class Burt06Service {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/pm/approval-flows';

  getFlows(): Observable<ApprovalFlow[]> {
    return this.http.get<ApprovalFlow[]>(this.baseUrl);
  }

  getFlow(id: string): Observable<ApprovalFlow> {
    return this.http.get<ApprovalFlow>(`${this.baseUrl}/${id}`);
  }

  createFlow(data: ApprovalFlow): Observable<ApprovalFlow> {
    return this.http.post<ApprovalFlow>(this.baseUrl, data);
  }

  updateFlow(id: string, data: ApprovalFlow): Observable<ApprovalFlow> {
    return this.http.put<ApprovalFlow>(`${this.baseUrl}/${id}`, data);
  }

  deleteFlow(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}