import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Business {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private readonly STORAGE_KEY = 'businessId';
  private currentBusinessId: string | null = null;
  private apiUrl = environment.apiBaseUrl + '/api/business';

  constructor(private http: HttpClient) {
    this.currentBusinessId = localStorage.getItem(this.STORAGE_KEY);
  }

  /** ดึง businessId ที่เก็บไว้ */
  getCurrentBusinessId(): string | null {
    return this.currentBusinessId;
  }

  /** ตั้งค่า businessId และเก็บลง localStorage */
  setCurrentBusinessId(id: string): void {
    this.currentBusinessId = id;
    localStorage.setItem(this.STORAGE_KEY, id);
  }

  /** ดึงรายการธุรกิจทั้งหมดของผู้ใช้ (ใช้ในหน้า pmrt29) */
  getMyBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>(`${this.apiUrl}/my-business`);
  }

  /** ตรวจสอบว่า user มี business active หรือไม่ */
  getBusinessActivation(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/activation`);
  }
}