// src/app/feature/pm/rt/pmrt04/pmrt04B/pmrt04B.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pmrt04BModel } from './pmrt04B.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmrt04BService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/contract-deliverables`;

  getDeliverableById(id: string): Observable<Pmrt04BModel> {
    return this.http.get<Pmrt04BModel>(`${this.baseUrl}/${id}`);
  }

  createDeliverable(data: Partial<Pmrt04BModel>): Observable<Pmrt04BModel> {
    return this.http.post<Pmrt04BModel>(this.baseUrl, data);
  }

  updateDeliverable(id: string, data: Partial<Pmrt04BModel>): Observable<Pmrt04BModel> {
    return this.http.put<Pmrt04BModel>(`${this.baseUrl}/${id}`, data);
  }
}
