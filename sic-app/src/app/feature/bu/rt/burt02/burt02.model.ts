// src/app/feature/bu/rt/burt02/burt02.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Burt02Model extends SicBaseStateModel {
  id: string;
  customerCode: string;
  customerName: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface Burt02PageData {
  customerData: SicFromData<Burt02Model>;
}
