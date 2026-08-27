import { SicBaseStateModel } from '../../core/model/sic-base-model';
import { SicFromData } from '../../core/model/sic-from-data';

export interface IndexModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface IndexPageData {
  formData?: SicFromData<IndexModel>;
  detail?: any;
  items?: any[];
}
