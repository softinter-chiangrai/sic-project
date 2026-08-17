// src/app/feature/pm/dt/pmdt13/pmdt13B/pmdt13B.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { PmTestScenarioModel, PmTaskItemModel } from './pmdt13B.model';

@Injectable({ providedIn: 'root' })
export class Pmdt13BService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

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

  getTasksByProject(projectId: string): Observable<PmTaskItemModel[]> {
    return this.http.get<PmTaskItemModel[]>(`${this.apiBase}/api/pm/tasks/combobox?projectId=${projectId}`);
  }
}
