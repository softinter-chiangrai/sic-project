import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { PmInvoiceModel } from './pmdt16A.model';

@Injectable({ providedIn: 'root' })
export class Pmdt16AService {
  private http = inject(HttpClient);

  getById(id: string): Observable<PmInvoiceModel> {
    return this.http.get<PmInvoiceModel>(`${apiBaseUrl}/api/pm/invoices/${id}`);
  }

  save(data: Partial<PmInvoiceModel>): Observable<string> {
    return this.http.post<string>(`${apiBaseUrl}/api/pm/invoices/save`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${apiBaseUrl}/api/pm/invoices/${id}`);
  }

  getContractCombobox(projectId?: string): Observable<Array<{ value: string; text: string }>> {
    let httpParams = new HttpParams();
    if (projectId) {
      httpParams = httpParams.set('projectId', projectId);
    }
    return this.http.get<Array<{ value: string; text: string }>>(`${apiBaseUrl}/api/pm/contracts/combobox`, { params: httpParams });
  }
}
