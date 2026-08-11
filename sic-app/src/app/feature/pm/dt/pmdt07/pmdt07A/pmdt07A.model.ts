// src/app/feature/pm/dt/pmdt07/pmdt07A/pmdt07A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmdt07AModel extends SicBaseStateModel {
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

export interface Pmdt07APageData {
  changeRequestData: SicFromData<Pmdt07AModel>;
}

export interface ChangeRequestFormModel {
  id?: string;
  projectId?: string;
  targetType: string;
  targetId: string;
  title: string;
  description?: string;
  changeReason?: string;
  assigneeId?: string;
  assigneeName?: string;
  assignees?: { id?: string; userId: string; userName?: string; targetType?: string; targetId?: string; status?: string }[];
  status?: string;
  rowVersion?: number;
}
