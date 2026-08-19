// src/app/feature/pm/dt/pmdt07/pmdt07A/pmdt07A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt06AModel } from './pmdt06A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt06AService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/change-requests`;

  getChangeRequestById(id: string): Observable<Pmdt06AModel> {
    return this.http.get<Pmdt06AModel>(`${this.baseUrl}/${id}`);
  }

  createChangeRequest(data: Partial<Pmdt06AModel>): Observable<Pmdt06AModel> {
    return this.http.post<Pmdt06AModel>(this.baseUrl, data);
  }

  updateChangeRequest(id: string, data: Partial<Pmdt06AModel>): Observable<Pmdt06AModel> {
    return this.http.put<Pmdt06AModel>(`${this.baseUrl}/${id}`, data);
  }
}
