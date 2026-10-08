// src/app/feature/pm/dt/pmdt07/impact-analysis.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ImpactDiagramItem {
    id: string;
    name: string;
    diagramType?: string;
}

export interface ImpactNamedItem {
    id: string;
    code?: string;
    name?: string;
}

export interface ImpactProjectItem {
    id: string;
    code?: string;
    name?: string;
    projectCode?: string;
    projectName?: string;
    status?: string;
    customerId?: string;
    customerName?: string;
}

export interface ImpactCustomerItem {
    id: string;
    code?: string;
    name?: string;
    customerCode?: string;
    customerName?: string;
}

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
    aiRationale?: string;
    impactedProjectIds?: string[];
    impactedProjects?: ImpactProjectItem[];
    impactedCustomerIds?: string[];
    impactedCustomers?: ImpactCustomerItem[];
    impactedRequirementIds?: string[];
    impactedRequirements?: ImpactNamedItem[];
    impactedSpecIds?: string[];
    impactedSpecs?: ImpactNamedItem[];
    impactedTaskIds?: string[];
    impactedTasks?: ImpactNamedItem[];
    impactedTestCaseIds?: string[];
    impactedTestCases?: ImpactNamedItem[];
    impactedBugIds?: string[];
    impactedBugs?: ImpactNamedItem[];
    impactedDiagramIds?: string[];
    impactedDiagrams?: ImpactDiagramItem[];
    impactedManualIds?: string[];
    impactedManuals?: ImpactNamedItem[];
    impactedDeliveryIds?: string[];
    impactedDeliveries?: ImpactNamedItem[];
    impactedInvoiceIds?: string[];
    impactedInvoices?: ImpactNamedItem[];
    impactedMaTicketIds?: string[];
    impactedMaTickets?: ImpactNamedItem[];
    impactedTableNames?: string[];
    analysisStatus?: 'AUTO' | 'MANUAL' | 'AI';
    analyzedAt?: string;
    analyzedBy?: string;
}

export interface AiImpactPreviewRequest {
    targetType: string;
    targetId: string;
    title?: string;
    description?: string;
    changeReason?: string;
    changeLevel?: string;
    priority?: string;
    prompt?: string;
    model?: string;
}

export interface ImpactAnalysisHistoryItem {
    id: string;
    changeRequestId: string;
    analysisId?: string;
    analysisStatus: 'AUTO' | 'MANUAL' | 'AI';
    versionNo: number;
    mandayImpact?: number;
    timelineImpact?: number;
    aiRationale?: string;
    analyzedAt?: string;
    analyzedBy?: string;
    createdDate?: string;
    requirementCount: number;
    specCount: number;
    diagramCount: number;
    taskCount: number;
    testCaseCount: number;
    bugCount: number;
    projectCount: number;
    customerCount: number;
    snapshot?: ImpactAnalysis;
}

@Injectable({ providedIn: 'root' })
export class ImpactAnalysisService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiBaseUrl + '/api/pm/impact-analysis';

    getByChangeRequest(changeRequestId: string): Observable<ImpactAnalysis> {
        return this.http.get<ImpactAnalysis>(`${this.baseUrl}/change-request/${changeRequestId}`);
    }

    preview(targetType: string, targetId: string, changeLevel?: string): Observable<ImpactAnalysis> {
        const params: Record<string, string> = { targetType, targetId };
        if (changeLevel) {
            params['changeLevel'] = changeLevel;
        }
        return this.http.get<ImpactAnalysis>(`${this.baseUrl}/preview`, { params });
    }

    autoDetect(changeRequestId: string): Observable<ImpactAnalysis> {
        return this.http.post<ImpactAnalysis>(`${this.baseUrl}/auto-detect-trace/${changeRequestId}`, {});
    }

    aiAnalyze(changeRequestId: string): Observable<ImpactAnalysis> {
        return this.http.post<ImpactAnalysis>(`${this.baseUrl}/ai-analyze/${changeRequestId}`, {});
    }

    aiPreview(request: AiImpactPreviewRequest): Observable<ImpactAnalysis> {
        return this.http.post<ImpactAnalysis>(`${this.baseUrl}/ai-preview`, request);
    }

    getHistory(changeRequestId: string): Observable<ImpactAnalysisHistoryItem[]> {
        return this.http.get<ImpactAnalysisHistoryItem[]>(`${this.baseUrl}/history/${changeRequestId}`);
    }

    restoreHistory(historyId: string): Observable<ImpactAnalysis> {
        return this.http.post<ImpactAnalysis>(`${this.baseUrl}/history/${historyId}/restore`, {});
    }

    save(data: ImpactAnalysis): Observable<string> {
        return this.http.post<string>(`${this.baseUrl}/save`, data);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}