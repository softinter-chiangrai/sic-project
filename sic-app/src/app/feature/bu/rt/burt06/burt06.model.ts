// src/app/feature/bu/rt/burt06/burt06.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Burt06Model extends SicBaseStateModel {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  roleIds?: string[];
  isActive?: boolean;
}

export interface Burt06PageData {
  memberData: SicFromData<Burt06Model>;
}

export interface ApprovalFlowStep {
  id?: string;
  stepOrder: number;
  stepName: string;
  approverRole?: string;
  approverUserId?: string;
  isRequired: boolean;
  timeoutDays?: number;
  canSkip: boolean;
  rowVersion?: number;
}

export interface ApprovalFlow {
  id?: string;
  flowCode: string;
  flowName: string;
  documentType: string;
  approvalMode: string;
  description?: string;
  active: boolean;
  steps: ApprovalFlowStep[];
  rowVersion?: number;
}
