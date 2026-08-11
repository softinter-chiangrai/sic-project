// src/app/feature/bu/rt/burt06/burt06A/burt06A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Burt06AModel } from './burt06A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Burt06AService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/approval-flows`;

  getFlow(id: string): Observable<Burt06AModel> {
    return this.http.get<Burt06AModel>(`${this.baseUrl}/${id}`);
  }

  createFlow(data: Partial<Burt06AModel>): Observable<Burt06AModel> {
    return this.http.post<Burt06AModel>(this.baseUrl, data);
  }

  updateFlow(id: string, data: Partial<Burt06AModel>): Observable<Burt06AModel> {
    return this.http.put<Burt06AModel>(`${this.baseUrl}/${id}`, data);
  }
}
