// src/app/feature/pm/dt/pmdt04/pmdt04.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt04Model } from './pmdt04.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt04Service {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/requirements`;

  getRequirements(projectId: string): Observable<Pmdt04Model[]> {
    return this.http.get<Pmdt04Model[]>(`${this.baseUrl}?projectId=${projectId}`);
  }

  getRequirementById(id: string): Observable<Pmdt04Model> {
    return this.http.get<Pmdt04Model>(`${this.baseUrl}/${id}`);
  }

  createRequirement(data: Partial<Pmdt04Model>): Observable<Pmdt04Model> {
    return this.http.post<Pmdt04Model>(this.baseUrl, data);
  }

  updateRequirement(id: string, data: Partial<Pmdt04Model>): Observable<Pmdt04Model> {
    return this.http.put<Pmdt04Model>(`${this.baseUrl}/${id}`, data);
  }

  deleteRequirement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
