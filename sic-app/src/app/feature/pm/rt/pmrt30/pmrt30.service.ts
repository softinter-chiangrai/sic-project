// src/app/feature/pm/rt/pmrt30/pmrt30.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface Program {
  id?: string;
  parentProgramId?: string | null;
  parentProgramCode?: string;
  programCode: string;
  programName: string;          // ✅ ฟิลด์ที่แปลแล้ว
  programNameEn: string;
  programNameLocal: string;
  programIcon?: string;
  routePath?: string;
  sortOrder?: number;
  isActive: boolean;
  rowVersion?: number;
}

export interface RolePermission {
  roleId: string;
  level: string;
}

export interface CreateProgramWithPermissionsRequest {
  parentProgramId?: string | null;
  programCode: string;
  programNameEn: string;
  programNameLocal: string;
  programIcon?: string;
  routePath?: string;
  sortOrder?: number;
  isActive: boolean;
  rolePermissions: RolePermission[];
}

@Injectable({ providedIn: 'root' })
export class Pmrt30Service {
  private baseUrl = `${environment.apiBaseUrl}/api/su/programs`;
  private rolesUrl = `${environment.apiBaseUrl}/api/su/business-roles`;
  private roleProgramsUrl = `${environment.apiBaseUrl}/api/su/business-role-programs`;

  constructor(private http: HttpClient) {}

  getPrograms(): Observable<Program[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((programs) =>
        programs.map((p) => ({
          id: p.id,
          parentProgramId: p.parentProgramId,
          parentProgramCode: p.parentProgramCode,
          programCode: p.programCode,
          programName: p.programName,          // ✅ เพิ่มตรงนี้
          programNameEn: p.programNameEn,
          programNameLocal: p.programNameLocal,
          programIcon: p.programIcon,
          routePath: p.routePath,
          sortOrder: p.sortOrder,
          isActive: p.active ?? false,
          rowVersion: p.rowVersion,
        })),
      ),
    );
  }

  getProgram(id: string): Observable<Program> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map((p) => ({
        id: p.id,
        parentProgramId: p.parentProgramId,
        parentProgramCode: p.parentProgramCode,
        programCode: p.programCode,
        programName: p.programName,          // ✅ เพิ่มตรงนี้
        programNameEn: p.programNameEn,
        programNameLocal: p.programNameLocal,
        programIcon: p.programIcon,
        routePath: p.routePath,
        sortOrder: p.sortOrder,
        isActive: p.active ?? false,
        rowVersion: p.rowVersion,
      })),
    );
  }

  saveProgram(program: Program): Observable<{ id: string }> {
    const payload = {
      id: program.id,
      parentProgramId: program.parentProgramId,
      programCode: program.programCode,
      programNameEn: program.programNameEn,
      programNameLocal: program.programNameLocal,
      programIcon: program.programIcon,
      routePath: program.routePath,
      sortOrder: program.sortOrder,
      isActive: program.isActive,
      rowVersion: program.rowVersion,
    };
    return this.http.post<{ id: string }>(`${this.baseUrl}/save`, payload);
  }

  createWithPermissions(request: CreateProgramWithPermissionsRequest): Observable<{ id: string }> {
    const payload = {
      parentProgramId: request.parentProgramId,
      programCode: request.programCode,
      programNameEn: request.programNameEn,
      programNameLocal: request.programNameLocal,
      programIcon: request.programIcon,
      routePath: request.routePath,
      sortOrder: request.sortOrder,
      isActive: request.isActive,
      rolePermissions: request.rolePermissions,
    };
    return this.http.post<{ id: string }>(`${this.baseUrl}/create-with-permissions`, payload);
  }

  deleteProgram(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getRoles(businessId: string): Observable<any[]> {
    const params = new HttpParams().set('businessId', businessId);
    return this.http.get<any[]>(this.rolesUrl, { params });
  }

  getRoleProgramsByProgram(programId: string): Observable<any[]> {
    const params = new HttpParams().set('programId', programId);
    return this.http.get<any[]>(this.roleProgramsUrl, { params });
  }

  bulkSaveRolePermissions(programId: string, modules: any[]): Observable<any> {
    return this.http.post(`${this.roleProgramsUrl}/bulk-save`, {
      roleId: null,
      modules: modules.map((m) => ({
        ...m,
        businessRoleId: m.businessRoleId,
        programId: programId,
      })),
    });
  }

  getPermissionLevels(): { value: string; label: string }[] {
    return [
      { value: 'Full', label: 'เต็มรูปแบบ (Full)' },
      { value: 'Edit', label: 'แก้ไข/เพิ่ม (Edit)' },
      { value: 'Approve', label: 'อนุมัติ (Approve)' },
      { value: 'View', label: 'ดูอย่างเดียว (View)' },
      { value: 'None', label: 'ไม่มีสิทธิ์ (None)' },
    ];
  }
}