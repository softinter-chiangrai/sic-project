import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateInviteRequest, InviteResponse } from './business-invite.model';

@Injectable({ providedIn: 'root' })
export class BusinessInviteService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl + '/api/business';

  getInvites(): Observable<InviteResponse[]> {
    return this.http.get<InviteResponse[]>(`${this.base}/invite`);
  }

  createInvite(req: CreateInviteRequest): Observable<string> {
    return this.http.post<string>(`${this.base}/invite`, req);
  }

  deleteInvite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/invite/${id}`);
  }

  getComboboxRoles(): Observable<{ value: string; text: string }[]> {
    return this.http.get<{ value: string; text: string }[]>(`${this.base}/combobox-role`);
  }
}
