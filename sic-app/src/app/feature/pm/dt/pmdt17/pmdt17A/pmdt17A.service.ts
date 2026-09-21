import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { PmMaTicketModel } from './pmdt17A.model';
import { AiAttachmentPayload } from '../../../../../core/utils/ai-attachment.util';

@Injectable({ providedIn: 'root' })
export class Pmdt17AService {
  private http = inject(HttpClient);

  getById(id: string): Observable<PmMaTicketModel> {
    return this.http.get<PmMaTicketModel>(`${apiBaseUrl}/api/pm/ma-tickets/${id}`);
  }

  getContractCombobox(projectId?: string): Observable<Array<{ value: string; text: string }>> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return this.http.get<Array<{ value: string; text: string }>>(`${apiBaseUrl}/api/pm/contracts/combobox`, { params });
  }

  getContractById(id: string): Observable<any> {
    return this.http.get<any>(`${apiBaseUrl}/api/pm/contracts/${id}`);
  }

  save(data: Partial<PmMaTicketModel>): Observable<string> {
    return this.http.post<string>(`${apiBaseUrl}/api/pm/ma-tickets/save`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${apiBaseUrl}/api/pm/ma-tickets/${id}`);
  }

  generateDraft(data: { projectId?: string; title?: string; ticketType?: string; priority?: string; prompt?: string; model?: string; attachments?: AiAttachmentPayload[] }): Observable<any> {
    return this.http.post<any>(`${apiBaseUrl}/api/pm/ma-tickets/generate/draft`, data);
  }
}
