// src/app/feature/pm/services/work-package.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { WorkPackageRequest, WorkPackageResponse } from '../model/phase.model';


@Injectable({ providedIn: 'root' })
export class WorkPackageService {
  private baseUrl = `/api/pm/work-packages`;

  constructor(private http: HttpClient) {}

  getWorkPackagesByMilestoneId(milestoneId: string): Observable<WorkPackageResponse[]> {
    return this.http.get<WorkPackageResponse[]>(`${this.baseUrl}/milestone/${milestoneId}`);
  }

  getWorkPackageById(id: string): Observable<WorkPackageResponse> {
    return this.http.get<WorkPackageResponse>(`${this.baseUrl}/${id}`);
  }

  createWorkPackage(data: WorkPackageRequest): Observable<WorkPackageResponse> {
    return this.http.post<WorkPackageResponse>(this.baseUrl, data);
  }

  updateWorkPackage(wpId: string, data: WorkPackageRequest): Observable<WorkPackageResponse> {
    return this.http.put<WorkPackageResponse>(`${this.baseUrl}/${wpId}`, data);
  }

  deleteWorkPackage(wpId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${wpId}`);
  }
}