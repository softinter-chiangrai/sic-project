import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { NotificationPageResponse } from '../../../../core/services/notification.service';

// NOTE: Pmrt07Model/Pmrt07Form describe a generic CRUD shape that does not match
// this page (a notification center, not a create/edit form). They are kept
// unused per project convention rather than deleted; see pmrt07.resolver.ts /
// pmrt07.component.ts for the real data flow, which is driven by
// core/services/notification.service.ts.
export interface Pmrt07Model extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Pmrt07PageData {
  /** First page (page 0) of notifications, preloaded by the resolver so the
   * component doesn't have to duplicate this fetch in ngOnInit. Further pages
   * are still fetched lazily by the component as the user scrolls. */
  initialPage: NotificationPageResponse | null;
}
