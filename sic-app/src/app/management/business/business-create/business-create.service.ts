import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BusinessCreateModel } from './business-create.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BusinessCreateService {

  private readonly http = inject(HttpClient);

  apiBusiness = environment.apiBaseUrl + '/api/business';

  apiGetLovPersonType = this.apiBusiness + '/lov-person-type';

  apiGetComboboxTitle = this.apiBusiness + '/combobox-title';
  apiGetComboboxCountry = this.apiBusiness + '/combobox-country';
  apiGetComboboxProvince = this.apiBusiness + '/combobox-province';
  apiGetComboboxDistrict = this.apiBusiness + '/combobox-district';
  apiGetComboboxSubDistrict = this.apiBusiness + '/combobox-sub-district';
  
  apiSaveBusiness = this.apiBusiness + '/save';

  save(business: BusinessCreateModel): Observable<string> {
    return this.http.post<string>(this.apiSaveBusiness, business);
  }


}
