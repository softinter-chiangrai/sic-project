// src/app/feature/pm/services/task.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { TaskRequest, TaskResponse } from '../model/phase.model';


@Injectable({ providedIn: 'root' })
export class TaskService {
  private baseUrl = `/api/pm/tasks`;

  constructor(private http: HttpClient) {}

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