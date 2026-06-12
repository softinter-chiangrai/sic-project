import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Burt01Model } from './burt01.model';
import { environment } from '../../../../../environments/environment';

@Injectable({providedIn: 'root'})
export class Burt01Service {

  private readonly http = inject(HttpClient);

  api = environment.apiBaseUrl + '/api/bu/burt01';

  apiGetBusiness = this.api;
  apiSaveBusiness = this.api + '/save';

  apiGetComboboxTitle = this.api + '/combobox-title';
  apiGetComboboxCountry = this.api + '/combobox-country';
  apiGetComboboxProvince = this.api + '/combobox-province';
  apiGetComboboxDistrict = this.api + '/combobox-district';
  apiGetComboboxSubDistrict = this.api + '/combobox-sub-district';

  apiGetLovPersonType = this.api + '/lov-person-type';


  getBusinessInfo(): Observable<Burt01Model> {
    return this.http.get<Burt01Model>(this.apiGetBusiness);
  }

  
  save(profile: Burt01Model): Observable<Burt01Model> {
    return this.http.post<Burt01Model>(this.apiSaveBusiness, profile);
  }
  
}
