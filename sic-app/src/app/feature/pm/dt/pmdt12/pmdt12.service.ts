// src/app/feature/pm/dt/pmdt13/pmdt13.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PmTestCaseModel, PmTestScenarioModel } from './pmdt12.model';

@Injectable({ providedIn: 'root' })
export class Pmdt12Service {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  getTestCases(projectId?: string | null, keyword?: string | null, page = 0, size = 10, sortBy = 'createdDate', sortDirection = 'DESC'): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (projectId) params = params.set('projectId', projectId);
    if (keyword) params = params.set('keyword', keyword);

    return this.http.get(`${this.apiBase}/api/pm/test-cases/paging`, { params });
  }

  getTestCaseById(id: string): Observable<PmTestCaseModel> {
    return this.http.get<PmTestCaseModel>(`${this.apiBase}/api/pm/test-cases/${id}`);
  }

  saveTestCase(data: Partial<PmTestCaseModel>): Observable<string> {
    return this.http.post<string>(`${this.apiBase}/api/pm/test-cases/save`, data);
  }

  deleteTestCase(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/api/pm/test-cases/${id}`);
  }

  getTaskById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/api/pm/tasks/${id}`);
  }

  getTasksByProjectId(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/api/pm/projects/${projectId}/tasks`);
  }

  getTasksByWorkPackageId(wpId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/api/pm/tasks/work-package/${wpId}`);
  }

  createTask(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/api/pm/tasks`, data);
  }

  updateTask(taskId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiBase}/api/pm/tasks/${taskId}`, data);
  }

  getTestScenarios(projectId?: string | null): Observable<PmTestScenarioModel[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<PmTestScenarioModel[]>(`${this.apiBase}/api/pm/test-scenarios`, { params });
  }

  getTestScenarioById(id: string): Observable<PmTestScenarioModel> {
    return this.http.get<PmTestScenarioModel>(`${this.apiBase}/api/pm/test-scenarios/${id}`);
  }

  saveTestScenario(data: Partial<PmTestScenarioModel>): Observable<string> {
    return this.http.post<string>(`${this.apiBase}/api/pm/test-scenarios/save`, data);
  }

  deleteTestScenario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/api/pm/test-scenarios/${id}`);
  }

  generateDraft(request: {
    projectId?: string;
    taskId?: string;
    requirementId?: string;
    scenarioId?: string;
    title?: string;
    prompt?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/api/pm/test-cases/generate/draft`, request);
  }
}
