// src/app/feature/pm/dt/pmdt09/pmdt09.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt09Model } from './pmdt09.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt09Service {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/discussions`;

  getDiscussions(projectId: string): Observable<Pmdt09Model[]> {
    return this.http.get<Pmdt09Model[]>(`${this.baseUrl}?projectId=${projectId}`);
  }

  getDiscussionById(id: string): Observable<Pmdt09Model> {
    return this.http.get<Pmdt09Model>(`${this.baseUrl}/${id}`);
  }

  createDiscussion(data: Partial<Pmdt09Model>): Observable<Pmdt09Model> {
    return this.http.post<Pmdt09Model>(this.baseUrl, data);
  }

  updateDiscussion(id: string, data: Partial<Pmdt09Model>): Observable<Pmdt09Model> {
    return this.http.put<Pmdt09Model>(`${this.baseUrl}/${id}`, data);
  }

  deleteDiscussion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
