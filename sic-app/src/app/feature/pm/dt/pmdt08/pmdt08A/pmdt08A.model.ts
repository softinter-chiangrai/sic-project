// src/app/feature/pm/dt/pmdt08/pmdt08A/pmdt08A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmdt08AModel extends SicBaseStateModel {
  id: string;
  projectId: string;
  taskCode: string;
  taskName: string;
  description?: string;
  assignedTo?: string;
  startDate: string;
  endDate: string;
  estimateManday: number;
  priority?: string;
  color?: string;
}

export interface Pmdt08APageData {
  taskData: SicFromData<Pmdt08AModel>;
}
