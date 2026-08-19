// src/app/feature/pm/dt/pmdt08/pmdt08A/pmdt08A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt08AModel } from './pmdt08A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt08AService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/discussions`;

  getDiscussionById(id: string): Observable<Pmdt08AModel> {
    return this.http.get<Pmdt08AModel>(`${this.baseUrl}/${id}`);
  }

  createDiscussion(data: Partial<Pmdt08AModel>): Observable<Pmdt08AModel> {
    return this.http.post<Pmdt08AModel>(this.baseUrl, data);
  }

  updateDiscussion(id: string, data: Partial<Pmdt08AModel>): Observable<Pmdt08AModel> {
    return this.http.put<Pmdt08AModel>(`${this.baseUrl}/${id}`, data);
  }
}
