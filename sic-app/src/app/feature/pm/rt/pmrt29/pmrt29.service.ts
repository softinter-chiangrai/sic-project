import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';


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
  private teamApiUrl = environment.apiBaseUrl + '/api/su-team';
  private businessApiUrl = environment.apiBaseUrl + '/api/business';
  private userApiUrl = environment.apiBaseUrl + '/api/users';

  private storageKey = 'businessId';
  private currentBusinessId: string | null = null;

  constructor(private http: HttpClient) {
    this.currentBusinessId = localStorage.getItem(this.storageKey);
  }

  // ===== Business ID =====
  setBusinessId(id: string): void {
    this.currentBusinessId = id;
    localStorage.setItem(this.storageKey, id);
  }

  getBusinessId(): string | null {
    return this.currentBusinessId;
  }

  // ===== Team Members API =====
  getMembers(businessId: string, page: number, size: number): Observable<Page<TeamMember>> {
    const params = new HttpParams()
      .set('businessId', businessId)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<TeamMember>>(`${this.teamApiUrl}/members`, { params });
  }

  addMember(businessId: string, userId: string, roleInTeam: string = 'MEMBER'): Observable<TeamMember> {
    const params = new HttpParams()
      .set('businessId', businessId)
      .set('userId', userId)
      .set('roleInTeam', roleInTeam);
    return this.http.post<TeamMember>(`${this.teamApiUrl}/members`, null, { params });
  }

  getMemberById(memberId: string): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.teamApiUrl}/members/${memberId}`);
  }

  updateMember(memberId: string, roleInTeam: string, isActive: boolean): Observable<TeamMember> {
    const params = new HttpParams()
      .set('roleInTeam', roleInTeam)
      .set('isActive', String(isActive));
    return this.http.put<TeamMember>(`${this.teamApiUrl}/members/${memberId}`, null, { params });
  }

  deleteMember(memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.teamApiUrl}/members/${memberId}`);
  }

  // ===== Business Info (เพื่อดึง businessId ถ้ายังไม่มี) =====
  getMyBusinesses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.businessApiUrl}/my-business`);
  }

  getBusinessActivation(): Observable<boolean> {
    return this.http.get<boolean>(`${this.businessApiUrl}/activation`);
  }

  // ===== Users (สำหรับ combobox) =====
  getAvailableUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.userApiUrl}/available`);
  }
}