// src/app/feature/pm/dt/pmdt09/pmdt09A/pmdt09A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt09AModel } from './pmdt09A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt09AService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/discussions`;

  getDiscussionById(id: string): Observable<Pmdt09AModel> {
    return this.http.get<Pmdt09AModel>(`${this.baseUrl}/${id}`);
  }

  createDiscussion(data: Partial<Pmdt09AModel>): Observable<Pmdt09AModel> {
    return this.http.post<Pmdt09AModel>(this.baseUrl, data);
  }

  updateDiscussion(id: string, data: Partial<Pmdt09AModel>): Observable<Pmdt09AModel> {
    return this.http.put<Pmdt09AModel>(`${this.baseUrl}/${id}`, data);
  }
}
