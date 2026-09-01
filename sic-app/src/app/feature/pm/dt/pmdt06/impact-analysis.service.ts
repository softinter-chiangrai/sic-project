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

    autoDetect(changeRequestId: string): Observable<ImpactAnalysis> {
        return this.http.post<ImpactAnalysis>(`${this.baseUrl}/auto-detect-trace/${changeRequestId}`, {});
    }

    save(data: ImpactAnalysis): Observable<string> {
        return this.http.post<string>(`${this.baseUrl}/save`, data);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}