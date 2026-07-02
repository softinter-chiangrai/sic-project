// src/app/feature/pm/rt/pmrt02/pmrt02.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  customerId: string;
  customerName: string;
  contractId: string;
  contractNo: string;
  projectManager: string;
  ba: string;
  sa: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  budgetManday: number;
  usedManday: number;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  isActive: boolean;
  createdAt: string;
  rowVersion?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class Pmrt02Service {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/pm/projects'; // หรือ '/api/su-project'

  getProjects(
    businessId: string,
    customerId?: string | null,
    keyword?: string,
    page: number = 0,
    size: number = 10,
    sortBy?: string,
    sortDir?: 'asc' | 'desc'
  ): Observable<PageResponse<Project>> {
    let params = new HttpParams()
      .set('businessId', businessId)
      .set('page', page.toString())
      .set('size', size.toString());

    if (customerId) params = params.set('customerId', customerId);
    if (keyword) params = params.set('keyword', keyword);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortDir) params = params.set('sortDir', sortDir);

    return this.http.get<PageResponse<Project>>(this.baseUrl, { params });
  }

  // (อาจมี getProjectById, save, delete ด้วย)
}