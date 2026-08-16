// src/app/feature/pm/dt/pmdt13/pmdt13A/pmdt13A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { PmTestCaseModel, PmTestScenarioModel } from './pmdt13A.model';

@Injectable({ providedIn: 'root' })
export class Pmdt13AService {
  private http = inject(HttpClient);
  private apiBase = environment.apiBaseUrl;

  getTestCaseById(id: string): Observable<PmTestCaseModel> {
    return this.http.get<PmTestCaseModel>(`${this.apiBase}/api/pm/test-cases/${id}`);
  }

  saveTestCase(data: Partial<PmTestCaseModel>): Observable<string> {
    return this.http.post<string>(`${this.apiBase}/api/pm/test-cases/save`, data);
  }

  getTestScenarios(projectId?: string | null): Observable<PmTestScenarioModel[]> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<PmTestScenarioModel[]>(`${this.apiBase}/api/pm/test-scenarios`, { params });
  }

  createBugFromTest(data: any): Observable<string> {
    return this.http.post<string>(`${this.apiBase}/api/pm/bugs/save`, data);
  }
}
