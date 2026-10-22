import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { PermissionService } from './permission.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Business {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  private readonly STORAGE_KEY = 'businessId';
  private currentBusinessId: string | null = null;
  private apiUrl = environment.apiBaseUrl + '/api/business';

  // ดึง PermissionService ตอนใช้ (ไม่ inject ตรง): HTTP interceptor ใช้ BusinessService อยู่ จะเกิด DI วนกัน
  private readonly injector = inject(Injector);

  constructor(private http: HttpClient) {
    this.currentBusinessId = localStorage.getItem(this.STORAGE_KEY);
  }

  /** ดึง businessId ที่เก็บไว้ */
  getCurrentBusinessId(): string | null {
    return this.currentBusinessId;
  }

  /** ตั้งค่า businessId และเก็บลง localStorage */
  setCurrentBusinessId(id: string): void {
    const changed = this.currentBusinessId !== id;
    this.currentBusinessId = id;
    localStorage.setItem(this.STORAGE_KEY, id);
    if (changed) this.injector.get(PermissionService).reload(); // สิทธิ์เป็นของแต่ละ business
  }

  /** ดึงรายการธุรกิจทั้งหมดของผู้ใช้ (ใช้ในหน้า burt04) */
  getMyBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.apiUrl}/my-business`);
  }

  /** ตรวจสอบว่า user มี business active หรือไม่ */
  getBusinessActivation(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/activation`);
  }
}
