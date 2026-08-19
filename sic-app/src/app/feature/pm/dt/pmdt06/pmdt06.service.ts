// src/app/feature/pm/dt/pmdt07/pmdt07.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt06Model } from './pmdt06.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt06Service {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/change-requests`;

  getChangeRequests(projectId: string): Observable<Pmdt06Model[]> {
    return this.http.get<Pmdt06Model[]>(`${this.baseUrl}?projectId=${projectId}`);
  }

  getChangeRequestById(id: string): Observable<Pmdt06Model> {
    return this.http.get<Pmdt06Model>(`${this.baseUrl}/${id}`);
  }

  createChangeRequest(data: Partial<Pmdt06Model>): Observable<Pmdt06Model> {
    return this.http.post<Pmdt06Model>(this.baseUrl, data);
  }

  updateChangeRequest(id: string, data: Partial<Pmdt06Model>): Observable<Pmdt06Model> {
    return this.http.put<Pmdt06Model>(`${this.baseUrl}/${id}`, data);
  }

  deleteChangeRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
