// src/app/core/services/milestone.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { MilestoneRequest, MilestoneResponse } from '../model/phase.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MilestoneService {
  private baseUrl = environment.apiBaseUrl + '/api/pm/milestones';

  constructor(private http: HttpClient) {}

  getMilestonesByPhaseId(phaseId: string): Observable<MilestoneResponse[]> {
    return this.http.get<MilestoneResponse[]>(`${this.baseUrl}/phase/${phaseId}`);
  }

  getMilestoneById(id: string): Observable<MilestoneResponse> {
    return this.http.get<MilestoneResponse>(`${this.baseUrl}/${id}`);
  }

  createMilestone(data: MilestoneRequest): Observable<MilestoneResponse> {
    return this.http.post<MilestoneResponse>(this.baseUrl, data);
  }

  updateMilestone(milestoneId: string, data: MilestoneRequest): Observable<MilestoneResponse> {
    return this.http.put<MilestoneResponse>(`${this.baseUrl}/${milestoneId}`, data);
  }

  deleteMilestone(milestoneId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${milestoneId}`);
  }
}