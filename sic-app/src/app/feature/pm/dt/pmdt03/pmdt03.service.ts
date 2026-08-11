// src/app/feature/pm/dt/pmdt03/pmdt03.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt03Model } from './pmdt03.model';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt03Service {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/approvals`;

  getApprovals(): Observable<Pmdt03Model[]> {
    return this.http.get<Pmdt03Model[]>(this.baseUrl);
  }

  getApprovalById(id: string): Observable<Pmdt03Model> {
    return this.http.get<Pmdt03Model>(`${this.baseUrl}/${id}`);
  }

  createApproval(data: Partial<Pmdt03Model>): Observable<Pmdt03Model> {
    return this.http.post<Pmdt03Model>(this.baseUrl, data);
  }

  updateApproval(id: string, data: Partial<Pmdt03Model>): Observable<Pmdt03Model> {
    return this.http.put<Pmdt03Model>(`${this.baseUrl}/${id}`, data);
  }

  deleteApproval(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
