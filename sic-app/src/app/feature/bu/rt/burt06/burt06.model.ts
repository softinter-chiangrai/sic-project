// src/app/feature/bu/rt/burt06/burt06.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Burt06Model extends SicBaseStateModel {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  roleIds?: string[];
  isActive?: boolean;
}

export interface Burt06PageData {
  memberData: SicFromData<Burt06Model>;
}
