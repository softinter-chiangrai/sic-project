// src/app/core/services/work-package.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { WorkPackageResponse, WorkPackageRequest } from '../model/phase.model';

@Injectable({
  providedIn: 'root',
})
export class WorkPackageService {
  private http = inject(HttpClient);
  private apiBaseUrl = environment.apiBaseUrl;

  getWorkPackageById(id: string): Observable<WorkPackageResponse> {
    return this.http.get<WorkPackageResponse>(`${this.apiBaseUrl}/api/pm/work-packages/${id}`);
  }

  createWorkPackage(data: WorkPackageRequest): Observable<WorkPackageResponse> {
    return this.http.post<WorkPackageResponse>(`${this.apiBaseUrl}/api/pm/work-packages`, data);
  }

  updateWorkPackage(id: string, data: WorkPackageRequest): Observable<WorkPackageResponse> {
    return this.http.put<WorkPackageResponse>(`${this.apiBaseUrl}/api/pm/work-packages/${id}`, data);
  }

  deleteWorkPackage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/pm/work-packages/${id}`);
  }

  // ✅ 新增: โหลด Work Packages ตาม Milestone ID
  getWorkPackagesByMilestoneId(milestoneId: string): Observable<WorkPackageResponse[]> {
    return this.http.get<WorkPackageResponse[]>(
      `${this.apiBaseUrl}/api/pm/work-packages/milestone/${milestoneId}`
    );
  }
}