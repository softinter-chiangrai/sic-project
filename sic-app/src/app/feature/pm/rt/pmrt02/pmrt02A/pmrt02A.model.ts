// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmrt02AModel extends SicBaseStateModel {
  id: string;
  projectCode: string;
  projectName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface Pmrt02APageData {
  projectData: SicFromData<Pmrt02AModel>;
}
