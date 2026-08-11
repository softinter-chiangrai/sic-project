// src/app/feature/pm/dt/pmdt07/pmdt07.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmdt07Model extends SicBaseStateModel {
  id: string;
  projectId: string;
  crCode: string;
  title: string;
  description?: string;
  impactScore?: number;
  costImpact?: number;
  scheduleImpactDays?: number;
  status?: string;
}

export interface Pmdt07PageData {
  changeRequestData: SicFromData<Pmdt07Model>;
}
