import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PmBugModel, PmTestCaseModel, PmTestScenarioModel, PmTaskItemModel } from './pmdt10.model';

@Injectable({ providedIn: 'root' })
export class Pmdt10Service {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  // ===== BUGS =====
  getBugs(projectId?: string, keyword?: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (projectId) params = params.set('projectId', projectId);
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get(`${this.apiBase}/api/pm/bugs/paging`, { params });
  }

  getBugById(id: string): Observable<PmBugModel> {
    return this.http.get<PmBugModel>(`${this.apiBase}/api/pm/bugs/${id}`);
  }

  saveBug(data: Partial<PmBugModel>): Observable<string> {
    return this.http.post<string>(`${this.apiBase}/api/pm/bugs/save`, data);
  }

  deleteBug(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/api/pm/bugs/${id}`);
  }

  // ===== TEST CASES =====
  getTestCases(projectId?: string, keyword?: string, page = 0, size = 10): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
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

  // ===== TEST SCENARIOS =====
  getTestScenarios(projectId?: string): Observable<PmTestScenarioModel[]> {
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

  // ===== TASKS (Read / Status Update) =====
  getTasksByProject(projectId: string): Observable<PmTaskItemModel[]> {
    return this.http.get<PmTaskItemModel[]>(`${this.apiBase}/api/pm/tasks/combobox?projectId=${projectId}`);
  }

  updateTaskStatus(taskId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiBase}/api/pm/tasks/${taskId}`, { status });
  }
}
