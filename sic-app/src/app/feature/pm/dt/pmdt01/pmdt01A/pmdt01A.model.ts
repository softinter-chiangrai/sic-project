// src/app/feature/pm/dt/pmdt01/pmdt01A/pmdt01A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmdt01AModel extends SicBaseStateModel {
  id: string;
  projectId: string;
  phaseName: string;
  description?: string;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  owner?: string;
  color?: string;
  status?: string;
  progress?: number;
}

export interface Pmdt01APageData {
  phaseData: SicFromData<Pmdt01AModel>;
}
