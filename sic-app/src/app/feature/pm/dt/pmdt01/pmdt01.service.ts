// src/app/feature/pm/dt/pmdt01/pmdt01.service.ts

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PhaseModel } from './pmdt01.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt01Service {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/pm'; // ✅ แก้ baseUrl

  // ✅ เรียกด้วย path parameter แทน query param
  getPhases(projectId: string): Observable<PhaseModel[]> {
    return this.http.get<PhaseModel[]>(`${this.baseUrl}/projects/${projectId}/phases`);
  }

  getPhaseById(id: string): Observable<PhaseModel> {
    return this.http.get<PhaseModel>(`${this.baseUrl}/phases/${id}`); // ✅ แก้ path
  }

  createPhase(phase: Partial<PhaseModel>): Observable<PhaseModel> {
    return this.http.post<PhaseModel>(`${this.baseUrl}/projects/${phase.projectId}/phases`, phase);
  }

  updatePhase(id: string, phase: Partial<PhaseModel>): Observable<PhaseModel> {
    return this.http.put<PhaseModel>(`${this.baseUrl}/phases/${id}`, phase);
  }

  deletePhase(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/phases/${id}`);
  }
}