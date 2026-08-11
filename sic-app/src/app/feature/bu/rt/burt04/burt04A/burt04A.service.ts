// src/app/feature/bu/rt/burt04/burt04A/burt04A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Burt04AModel } from './burt04A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Burt04AService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/su-user-business/members`;

  getMemberById(id: string): Observable<Burt04AModel> {
    return this.http.get<Burt04AModel>(`${this.baseUrl}/${id}`);
  }

  addMember(businessId: string, userId: string, roleIds: string[]): Observable<Burt04AModel> {
    let params = new HttpParams().set('businessId', businessId).set('userId', userId);
    roleIds.forEach((id) => {
      params = params.append('roleIds', id);
    });
    return this.http.post<Burt04AModel>(this.baseUrl, null, { params });
  }

  updateMember(memberId: string, roleIds: string[], isActive: boolean): Observable<Burt04AModel> {
    let params = new HttpParams().set('isActive', String(isActive));
    roleIds.forEach((id) => {
      params = params.append('roleIds', id);
    });
    return this.http.put<Burt04AModel>(`${this.baseUrl}/${memberId}`, null, { params });
  }
}
