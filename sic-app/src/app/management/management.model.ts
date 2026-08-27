import { SicBaseStateModel } from '../core/model/sic-base-model';
import { SicFromData } from '../core/model/sic-from-data';

export interface ManagementModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ManagementPageData {
  formData?: SicFromData<ManagementModel>;
  detail?: any;
  items?: any[];
}
