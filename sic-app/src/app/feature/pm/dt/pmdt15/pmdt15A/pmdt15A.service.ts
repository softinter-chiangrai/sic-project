import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { PmUserManualModel } from './pmdt15A.model';

@Injectable({ providedIn: 'root' })
export class Pmdt15AService {
  private http = inject(HttpClient);

  getPaging(params: { projectId?: string; page: number; size: number; sortBy?: string; sortDirection?: string }): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());
    if (params.projectId) {
      httpParams = httpParams.set('projectId', params.projectId);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }
    return this.http.get(`${apiBaseUrl}/api/pm/manual/paging`, { params: httpParams });
  }

  getById(id: string): Observable<PmUserManualModel> {
    return this.http.get<PmUserManualModel>(`${apiBaseUrl}/api/pm/manual/${id}`);
  }

  save(data: Partial<PmUserManualModel>): Observable<string> {
    return this.http.post<string>(`${apiBaseUrl}/api/pm/manual/save`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${apiBaseUrl}/api/pm/manual/${id}`);
  }
}
