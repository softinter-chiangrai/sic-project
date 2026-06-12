import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BusinessInfoModel, MenuItemModel, ProfileInfoModel } from './sic-sidebar.model';

@Injectable({
  providedIn: 'root',
})
export class SicSidebarService {
  private readonly http = inject(HttpClient);

  apiProfile = environment.apiBaseUrl + '/api/profile';
  apiBusiness = environment.apiBaseUrl + '/api/business';
  apiMenu = environment.apiBaseUrl + '/api/menu';

  getProfile(): Observable<ProfileInfoModel> {
    return this.http.get<ProfileInfoModel>(this.apiProfile);
  }

  getBusiness(): Observable<BusinessInfoModel> {
    return this.http.get<BusinessInfoModel>(this.apiBusiness);
  }

  getMenu(): Observable<MenuItemModel[]> {
    return this.http.get<MenuItemModel[]>(this.apiMenu);
  }

}
