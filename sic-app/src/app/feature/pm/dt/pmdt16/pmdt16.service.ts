import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiBaseUrl } from '../../../../core/config/api.config';

export interface Pmdt16InvoiceListParams {
  page?: number;
  size?: number;
  projectId?: string | null;
  keyword?: string;
  paymentStatus?: string;
}

export interface Pmdt16InvoiceListResult {
  data: any[];
  pageable?: { totalElements?: number };
}

@Injectable({
  providedIn: 'root',
})
export class Pmdt16Service {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${apiBaseUrl}/api/pm/invoices`;

  getInvoicesPage(params: Pmdt16InvoiceListParams): Observable<Pmdt16InvoiceListResult> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('size', String(params.size ?? 10));

    if (params.projectId) {
      httpParams = httpParams.set('projectId', params.projectId);
    }
    if (params.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }
    if (params.paymentStatus && params.paymentStatus !== 'all') {
      httpParams = httpParams.set('paymentStatus', params.paymentStatus);
    }

    return this.http.get<Pmdt16InvoiceListResult>(`${this.baseUrl}/paging`, { params: httpParams });
  }

  getItemById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
