import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { apiBaseUrl } from '../../../../core/config/api.config';

export interface Pmdt17TicketPage {
  data: any[];
  pageable?: { totalElements: number };
}

@Injectable({
  providedIn: 'root',
})
export class Pmdt17Service {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${apiBaseUrl}/api/pm/ma-tickets`;

  /** Real paging fetch used by the list resolver (initial page) and the grid's handleGridLoad (subsequent pages/filters). */
  getTickets(pageNumber: number, pageSize: number, keyword?: string, status?: string): Observable<Pmdt17TicketPage> {
    let params = new HttpParams().set('page', pageNumber).set('size', pageSize);
    if (keyword) params = params.set('keyword', keyword);
    if (status && status !== 'all') params = params.set('status', status);
    return this.http.get<Pmdt17TicketPage>(`${this.baseUrl}/paging`, { params });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Legacy generic stub kept for compatibility (unused by the current page, do not remove).
  getItems(): Observable<any[]> {
    return of([]);
  }
}
