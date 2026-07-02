// src/app/feature/pm/rt/pmrt04/pmrt04.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ComboboxItem {
  value: string;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class Pmrt04Service {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/api/pm/contracts';

  private getBusinessId(): string {
    return localStorage.getItem('businessId') || '';
  }

  /** ดึงสัญญาสำหรับ combobox โดยสามารถกรองตาม customerId */
  getComboboxContracts(customerId?: string): Observable<ComboboxItem[]> {
    let params = new HttpParams().set('businessId', this.getBusinessId());
    if (customerId) {
      params = params.set('customerId', customerId);
    }
    return this.http.get<ComboboxItem[]>(`${this.baseUrl}/combobox`, { params });
  }
}