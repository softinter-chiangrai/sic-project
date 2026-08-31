// src/app/feature/pm/dt/pmdt07/pmdt07.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmdt06Model extends SicBaseStateModel {
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

export interface Pmdt06PageData {
  changeRequestData: SicFromData<Pmdt06Model>;
}

export interface CrAssignee {
  id: string;
  userId: string;
  userName: string;
  targetType: string;
  targetId: string;
  status: string;
  completedAt?: string;
}

export interface ChangeImpact {
  id: string;
  impactedType: string;
  impactedId: string;
  impactedTitle: string;
  impactLevel: string;
}

export interface ChangeRequestItem {
  id: string;
  title: string;
  description: string;
  changeReason: string;
  estimatedManday: number;
  status: string;
  targetType: string;
  targetId: string;
  projectId: string;
  projectName?: string;
  createdDate: string;
  assignees?: CrAssignee[];
  impacts?: ChangeImpact[];
  approvalStatus?: string;
}
