// src/app/feature/pm/dt/pmdt04/pmdt04B/pmdt04B.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt04BModel } from './pmdt04B.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt04BService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/requirements`;

  getRequirementById(id: string): Observable<Pmdt04BModel> {
    return this.http.get<Pmdt04BModel>(`${this.baseUrl}/${id}`);
  }

  createRequirement(data: Partial<Pmdt04BModel>): Observable<Pmdt04BModel> {
    return this.http.post<Pmdt04BModel>(this.baseUrl, data);
  }

  updateRequirement(id: string, data: Partial<Pmdt04BModel>): Observable<Pmdt04BModel> {
    return this.http.put<Pmdt04BModel>(`${this.baseUrl}/${id}`, data);
  }
}
