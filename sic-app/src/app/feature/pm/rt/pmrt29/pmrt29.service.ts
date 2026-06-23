// src/app/core/services/pmrt29.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ===== Interfaces =====
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  roleInTeam: string;
  isActive: boolean;
  joinedDate: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class Pmrt29Service {
  // ===== API Endpoints =====
  private teamApiUrl = '/api/su-team';
  private userApiUrl = '/api/users';

  // ===== Business ID (เก็บใน localStorage) =====
  private storageKey = 'businessId';
  private currentBusinessId: string | null = null;

  constructor(private http: HttpClient) {
    this.currentBusinessId = localStorage.getItem(this.storageKey);
  }

  // ============================================================
  //  1. BUSINESS ID MANAGEMENT
  // ============================================================
  setBusinessId(id: string): void {
    this.currentBusinessId = id;
    localStorage.setItem(this.storageKey, id);
  }

  getBusinessId(): string | null {
    return this.currentBusinessId;
  }

  // ============================================================
  //  2. TEAM MEMBER API (เรียก Backend จริง)
  // ============================================================

  /** GET /api/su-team/members?businessId=xxx&page=0&size=10 */
  getMembers(businessId: string, page: number, size: number): Observable<Page<TeamMember>> {
    const params = new HttpParams()
      .set('businessId', businessId)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<TeamMember>>(`${this.teamApiUrl}/members`, { params });
  }

  /** POST /api/su-team/members?businessId=xxx&userId=yyy&roleInTeam=zzz */
  addMember(businessId: string, userId: string, roleInTeam: string = 'MEMBER'): Observable<TeamMember> {
    const params = new HttpParams()
      .set('businessId', businessId)
      .set('userId', userId)
      .set('roleInTeam', roleInTeam);
    return this.http.post<TeamMember>(`${this.teamApiUrl}/members`, null, { params });
  }

  /** GET /api/su-team/members/{memberId} */
  getMemberById(memberId: string): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.teamApiUrl}/members/${memberId}`);
  }

  /** PUT /api/su-team/members/{memberId}?roleInTeam=zzz&isActive=true */
  updateMember(memberId: string, roleInTeam: string, isActive: boolean): Observable<TeamMember> {
    const params = new HttpParams()
      .set('roleInTeam', roleInTeam)
      .set('isActive', String(isActive));
    return this.http.put<TeamMember>(`${this.teamApiUrl}/members/${memberId}`, null, { params });
  }

  /** DELETE /api/su-team/members/{memberId} */
  deleteMember(memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.teamApiUrl}/members/${memberId}`);
  }

  // ============================================================
  //  3. USER API (ดึงรายชื่อผู้ใช้ทั้งหมด)
  // ============================================================

  /** GET /api/users/available */
  getAvailableUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.userApiUrl}/available`);
  }
}