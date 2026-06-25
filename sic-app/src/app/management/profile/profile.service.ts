import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmailVerifyModel, ProfileModel } from './profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly apiProfile = `${this.apiBaseUrl}/api/profile`;

  // ✅ Combobox APIs
  readonly apiGetComboboxTitle = `${this.apiProfile}/combobox-title`;
  readonly apiGetComboboxCountry = `${this.apiProfile}/combobox-country`;
  readonly apiGetComboboxProvince = `${this.apiProfile}/combobox-province`;
  readonly apiGetComboboxDistrict = `${this.apiProfile}/combobox-district`;
  readonly apiGetComboboxSubDistrict = `${this.apiProfile}/combobox-sub-district`;

  // ✅ Profile APIs
  readonly apiGetMe = `${this.apiProfile}/me`;
  readonly apiGetMailCheck = `${this.apiProfile}/mail-check`;
  readonly apiPostSendVerify = `${this.apiProfile}/send-verify`;
  readonly apiSaveProfile = `${this.apiProfile}/save`;

  // ✅ New Check APIs (ต้องมี Backend endpoint)
  readonly apiGetPhoneCheck = `${this.apiProfile}/phone-check`;
  readonly apiGetTaxCheck = `${this.apiProfile}/tax-check`;

  // ===== GET Profile =====
  getProfile(): Observable<ProfileModel> {
    return this.http.get<ProfileModel>(this.apiGetMe);
  }

  // ===== Check Email Duplicate =====
  checkEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(this.apiGetMailCheck, { params: { email } });
  }

  // ===== Check Phone Duplicate =====
  checkPhone(phone: string): Observable<boolean> {
    return this.http.get<boolean>(this.apiGetPhoneCheck, { params: { phone } });
  }

  // ===== Check Tax ID Duplicate =====
  checkTaxId(taxId: string): Observable<boolean> {
    return this.http.get<boolean>(this.apiGetTaxCheck, { params: { taxId } });
  }

  // ===== Send Verification Email =====
  sendVerifyToken(email: string): Observable<EmailVerifyModel> {
    return this.http.post<EmailVerifyModel>(this.apiPostSendVerify, {
      recipient: email,
      verifyType: 'Email',
    });
  }

  // ===== Save Profile =====
  save(profile: ProfileModel): Observable<ProfileModel> {
    return this.http.post<ProfileModel>(this.apiSaveProfile, profile);
  }
}
