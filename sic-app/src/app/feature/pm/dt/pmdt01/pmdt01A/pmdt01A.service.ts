// src/app/feature/pm/dt/pmdt01/pmdt01A/pmdt01A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt01AModel } from './pmdt01A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt01AService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm`;

  getPhases(projectId: string): Observable<Pmdt01AModel[]> {
    return this.http.get<Pmdt01AModel[]>(`${this.baseUrl}/projects/${projectId}/phases`);
  }

  getPhaseById(id: string): Observable<Pmdt01AModel> {
    return this.http.get<Pmdt01AModel>(`${this.baseUrl}/phases/${id}`);
  }

  createPhase(phase: Partial<Pmdt01AModel>): Observable<Pmdt01AModel> {
    return this.http.post<Pmdt01AModel>(`${this.baseUrl}/projects/${phase.projectId}/phases`, phase);
  }

  updatePhase(id: string, phase: Partial<Pmdt01AModel>): Observable<Pmdt01AModel> {
    return this.http.put<Pmdt01AModel>(`${this.baseUrl}/phases/${id}`, phase);
  }

  deletePhase(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/phases/${id}`);
  }
}
