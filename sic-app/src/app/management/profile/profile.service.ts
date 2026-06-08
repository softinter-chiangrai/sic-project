import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // เพิ่ม import map
import { EmailVerifyModel, ProfileModel } from './profile.model';
import { environment } from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class ProfileService {

  private readonly http = inject(HttpClient);

  apiProfile = environment.apiBaseUrl + '/api/profile';

  apiGetComboboxTitle = this.apiProfile + '/combobox-title';
  apiGetComboboxCountry = this.apiProfile + '/combobox-country';
  apiGetComboboxProvince = this.apiProfile + '/combobox-province';
  apiGetComboboxDistrict = this.apiProfile + '/combobox-district';
  apiGetComboboxSubDistrict = this.apiProfile + '/combobox-sub-district';
  apiGetMe = this.apiProfile + '/me';
  apiGetMailCheck = this.apiProfile + '/mail-check';
  apiPostSendVerify = this.apiProfile + '/send-verify';
  apiSaveProfile = this.apiProfile + '/save';

  getProfile(): Observable<ProfileModel> {
    return this.http.get<ProfileModel>(this.apiGetMe);
  }
  
  checkEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(this.apiGetMailCheck, { params: { email } });
  }

  // แก้ไข method นี้
  sendVerifyToken(email: string): Observable<EmailVerifyModel> {
    return this.http.post<{ data: EmailVerifyModel }>(this.apiPostSendVerify, { recipient : email, verifyType: 'Email' })
      .pipe(map(response => response.data));
  }
  
  save(profile: ProfileModel): Observable<ProfileModel> {
    return this.http.post<ProfileModel>(this.apiSaveProfile, profile);
  }
  
}