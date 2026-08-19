// src/app/feature/pm/dt/pmdt08/pmdt08.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt08Model } from './pmdt08.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt08Service {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/discussions`;

  getDiscussions(projectId: string): Observable<Pmdt08Model[]> {
    return this.http.get<Pmdt08Model[]>(`${this.baseUrl}?projectId=${projectId}`);
  }

  getDiscussionById(id: string): Observable<Pmdt08Model> {
    return this.http.get<Pmdt08Model>(`${this.baseUrl}/${id}`);
  }

  createDiscussion(data: Partial<Pmdt08Model>): Observable<Pmdt08Model> {
    return this.http.post<Pmdt08Model>(this.baseUrl, data);
  }

  updateDiscussion(id: string, data: Partial<Pmdt08Model>): Observable<Pmdt08Model> {
    return this.http.put<Pmdt08Model>(`${this.baseUrl}/${id}`, data);
  }

  deleteDiscussion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
