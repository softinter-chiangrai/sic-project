// src/app/feature/pm/pmrt28/pmrt28.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Role {
  id: string;
  roleCode: string;
  roleNameEn: string;
  roleNameLocal: string;
  roleLevel: string;
  sortOrder: number;
  isActive: boolean;
  businessId: string;
  parentRoleId?: string;
  rowVersion?: number;
  isDelete?: boolean;
}

export interface ComboboxItem {
  value: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class Pmrt28Service {
  private baseUrl = environment.apiBaseUrl + '/api/su/business-roles';
  private businessUrl = environment.apiBaseUrl + '/api/business';
  private lovUrl = environment.apiBaseUrl + '/api/su/business-roles/lov';

  constructor(private http: HttpClient) {}

  // ===== Roles =====
  getRoles(businessId: string): Observable<Role[]> {
    const params = new HttpParams().set('businessId', businessId);
    return this.http.get<Role[]>(this.baseUrl, { params });
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  saveRole(role: Role): Observable<any> {
    return this.http.post(`${this.baseUrl}/save`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ===== Combobox =====
  getComboboxParentRoles(businessId: string): Observable<ComboboxItem[]> {
    const params = new HttpParams().set('businessId', businessId);
    return this.http.get<ComboboxItem[]>(this.lovUrl, { params });
  }

  getMyBusinesses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.businessUrl}/my-business`);
  }
}
