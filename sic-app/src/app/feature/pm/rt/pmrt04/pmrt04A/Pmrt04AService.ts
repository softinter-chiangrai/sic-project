// ✅ แก้ไข: เปลี่ยน import ให้ถูกต้อง
import { HttpClient } from '@angular/common/http';   // ✅ ใช้จาก Angular ไม่ใช่ SignalR
import { Observable } from 'rxjs';                    // ✅ ใช้ import ปกติ (ไม่ใช่ type)

import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import type { ContractModel } from './pmrt04A.component';   // ✅ ใช้ type import สำหรับ interface ได้

@Injectable({ providedIn: 'root' })
export class Pmrt04AService {
  private apiUrl = environment.apiBaseUrl + '/api/pm/contracts';

  constructor(private http: HttpClient) {}

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

  // ✅ Combobox Project (กรองตาม customerId)
  getComboboxProject(customerId: string | null): string {
    if (!customerId) {
      return `${this.apiUrl}/combobox-project`;
    }
    return `${this.apiUrl}/combobox-project?customerId=${customerId}`;
  }
}