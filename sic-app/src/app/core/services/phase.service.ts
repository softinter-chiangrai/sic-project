// src/app/core/services/phase.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { PhaseRequest, PhaseResponse } from '../model/phase.model';

@Injectable({
  providedIn: 'root',
})
export class PhaseService {
  private http = inject(HttpClient);
  private apiBaseUrl = environment.apiBaseUrl;

  getPhases(projectId: string): Observable<PhaseResponse[]> {
    return this.http.get<PhaseResponse[]>(`${this.apiBaseUrl}/api/pm/projects/${projectId}/phases`);
  }

  getPhaseById(phaseId: string): Observable<PhaseResponse> {
    return this.http.get<PhaseResponse>(`${this.apiBaseUrl}/api/pm/phases/${phaseId}`);
  }

  createPhase(projectId: string, data: PhaseRequest): Observable<PhaseResponse> {
    return this.http.post<PhaseResponse>(`${this.apiBaseUrl}/api/pm/projects/${projectId}/phases`, data);
  }

  updatePhase(phaseId: string, data: PhaseRequest): Observable<PhaseResponse> {
    return this.http.put<PhaseResponse>(`${this.apiBaseUrl}/api/pm/phases/${phaseId}`, data);
  }

  deletePhase(phaseId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/api/pm/phases/${phaseId}`);
  }
}