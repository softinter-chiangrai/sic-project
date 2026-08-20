// src/app/feature/pm/dt/pmdt13/pmdt13A/pmdt13A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { PmTestCaseModel, PmTestScenarioModel } from './pmdt12A.model';

@Injectable({ providedIn: 'root' })
export class Pmdt12AService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  getTestCaseById(id: string): Observable<PmTestCaseModel> {
    return this.http.get<PmTestCaseModel>(`${this.apiBase}/api/pm/test-cases/${id}`);
  }

  getTestCases(projectId?: string | null): Observable<any> {
    let params = new HttpParams().set('page', '0').set('size', '1000');
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get(`${this.apiBase}/api/pm/test-cases/paging`, { params });
  }

  saveTestCase(data: Partial<PmTestCaseModel>): Observable<string> {
    return this.http.post<string>(`${this.apiBase}/api/pm/test-cases/save`, data);
  }

  getTestScenarios(projectId?: string | null): Observable<PmTestScenarioModel[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<PmTestScenarioModel[]>(`${this.apiBase}/api/pm/test-scenarios`, { params });
  }

  getTaskById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/api/pm/tasks/${id}`);
  }

  getSpecificationById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/api/pm/specifications/${id}`);
  }

  getTasksCombobox(projectId?: string | null): Observable<any[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<any[]>(`${this.apiBase}/api/pm/tasks/combobox`, { params });
  }

  createTask(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/api/pm/tasks`, data);
  }

  updateTask(taskId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiBase}/api/pm/tasks/${taskId}`, data);
  }

  createBugFromTest(data: any): Observable<string> {
    return this.http.post<string>(`${this.apiBase}/api/pm/bugs/save`, data);
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

