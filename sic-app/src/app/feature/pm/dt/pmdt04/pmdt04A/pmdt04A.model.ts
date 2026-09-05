// src/app/feature/pm/dt/pmdt04/pmdt04A/pmdt04A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmdt04AModel extends SicBaseStateModel {
  id: string;
  projectId: string;
  reqCode?: string;
  title?: string;
  description?: string;
  reqType?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  exportFormat?: string;
  includeDiagrams?: boolean;
}

export interface Pmdt04APageData {
  exportData: SicFromData<Pmdt04AModel>;
}

export interface RequirementModel {
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
  isLocked?: boolean;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
  createdAt?: string;
  updatedAt?: string;
  uploadGroupId?: string;
  uploadGroupData?: any[];
}

export interface RequirementPreviewData {
  requirementCode: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  priority: string;
  requirementType: string;
  source: string;
  businessValue: string;
  createdBy: string;
  version: string;
  status: string;
  projectName?: string;
  createdAt?: string;
}
