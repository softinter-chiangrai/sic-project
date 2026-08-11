// src/app/feature/bu/rt/burt04/burt04A/burt04A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Burt04AModel extends SicBaseStateModel {
  id: string;
  userId: string;
  roleIds?: string[];
  isActive?: boolean;
}

export interface Burt04APageData {
  memberData: SicFromData<Burt04AModel>;
}
