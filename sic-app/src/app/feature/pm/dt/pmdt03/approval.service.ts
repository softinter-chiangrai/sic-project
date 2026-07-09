// src/app/core/services/approval.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import type { PaginationResponse } from '../../../../core/model/pagination.model';
import type { Approval, ApprovalFlow, ApprovalSearchParams, ApprovalSummary, SubmitApprovalRequest } from './approval.model';


@Injectable({ providedIn: 'root' })
export class ApprovalService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiBaseUrl}/api/pm/approvals`;

    // ============================================================
    // 1. Submit
    // ============================================================
    submitForApproval(request: SubmitApprovalRequest): Observable<Approval> {
        return this.http.post<Approval>(`${this.baseUrl}/submit`, request);
    }

    // ============================================================
    // 2. Actions
    // ============================================================
    approve(approvalId: string, comment?: string, signature?: string): Observable<Approval> {
        return this.http.post<Approval>(`${this.baseUrl}/${approvalId}/approve`, {
            approvalId,
            comment,
            signature,
        });
    }

    reject(approvalId: string, comment?: string): Observable<Approval> {
        return this.http.post<Approval>(`${this.baseUrl}/${approvalId}/reject`, {
            approvalId,
            comment,
        });
    }

    requestRevision(approvalId: string, comment?: string): Observable<Approval> {
        return this.http.post<Approval>(`${this.baseUrl}/${approvalId}/revise`, {
            approvalId,
            comment,
        });
    }

    cancel(approvalId: string, reason?: string): Observable<Approval> {
        return this.http.post<Approval>(`${this.baseUrl}/${approvalId}/cancel`, {
            approvalId,
            comment: reason,
        });
    }

    delegate(approvalId: string, delegateToUserId: string, comment?: string): Observable<Approval> {
        return this.http.post<Approval>(`${this.baseUrl}/${approvalId}/delegate`, {
            approvalId,
            delegateToUserId,
            comment,
        });
    }

    // ============================================================
    // 3. Query
    // ============================================================
    getApproval(id: string): Observable<Approval> {
        return this.http.get<Approval>(`${this.baseUrl}/${id}`);
    }

    getByDocument(documentType: string, documentId: string, page = 0, size = 10): Observable<PaginationResponse<Approval>> {
        const params = new HttpParams()
            .set('documentType', documentType)
            .set('documentId', documentId)
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PaginationResponse<Approval>>(`${this.baseUrl}/document`, { params });
    }

    getPending(page = 0, size = 10): Observable<PaginationResponse<Approval>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PaginationResponse<Approval>>(`${this.baseUrl}/pending`, { params });
    }

    getMyRequests(page = 0, size = 10): Observable<PaginationResponse<Approval>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<PaginationResponse<Approval>>(`${this.baseUrl}/my-requests`, { params });
    }

    search(params: ApprovalSearchParams): Observable<PaginationResponse<Approval>> {
  let httpParams = new HttpParams()
    .set('pageNumber', (params.pageNumber ?? 1).toString())
    .set('pageSize', (params.pageSize ?? 10).toString());

  if (params.documentType) httpParams = httpParams.set('documentType', params.documentType);
  if (params.status) httpParams = httpParams.set('status', params.status);
  if (params.requestedBy) httpParams = httpParams.set('requestedBy', params.requestedBy);
  if (params.approver) httpParams = httpParams.set('approver', params.approver);
  if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);


  if (params.sorts && params.sorts.length > 0) {
    params.sorts.forEach((sort, index) => {
      httpParams = httpParams.set(`sorts[${index}].field`, sort.field);
      httpParams = httpParams.set(`sorts[${index}].descending`, sort.descending.toString());
    });
  }

  return this.http.get<PaginationResponse<Approval>>(`${this.baseUrl}/search`, { params: httpParams });
}

    getSummary(): Observable<ApprovalSummary> {
        return this.http.get<ApprovalSummary>(`${this.baseUrl}/summary`);
    }

    canApprove(approvalId: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}/${approvalId}/can-approve`);
    }

    getDocumentStatus(documentType: string, documentId: string): Observable<Approval> {
        const params = new HttpParams()
            .set('documentType', documentType)
            .set('documentId', documentId);
        return this.http.get<Approval>(`${this.baseUrl}/document/status`, { params });
    }

    // ============================================================
    // 4. Flows
    // ============================================================
    getAllFlows(): Observable<ApprovalFlow[]> {
        return this.http.get<ApprovalFlow[]>(`${this.baseUrl}/flows`);
    }

    getFlowsByDocumentType(documentType: string): Observable<ApprovalFlow[]> {
        return this.http.get<ApprovalFlow[]>(`${this.baseUrl}/flows/document-type/${documentType}`);
    }

    getFlow(id: string): Observable<ApprovalFlow> {
        return this.http.get<ApprovalFlow>(`${this.baseUrl}/flows/${id}`);
    }

    getFlowByCode(flowCode: string): Observable<ApprovalFlow> {
        return this.http.get<ApprovalFlow>(`${this.baseUrl}/flows/code/${flowCode}`);
    }

    getDefaultFlow(documentType: string): Observable<ApprovalFlow> {
        return this.http.get<ApprovalFlow>(`${this.baseUrl}/flows/default/${documentType}`);
    }
}