// src/app/feature/pm/dt/pmdt07/pmdt07.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt07Model } from './pmdt07.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt07Service {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/change-requests`;

  getChangeRequests(projectId: string): Observable<Pmdt07Model[]> {
    return this.http.get<Pmdt07Model[]>(`${this.baseUrl}?projectId=${projectId}`);
  }

  getChangeRequestById(id: string): Observable<Pmdt07Model> {
    return this.http.get<Pmdt07Model>(`${this.baseUrl}/${id}`);
  }

  createChangeRequest(data: Partial<Pmdt07Model>): Observable<Pmdt07Model> {
    return this.http.post<Pmdt07Model>(this.baseUrl, data);
  }

  updateChangeRequest(id: string, data: Partial<Pmdt07Model>): Observable<Pmdt07Model> {
    return this.http.put<Pmdt07Model>(`${this.baseUrl}/${id}`, data);
  }

  deleteChangeRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
