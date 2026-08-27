import { SicBaseStateModel } from '../../core/model/sic-base-model';
import { SicFromData } from '../../core/model/sic-from-data';

export interface DashboardModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface DashboardPageData {
  formData?: SicFromData<DashboardModel>;
  detail?: any;
  items?: any[];
}
