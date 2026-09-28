import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmdt17Model extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Pmdt17PageData {
  formData?: SicFromData<Pmdt17Model>;
  detail?: any;
  items?: any[];
  /** Full keyword/status-matching ticket rows preloaded by the resolver (unfiltered by project — filtered client-side by the component). */
  initialTickets: any[];
  initialTotal: number;
  initialPage: number;
}
