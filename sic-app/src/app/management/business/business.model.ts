import { SicBaseStateModel } from '../../core/model/sic-base-model';
import { SicFromData } from '../../core/model/sic-from-data';

export interface BusinessModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface BusinessPageData {
  formData?: SicFromData<BusinessModel>;
  detail?: any;
  items?: any[];
}
