// src/app/feature/bu/rt/burt02/burt02A/burt02A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Burt02AModel extends SicBaseStateModel {
  id: string;
  customerCode: string;
  customerName: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface Burt02APageData {
  customerData: SicFromData<Burt02AModel>;
}
