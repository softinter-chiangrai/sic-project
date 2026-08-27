import { SicBaseStateModel } from '../../core/model/sic-base-model';
import { SicFromData } from '../../core/model/sic-from-data';

export interface SignUpModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface SignUpPageData {
  formData?: SicFromData<SignUpModel>;
  detail?: any;
  items?: any[];
}
