// src/app/feature/pm/dt/pmdt06/pmdt06A/pmdt06A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt05AModel } from './pmdt05A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt05AService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/diagrams`;

  getDiagramById(id: string): Observable<Pmdt05AModel> {
    return this.http.get<Pmdt05AModel>(`${this.baseUrl}/${id}`);
  }

  createDiagram(data: Partial<Pmdt05AModel>): Observable<Pmdt05AModel> {
    return this.http.post<Pmdt05AModel>(this.baseUrl, data);
  }

  updateDiagram(id: string, data: Partial<Pmdt05AModel>): Observable<Pmdt05AModel> {
    return this.http.put<Pmdt05AModel>(`${this.baseUrl}/${id}`, data);
  }
}
