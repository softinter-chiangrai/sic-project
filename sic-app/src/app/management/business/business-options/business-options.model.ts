import { SicBaseStateModel } from '../../../core/model/sic-base-model';
import { SicFromData } from '../../../core/model/sic-from-data';

export interface BusinessOptionsModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface BusinessOptionsPageData {
  formData?: SicFromData<BusinessOptionsModel>;
  detail?: any;
  items?: any[];
}
