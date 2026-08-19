// src/app/feature/pm/dt/pmdt08/pmdt08A/pmdt08A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt07AModel } from './pmdt07A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt07AService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/tasks`;

  getTaskById(id: string): Observable<Pmdt07AModel> {
    return this.http.get<Pmdt07AModel>(`${this.baseUrl}/${id}`);
  }

  createTask(data: Partial<Pmdt07AModel>): Observable<Pmdt07AModel> {
    return this.http.post<Pmdt07AModel>(this.baseUrl, data);
  }

  updateTask(id: string, data: Partial<Pmdt07AModel>): Observable<Pmdt07AModel> {
    return this.http.put<Pmdt07AModel>(`${this.baseUrl}/${id}`, data);
  }
}
