// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContractModel, Pmrt04AModel } from './pmrt04A.model';
import { environment } from '../../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Pmrt04AService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + '/api/pm/contracts';
  private baseUrl = `${environment.apiBaseUrl}/api/pm/contract-installments`;

  save(contract: ContractModel): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/save`, contract);
  }

  getContract(id: string): Observable<ContractModel> {
    return this.http.get<ContractModel>(`${this.apiUrl}/${id}`);
  }

  getLovContractType(): string {
    return `${this.apiUrl}/lov-contract-type`;
  }

  getLovSignStatus(): string {
    return `${this.apiUrl}/lov-sign-status`;
  }

  getComboboxProject(customerId: string | null): string {
    if (!customerId) {
      return `${this.apiUrl}/combobox-project`;
    }
    return `${this.apiUrl}/combobox-project?customerId=${customerId}`;
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
}
