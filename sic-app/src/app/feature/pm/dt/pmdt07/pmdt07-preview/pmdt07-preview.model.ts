import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmdt07PreviewModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Pmdt07PreviewPageData {
  formData?: SicFromData<Pmdt07PreviewModel>;
  detail?: any;
  items?: any[];
}
