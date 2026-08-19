// src/app/feature/pm/dt/pmdt06/pmdt06.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt05Model } from './pmdt05.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt05Service {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/diagrams`;

  getDiagrams(projectId: string): Observable<Pmdt05Model[]> {
    return this.http.get<Pmdt05Model[]>(`${this.baseUrl}?projectId=${projectId}`);
  }

  getDiagramById(id: string): Observable<Pmdt05Model> {
    return this.http.get<Pmdt05Model>(`${this.baseUrl}/${id}`);
  }

  createDiagram(data: Partial<Pmdt05Model>): Observable<Pmdt05Model> {
    return this.http.post<Pmdt05Model>(this.baseUrl, data);
  }

  updateDiagram(id: string, data: Partial<Pmdt05Model>): Observable<Pmdt05Model> {
    return this.http.put<Pmdt05Model>(`${this.baseUrl}/${id}`, data);
  }

  deleteDiagram(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
