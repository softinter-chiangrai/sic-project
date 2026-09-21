// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ProjectModel } from './pmrt02A.model';
import { AiAttachmentPayload } from '../../../../../core/utils/ai-attachment.util';


@Injectable({ providedIn: 'root' })
export class Pmrt02AService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/pm/customer-projects';

  getById(id: string): Observable<ProjectModel> {
    return this.http.get<ProjectModel>(`${this.baseUrl}/${id}`);
  }

  getProject(id: string): Observable<ProjectModel> {
    return this.getById(id);
  }

  create(project: ProjectModel): Observable<any> {
    return this.http.post(this.baseUrl, project);
  }

  update(id: string, project: ProjectModel): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, project);
  }

  generateDraft(req: {
    customerId?: string;
    projectCode?: string;
    projectName?: string;
    prompt?: string;
    model?: string;
    attachments?: AiAttachmentPayload[];
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/generate/draft`, req);
  }
}