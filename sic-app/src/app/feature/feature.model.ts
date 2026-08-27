import { SicBaseStateModel } from '../core/model/sic-base-model';
import { SicFromData } from '../core/model/sic-from-data';

export interface FeatureModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface FeaturePageData {
  formData?: SicFromData<FeatureModel>;
  detail?: any;
  items?: any[];
}
