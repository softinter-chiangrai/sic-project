// src/app/feature/pm/dt/pmdt08/pmdt08.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PaginationResponse } from '../../../../core/model/pagination.model';
import { PmSpecificationModel } from './pmdt08.model';

export interface ComboboxItem {
    value: string;
    text: string;
}

@Injectable({ providedIn: 'root' })
export class Pmdt08Service {
    private http = inject(HttpClient);
    private baseUrl = environment.apiBaseUrl + '/api/pm/specification';

    // ===== CRUD =====
    search(params: {
        keyword?: string;
        status?: string;
        page?: number;
        size?: number;
        sortBy?: string;
        sortDir?: string;
    }): Observable<PaginationResponse<PmSpecificationModel>> {
        let httpParams = new HttpParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                httpParams = httpParams.set(key, String(value));
            }
        });
        return this.http.get<PaginationResponse<PmSpecificationModel>>(this.baseUrl, { params: httpParams });
    }

    getById(id: string): Observable<PmSpecificationModel> {
        return this.http.get<PmSpecificationModel>(`${this.baseUrl}/${id}`);
    }

    getByCode(code: string): Observable<PmSpecificationModel> {
        return this.http.get<PmSpecificationModel>(`${this.baseUrl}/code/${code}`);
    }

    save(data: PmSpecificationModel): Observable<string> {
        return this.http.post<string>(this.baseUrl, data);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    // ===== AI Generator =====
    generateDraft(requirementId: string, diagramId: string): Observable<any> {
        const params = new HttpParams()
            .set('requirementId', requirementId)
            .set('diagramId', diagramId);
        return this.http.post<any>(`${this.baseUrl}/generate/draft`, null, { params });
    }

    // ===== Combobox APIs =====
    getComboboxRequirements(projectId: string): Observable<ComboboxItem[]> {
        return this.http.get<ComboboxItem[]>(
            `${environment.apiBaseUrl}/api/pm/requirement/combobox?projectId=${projectId}`
        );
    }

    getComboboxDiagrams(projectId: string): Observable<ComboboxItem[]> {
        return this.http.get<ComboboxItem[]>(
            `${environment.apiBaseUrl}/api/diagram/tabs?projectId=${projectId}`
        );
    }
}