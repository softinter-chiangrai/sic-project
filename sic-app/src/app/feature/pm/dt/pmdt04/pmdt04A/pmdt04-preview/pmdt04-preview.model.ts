import { SicBaseStateModel } from '../../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../../core/model/sic-from-data';

export interface Pmdt04PreviewModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Pmdt04PreviewPageData {
  formData?: SicFromData<Pmdt04PreviewModel>;
  detail?: any;
  items?: any[];
}
