// src/app/feature/bu/rt/burt05/burt05A/burt05A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Burt05AModel extends SicBaseStateModel {
  id: string;
  projectCode: string;
  projectName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface Burt05APageData {
  projectData: SicFromData<Burt05AModel>;
}
