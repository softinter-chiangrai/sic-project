import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface TeamMember {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  roleCode: string;
  roleName: string;
  isActive: boolean;
  isDefault: boolean;
  createdDate: string;
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
  private memberApiUrl = environment.apiBaseUrl + '/api/su-user-business/members';
  private businessApiUrl = environment.apiBaseUrl + '/api/business';
  private userApiUrl = environment.apiBaseUrl + '/api/users';

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

  getMembers(businessId: string, page: number, size: number): Observable<Page<TeamMember>> {
    const params = new HttpParams()
      .set('businessId', businessId)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<TeamMember>>(this.memberApiUrl, { params });
  }

  addMember(businessId: string, userId: string, roleId: string): Observable<TeamMember> {
    const params = new HttpParams()
      .set('businessId', businessId)
      .set('userId', userId)
      .set('roleId', roleId);
    return this.http.post<TeamMember>(this.memberApiUrl, null, { params });
  }

  getMemberById(memberId: string): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.memberApiUrl}/${memberId}`);
  }

  updateMember(memberId: string, roleId: string, isActive: boolean): Observable<TeamMember> {
    const params = new HttpParams()
      .set('roleId', roleId)
      .set('isActive', String(isActive));
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
}