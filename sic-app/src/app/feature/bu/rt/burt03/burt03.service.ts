// src/app/feature/bu/rt/burt03/burt03.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Role {
  id: string;
  roleCode: string;
  roleName: string; // ✅ เพิ่ม – ฟิลด์ที่แปลแล้วจาก Backend
  roleNameEn: string;
  roleNameLocal: string;
  roleLevel: string;
  sortOrder: number;
  isActive: boolean;
  businessId: string;
  parentRoleId?: string;
  rowVersion?: number;
  isDelete?: boolean;
  color?: string; // ✅ เพิ่ม – สีของบทบาท
}

export interface ComboboxItem {
  value: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class burt03Service {
  private baseUrl = environment.apiBaseUrl + '/api/su/business-roles';
  private businessUrl = environment.apiBaseUrl + '/api/business';
  private lovUrl = environment.apiBaseUrl + '/api/su/business-roles/lov';

  constructor(private http: HttpClient) {}

  /** ดึงบทบาททั้งหมดของธุรกิจ */
  getRoles(businessId: string): Observable<Role[]> {
    const params = new HttpParams().set('businessId', businessId);
    return this.http.get<Role[]>(this.baseUrl, { params });
  }

  /** ดึงบทบาทเดี่ยว */
  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  /** บันทึกบทบาท (สร้าง/แก้ไข) */
  saveRole(role: Role): Observable<any> {
    return this.http.post(`${this.baseUrl}/save`, role);
  }

  /** ลบบทบาท (soft delete) */
  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** ดึงบทบาทสำหรับ Combobox (ใช้เป็น parent) */
  getComboboxParentRoles(businessId: string): Observable<ComboboxItem[]> {
    const params = new HttpParams().set('businessId', businessId);
    return this.http.get<ComboboxItem[]>(this.lovUrl, { params });
  }

  /** ดึงธุรกิจทั้งหมดที่ผู้ใช้เป็นสมาชิก */
  getMyBusinesses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.businessUrl}/my-business`);
  }
}
