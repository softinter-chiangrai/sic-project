// src/app/feature/pm/dt/pmdt06/pmdt06.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt06Model } from './pmdt06.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt06Service {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/diagrams`;

  getDiagrams(projectId: string): Observable<Pmdt06Model[]> {
    return this.http.get<Pmdt06Model[]>(`${this.baseUrl}?projectId=${projectId}`);
  }

  getDiagramById(id: string): Observable<Pmdt06Model> {
    return this.http.get<Pmdt06Model>(`${this.baseUrl}/${id}`);
  }

  createDiagram(data: Partial<Pmdt06Model>): Observable<Pmdt06Model> {
    return this.http.post<Pmdt06Model>(this.baseUrl, data);
  }

  updateDiagram(id: string, data: Partial<Pmdt06Model>): Observable<Pmdt06Model> {
    return this.http.put<Pmdt06Model>(`${this.baseUrl}/${id}`, data);
  }

  deleteDiagram(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
