// src/app/feature/pm/dt/pmdt05/pmdt05.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmdt05Model extends SicBaseStateModel {
  id: string;
  projectId: string;
  exportFormat?: string;
  includeDiagrams?: boolean;
}

export interface Pmdt05PageData {
  exportData: SicFromData<Pmdt05Model>;
}
