import { SicBaseStateModel } from '../core/model/sic-base-model';
import { SicFromData } from '../core/model/sic-from-data';

export interface TutorialModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface TutorialPageData {
  formData?: SicFromData<TutorialModel>;
  detail?: any;
  items?: any[];
}
