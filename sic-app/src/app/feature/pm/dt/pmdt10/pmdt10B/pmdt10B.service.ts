// src/app/feature/pm/dt/pmdt12/pmdt12.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import type { TaskRequest, TaskResponse, SpecificationSummary } from './pmdt10B.model';

@Injectable({ providedIn: 'root' })
export class Pmdt10BService {
  private http = inject(HttpClient);
  private taskUrl = `${environment.apiBaseUrl}/api/pm/tasks`;
  private projectUrl = `${environment.apiBaseUrl}/api/pm/projects`;
  private specUrl = `${environment.apiBaseUrl}/api/pm/specifications`;
  private phaseUrl = `${environment.apiBaseUrl}/api/pm/phases`;

  // ===== Tasks =====
  getTasksByProjectId(projectId: string): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.projectUrl}/${projectId}/tasks`);
  }

  getTasksByWorkPackageId(wpId: string): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.taskUrl}/work-package/${wpId}`);
  }

  getTaskById(id: string): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.taskUrl}/${id}`);
  }

  createTask(data: TaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.taskUrl, data);
  }

  updateTask(taskId: string, data: TaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.taskUrl}/${taskId}`, data);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.taskUrl}/${taskId}`);
  }

  // ===== Specifications =====
  getSpecificationsByProject(projectId: string): Observable<SpecificationSummary[]> {
    const params = new HttpParams().set('page', '0').set('size', '100');
    return this.http.get<any>(this.specUrl, { params }).pipe(
      map((res) => {
        const list: any[] = res?.data || res?.content || (Array.isArray(res) ? res : []);
        const targetProjId = projectId ? String(projectId).toLowerCase() : null;
        return list
          .filter((item: any) => {
            if (item.isDelete) return false;
            if (!targetProjId) return true;
            const itemProjId = item.projectId
              ? String(item.projectId).toLowerCase()
              : item.project?.id
              ? String(item.project.id).toLowerCase()
              : null;
            return !itemProjId || itemProjId === targetProjId;
          })
          .map((item: any) => ({
            id: item.id,
            code: item.specificationCode || item.specCode || 'SPEC',
            title: item.title || item.specificationCode || 'Specification',
            specificationType: item.specificationType || 'Functional',
            status: item.status || 'Draft',
          }));
      })
    );
  }

  // ===== Phases & WorkPackages =====
  getPhasesByProject(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.projectUrl}/${projectId}/phases`);
  }

  // ===== Members Combobox =====
  getMembers(businessId: string): Observable<{ value: string; text: string }[]> {
    return this.http
      .get<any>(`${environment.apiBaseUrl}/api/business/combobox-members?businessId=${businessId}&pageSize=100`)
      .pipe(
        map((res) => {
          const list: any[] = res?.data || res?.content || (Array.isArray(res) ? res : []);
          return list.map((m: any) => ({
            value: m.value || m.id,
            text: m.text || m.name || m.userName || m.fullName,
          }));
        })
      );
  }

  getMembersApiUrl(businessId: string): string {
    return `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${businessId}`;
  }
}
