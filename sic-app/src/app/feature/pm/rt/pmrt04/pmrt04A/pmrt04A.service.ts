// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContractModel, Pmrt04AModel } from './pmrt04A.model';
import { environment } from '../../../../../../environments/environment';
import { AiAttachmentPayload } from '../../../../../core/utils/ai-attachment.util';

export interface ContractSummary {
  milestones: { total: number; completed: number };
  invoices: { total: number; pending: number };
  maTickets: { total: number; open: number };
  daysUntilExpiry: number | null;
}

@Injectable({ providedIn: 'root' })
export class Pmrt04AService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + '/api/pm/contracts';
  private baseUrl = `${environment.apiBaseUrl}/api/pm/contract-installments`;

  cancel(id: string, reason?: string): Observable<ContractModel> {
    return this.http.post<ContractModel>(`${this.apiUrl}/${id}/cancel`, { reason });
  }

  save(contract: ContractModel): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/save`, contract);
  }

  getContract(id: string): Observable<ContractModel> {
    return this.http.get<ContractModel>(`${this.apiUrl}/${id}`);
  }

  getContractSummary(id: string): Observable<ContractSummary> {
    return this.http.get<ContractSummary>(`${this.apiUrl}/${id}/summary`);
  }

  getLovContractType(): string {
    return `${this.apiUrl}/lov-contract-type`;
  }

  getLovSignStatus(): string {
    return `${this.apiUrl}/lov-sign-status`;
  }

  getComboboxProject(customerId?: string | null): string {
    if (!customerId) {
      return `${this.apiUrl}/combobox-project`;
    }
    return `${this.apiUrl}/combobox-project?customerId=${customerId}`;
  }

  getComboboxCustomer(): string {
    return `${environment.apiBaseUrl}/api/pm/customers/combobox`;
  }

  getInstallmentById(id: string): Observable<Pmrt04AModel> {
    return this.http.get<Pmrt04AModel>(`${this.baseUrl}/${id}`);
  }

  createInstallment(data: Partial<Pmrt04AModel>): Observable<Pmrt04AModel> {
    return this.http.post<Pmrt04AModel>(this.baseUrl, data);
  }

  updateInstallment(id: string, data: Partial<Pmrt04AModel>): Observable<Pmrt04AModel> {
    return this.http.put<Pmrt04AModel>(`${this.baseUrl}/${id}`, data);
  }

  generateDraft(req: {
    projectId?: string;
    customerId?: string;
    contractNo?: string;
    contractType?: string;
    contractValue?: number;
    prompt?: string;
    model?: string;
    attachments?: AiAttachmentPayload[];
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate/draft`, req);
  }
}
