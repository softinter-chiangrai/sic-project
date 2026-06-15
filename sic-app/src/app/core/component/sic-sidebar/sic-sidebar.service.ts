import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { BusinessInfoModel, MenuActionFlags, MenuItemModel, ProfileInfoModel } from './sic-sidebar.model';

export type SidebarAction = 'back' | 'search' | 'add' | 'save' | 'print' | null;

@Injectable({
  providedIn: 'root',
})
export class SicSidebarService {


  actionSubject = new Subject<SidebarAction>();
  action$ = this.actionSubject.asObservable();

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

  triggerAction(action: SidebarAction) {
    this.actionSubject.next(action);
  }

  readonly DEFAULT_FLAGS: MenuActionFlags = {
    isBack: false, isSearch: false, isAdd: false,
    isSave: false, isRemove: false, isPrint: false,
  };

  /**
   * Recursively search menu items and return action flags
   * for the item whose path matches the given route path segment.
   * e.g. path = 'bu/burt01'
   */
  getActionFlagsForPath(items: MenuItemModel[], path: string): MenuActionFlags | null {
    for (const item of items) {
      if (item.path === path) {
        return {
          isBack: item.isBack,
          isSearch: item.isSearch,
          isAdd: item.isAdd,
          isSave: item.isSave,
          isRemove: item.isRemove,
          isPrint: item.isPrint,
        };
      }
      if (item.children?.length) {
        const found = this.getActionFlagsForPath(item.children, path);
        if (found) return found;
      }
    }
    return null;
  }

}
