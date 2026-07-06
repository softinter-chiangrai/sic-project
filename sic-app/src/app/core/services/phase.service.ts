// src/app/core/services/phase.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PhaseRequest, PhaseResponse } from '../model/phase.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PhaseService {
  private baseUrl = environment.apiBaseUrl + '/api/pm'; // ✅

  constructor(private http: HttpClient) {}

  getPhases(projectId: string): Observable<PhaseResponse[]> {
    return this.http.get<PhaseResponse[]>(`${this.baseUrl}/projects/${projectId}/phases`);
  }

  getPhaseById(phaseId: string): Observable<PhaseResponse> {
    return this.http.get<PhaseResponse>(`${this.baseUrl}/phases/${phaseId}`);
  }

  createPhase(projectId: string, data: PhaseRequest): Observable<PhaseResponse> {
    return this.http.post<PhaseResponse>(`${this.baseUrl}/projects/${projectId}/phases`, data);
  }

  updatePhase(phaseId: string, data: PhaseRequest): Observable<PhaseResponse> {
    return this.http.put<PhaseResponse>(`${this.baseUrl}/phases/${phaseId}`, data);
  }

  deletePhase(phaseId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/phases/${phaseId}`);
  }
}