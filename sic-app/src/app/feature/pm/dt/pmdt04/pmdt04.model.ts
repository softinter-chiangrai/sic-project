// src/app/feature/pm/dt/pmdt04/pmdt04.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';
import type { ApprovalStatus } from '../pmdt03/approval.model';

export interface Pmdt04Model extends SicBaseStateModel {
  id: string;
  projectId: string;
  reqCode: string;
  title: string;
  description?: string;
  reqType?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
}

export interface Pmdt04PageData {
  requirementData: SicFromData<Pmdt04Model>;
}

export interface RequirementItem {
  id: string;
  requirementCode: string;
  title: string;
  description: string;
  requirementType: string;
  source: string;
  priority: string;
  businessValue: string;
  acceptanceCriteria: string;
  projectId: string;
  projectName?: string;
  createdBy: string;
  baConfirmStatus: string;
  customerConfirmStatus: string;
  version: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  rowVersion?: number;
  approvalStatus?: ApprovalStatus | null;
}
