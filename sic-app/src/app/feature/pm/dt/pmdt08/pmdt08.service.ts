// src/app/feature/pm/dt/pmdt08/pmdt08.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PaginationResponse } from '../../../../core/model/pagination.model';
import { PmSpecificationModel } from './pmdt08.model';

@Injectable({ providedIn: 'root' })
export class Pmdt08Service {
    private http = inject(HttpClient);
    private baseUrl = environment.apiBaseUrl + '/api/pm/specifications';

    // Combobox endpoints
    apiGetComboboxProject = `${environment.apiBaseUrl}/api/pm/requirement/combobox-project`;
    apiGetLovPriority = `${environment.apiBaseUrl}/api/db/parameter/lov?group=COMMON&parameterCode=PRIORITY`;
    apiGetLovStatus = `${environment.apiBaseUrl}/api/db/parameter/lov?group=COMMON&parameterCode=DOC_STATUS`;
    apiGetComboboxRequirement = `${environment.apiBaseUrl}/api/pm/requirement/combobox`;
    apiGetApprovals = `${environment.apiBaseUrl}/api/pm/approvals/flows/document-type/SPECIFICATION`;

    // CRUD
    getSpecification(id: string): Observable<PmSpecificationModel> {
        return this.http.get<PmSpecificationModel>(`${this.baseUrl}/${id}`);
    }

    save(data: PmSpecificationModel): Observable<any> {
        return this.http.post(this.baseUrl, data);
    }

    autoSave(data: PmSpecificationModel): Observable<any> {
        return this.http.post(this.baseUrl, data);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    // ✅ ใช้ PaginationResponse จาก core/model
    getList(params: any): Observable<PaginationResponse<PmSpecificationModel>> {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                httpParams = httpParams.set(key, String(params[key]));
            }
        });
        return this.http.get<PaginationResponse<PmSpecificationModel>>(this.baseUrl, { params: httpParams });
    }
}