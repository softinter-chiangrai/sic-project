import { SicBaseStateModel } from '../../../core/model/sic-base-model';
import { SicFromData } from '../../../core/model/sic-from-data';

export interface BlogModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface BlogPageData {
  formData?: SicFromData<BlogModel>;
  detail?: any;
  items?: any[];
}
