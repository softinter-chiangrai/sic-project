// src/app/feature/pm/dt/pmdt05/pmdt05.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmdt05Model extends SicBaseStateModel {
  id: string;
  projectId: string;
  exportFormat?: string;
  includeDiagrams?: boolean;
}

export interface Pmdt05PageData {
  exportData: SicFromData<Pmdt05Model>;
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

