import { SicBaseStateModel } from '../../../core/model/sic-base-model';
import { SicFromData } from '../../../core/model/sic-from-data';

export interface ProductModel extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ProductPageData {
  formData?: SicFromData<ProductModel>;
  detail?: any;
  items?: any[];
}
