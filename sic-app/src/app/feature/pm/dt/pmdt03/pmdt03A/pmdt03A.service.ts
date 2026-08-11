// src/app/feature/pm/dt/pmdt03/pmdt03A/pmdt03A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt03AModel } from './pmdt03A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt03AService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/approvals`;

  getApprovalDetail(id: string): Observable<Pmdt03AModel> {
    return this.http.get<Pmdt03AModel>(`${this.baseUrl}/${id}`);
  }

  submitApproval(data: Partial<Pmdt03AModel>): Observable<Pmdt03AModel> {
    return this.http.post<Pmdt03AModel>(`${this.baseUrl}/submit`, data);
  }
}
