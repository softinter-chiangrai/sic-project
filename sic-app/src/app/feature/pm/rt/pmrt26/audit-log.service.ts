import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface AuditLog {
  id: string;
  userId?: string;
  username: string;
  userFullname?: string;
  user?: string;
  action: string;
  module: string;
  description: string;
  targetType?: string;
  targetId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: string;
  createdDate?: string;
  status: 'Success' | 'Failed';
  details?: string;
}

export interface AuditLogPageResponse {
  content: AuditLog[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + '/api/su/audit-logs';

  getLogs(queryParams: {
    searchTerm?: string;
    module?: string;
    status?: string;
    username?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Observable<AuditLogPageResponse> {
    let params = new HttpParams();

    if (queryParams.searchTerm) params = params.set('searchTerm', queryParams.searchTerm);
    if (queryParams.module && queryParams.module !== 'all') params = params.set('module', queryParams.module);
    if (queryParams.status && queryParams.status !== 'all') params = params.set('status', queryParams.status);
    if (queryParams.username && queryParams.username !== 'all') params = params.set('username', queryParams.username);
    if (queryParams.page) params = params.set('page', queryParams.page.toString());
    if (queryParams.size) params = params.set('size', queryParams.size.toString());
    if (queryParams.sortBy) params = params.set('sortBy', queryParams.sortBy);
    if (queryParams.sortDir) params = params.set('sortDir', queryParams.sortDir);

    return this.http.get<AuditLogPageResponse>(this.apiUrl, { params });
  }

  recordLog(data: Partial<AuditLog>): Observable<void> {
    return this.http.post<void>(this.apiUrl, data);
  }
}
