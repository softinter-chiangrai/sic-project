// change-request.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface LovOption {
  value: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ChangeRequestService {
  private http = inject(HttpClient);

  getChangeReasons(keyword?: string, pageNo = 1, pageSize = 10): Observable<LovOption[]> {
    let url = '/api/db/parameter/lov?group=PM&parameterCode=CHANGE_REASON';
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    url += `&pageNumber=${pageNo}&pageSize=${pageSize}`;
    return this.http.get<any[]>(url).pipe(
      map(data => data.map(item => ({ value: item.value ?? item.id, text: item.text ?? item.name })))
    );
  }

  getAssignees(businessId: string, keyword?: string, pageNo = 1, pageSize = 10): Observable<LovOption[]> {
    let url = `/api/business/combobox-members?businessId=${businessId}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    url += `&pageNumber=${pageNo}&pageSize=${pageSize}`;
    return this.http.get<any[]>(url).pipe(
      map(data => data.map(item => ({ value: item.value ?? item.id, text: item.text ?? item.name })))
    );
  }
}