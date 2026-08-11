// src/app/feature/bu/rt/burt06/burt06A/burt06A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Burt06AModel extends SicBaseStateModel {
  id: string;
  flowCode: string;
  flowName: string;
  documentType: string;
  approvalMode: string;
  description?: string;
  active: boolean;
}

export interface Burt06APageData {
  flowData: SicFromData<Burt06AModel>;
}

export interface UserOption {
  value: string;
  text: string;
}
