import { SicBaseStateModel } from '../../../core/model/sic-base-model';
import { SicFromData } from '../../../core/model/sic-from-data';

export interface ContactModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ContactPageData {
  formData?: SicFromData<ContactModel>;
  detail?: any;
  items?: any[];
}
