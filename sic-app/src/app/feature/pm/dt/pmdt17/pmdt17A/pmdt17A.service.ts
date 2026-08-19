import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { PmMaTicketModel } from './pmdt17A.model';

@Injectable({ providedIn: 'root' })
export class Pmdt17AService {
  private http = inject(HttpClient);

  getById(id: string): Observable<PmMaTicketModel> {
    return this.http.get<PmMaTicketModel>(`${apiBaseUrl}/api/pm/ma-tickets/${id}`);
  }

  save(data: Partial<PmMaTicketModel>): Observable<string> {
    return this.http.post<string>(`${apiBaseUrl}/api/pm/ma-tickets/save`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${apiBaseUrl}/api/pm/ma-tickets/${id}`);
  }
}
