// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ProjectModel } from './pmrt02A.component';

@Injectable({ providedIn: 'root' })
export class Pmrt02AService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/pm/customer-projects';

  getById(id: string): Observable<ProjectModel> {
    return this.http.get<ProjectModel>(`${this.baseUrl}/${id}`);
  }

  create(project: ProjectModel): Observable<any> {
    return this.http.post(this.baseUrl, project);
  }

  update(id: string, project: ProjectModel): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, project);
  }
}