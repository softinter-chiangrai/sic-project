// src/app/feature/pm/dt/pmdt04/pmdt04A/pmdt04A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmdt04AModel extends SicBaseStateModel {
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

export interface Pmdt04APageData {
  requirementData: SicFromData<Pmdt04AModel>;
}

export interface Requirement {
  id?: string;
  requirementCode: string;
  title: string;
  description: string;
  priority: string;
  businessValue: string;
  acceptanceCriteria: string;
  projectId: string;
  projectName?: string;
  createdBy: string;
  baConfirmStatus: string;
  customerConfirmStatus: string;
  version: string;
  status?: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
}
