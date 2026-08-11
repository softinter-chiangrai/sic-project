// src/app/feature/pm/dt/pmdt04/pmdt04A/pmdt04A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmdt04AModel } from './pmdt04A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmdt04AService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/requirements`;

  getRequirementById(id: string): Observable<Pmdt04AModel> {
    return this.http.get<Pmdt04AModel>(`${this.baseUrl}/${id}`);
  }

  createRequirement(data: Partial<Pmdt04AModel>): Observable<Pmdt04AModel> {
    return this.http.post<Pmdt04AModel>(this.baseUrl, data);
  }

  updateRequirement(id: string, data: Partial<Pmdt04AModel>): Observable<Pmdt04AModel> {
    return this.http.put<Pmdt04AModel>(`${this.baseUrl}/${id}`, data);
  }
}
