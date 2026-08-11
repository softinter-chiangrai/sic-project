// src/app/feature/pm/rt/pmrt04/pmrt04B/pmrt04B.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmrt04BModel extends SicBaseStateModel {
  id: string;
  contractId: string;
  deliverableCode: string;
  deliverableName: string;
  description?: string;
  dueDate?: string;
  status?: string;
}

export interface Pmrt04BPageData {
  deliverableData: SicFromData<Pmrt04BModel>;
}
