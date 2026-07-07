// src/app/core/services/milestone.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { MilestoneRequest, MilestoneResponse } from '../model/phase.model';

@Injectable({
  providedIn: 'root',
})
export class MilestoneService {
  private http = inject(HttpClient);
  private apiBaseUrl = environment.apiBaseUrl;

  getMilestonesByPhaseId(phaseId: string): Observable<MilestoneResponse[]> {
    return this.http.get<MilestoneResponse[]>(`${this.apiBaseUrl}/api/pm/milestones/phase/${phaseId}`);
  }

  getMilestoneById(id: string): Observable<MilestoneResponse> {
    return this.http.get<MilestoneResponse>(`${this.apiBaseUrl}/api/pm/milestones/${id}`);
  }

  createMilestone(data: MilestoneRequest): Observable<MilestoneResponse> {
    return this.http.post<MilestoneResponse>(`${this.apiBaseUrl}/api/pm/milestones`, data);
  }

  updateMilestone(id: string, data: MilestoneRequest): Observable<MilestoneResponse> {
    return this.http.put<MilestoneResponse>(`${this.apiBaseUrl}/api/pm/milestones/${id}`, data);
  }

  deleteMilestone(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/pm/milestones/${id}`);
  }
}