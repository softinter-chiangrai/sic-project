// src/app/feature/bu/rt/burt04/burt04.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

import { TeamMember, User, ComboboxRole } from './burt04.model';
import { PaginationResponse } from '../../../../core/model/pagination.model';


@Injectable({
  providedIn: 'root',
})
export class burt04Service {
  private memberApiUrl = environment.apiBaseUrl + '/api/su-user-business/members';
  private businessApiUrl = environment.apiBaseUrl + '/api/business';
  private userApiUrl = environment.apiBaseUrl + '/api/users';
  private roleComboboxUrl = environment.apiBaseUrl + '/api/business/combobox-role';

  private storageKey = 'businessId';
  private currentBusinessId: string | null = null;

  constructor(private http: HttpClient) {
    this.currentBusinessId = localStorage.getItem(this.storageKey);
  }

  setBusinessId(id: string): void {
    this.currentBusinessId = id;
    localStorage.setItem(this.storageKey, id);
  }

  getBusinessId(): string | null {
    return this.currentBusinessId;
  }

  getMembers(businessId: string, page: number, size: number): Observable<PaginationResponse<TeamMember>> {
    const params = new HttpParams()
      .set('businessId', businessId)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginationResponse<TeamMember>>(this.memberApiUrl, { params });
  }

  addMember(businessId: string, userId: string, roleIds: string[]): Observable<TeamMember> {
    let params = new HttpParams().set('businessId', businessId).set('userId', userId);
    roleIds.forEach((id) => {
      params = params.append('roleIds', id);
    });
    return this.http.post<TeamMember>(this.memberApiUrl, null, { params });
  }

  getMemberById(memberId: string): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.memberApiUrl}/${memberId}`);
  }

  // ✅ รับ roleIds เป็น array
  updateMember(memberId: string, roleIds: string[], isActive: boolean): Observable<TeamMember> {
    let params = new HttpParams().set('isActive', String(isActive));
    roleIds.forEach((id) => {
      params = params.append('roleIds', id);
    });
    return this.http.put<TeamMember>(`${this.memberApiUrl}/${memberId}`, null, { params });
  }

  deleteMember(memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.memberApiUrl}/${memberId}`);
  }

  getMyBusinesses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.businessApiUrl}/my-business`);
  }

  getBusinessActivation(): Observable<boolean> {
    return this.http.get<boolean>(`${this.businessApiUrl}/activation`);
  }

  getAvailableUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.userApiUrl}/available`);
  }

  getComboboxRoles(): Observable<ComboboxRole[]> {
    return this.http.get<ComboboxRole[]>(this.roleComboboxUrl);
  }
}
