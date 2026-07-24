// src/app/feature/pm/dt/pmdt08/pmdt08.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SpecificationModel } from './pmdt08.model';
import { PaginationResponse } from '../../../../core/model/pagination.model';

export interface ComboboxItem {
  value: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class Pmdt08Service {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/pm/specification';

  // ✅ เพิ่ม property สำหรับใช้ใน template
  readonly apiGetComboboxRequirement = this.baseUrl + '/combobox-requirement';

  search(params: {
    projectId?: string;
    keyword?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Observable<PaginationResponse<SpecificationModel>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<PaginationResponse<SpecificationModel>>(`${this.baseUrl}/paging`, { params: httpParams });
  }

  getById(id: string): Observable<SpecificationModel> {
    return this.http.get<SpecificationModel>(`${this.baseUrl}/${id}`);
  }

  save(data: SpecificationModel): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/save`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getComboboxRequirements(projectId: string): Observable<ComboboxItem[]> {
    return this.http.get<ComboboxItem[]>(`${this.baseUrl}/combobox-requirement?projectId=${projectId}`);
  }
}