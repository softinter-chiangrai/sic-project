// src/app/feature/pm/dt/pmdt02/pmdt02C/pmdt02C.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import type { TaskRequest, TaskResponse } from './pmdt02C.model';
@Injectable({ providedIn: 'root' })
export class Pmdt02CService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api/pm/tasks`;

  getTasksByWorkPackageId(wpId: string): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.baseUrl}/work-package/${wpId}`);
  }

  getTaskById(id: string): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.baseUrl}/${id}`);
  }

  createTask(data: TaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.baseUrl, data);
  }

  updateTask(taskId: string, data: TaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.baseUrl}/${taskId}`, data);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${taskId}`);
  }
}
