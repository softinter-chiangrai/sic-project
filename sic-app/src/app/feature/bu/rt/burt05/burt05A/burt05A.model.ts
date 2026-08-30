// src/app/feature/bu/rt/burt05/burt05A/burt05A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Burt05AModel extends SicBaseStateModel {
  id?: string;
  programCode: string;
  programNameEn: string;
  programNameLocal: string;
  programIcon?: string;
  routePath?: string;
  parentProgramId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface Burt05APageData {
  programData: SicFromData<Burt05AModel>;
}
