// src/app/feature/pm/dt/pmdt08/pmdt08.model.ts

import { SicFromData } from '../../../../core/model/sic-from-data';

export interface SpecificationModel {
  id?: string;
  projectId: string;
  projectName?: string;
  requirementId?: string;
  requirementName?: string;
  specCode: string;
  specType: string;
  title: string;
  description?: string;
  relatedRequirement?: string;
  relatedDiagram?: string;
  uiAction?: string;
  validationRule?: string;
  permission?: string;
  estimatedManday?: number;
  dependency?: string;
  status: string;
  version?: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
  approvalStatus?: string;
}

export interface Pmdt08FormData {
  specification: SicFromData<SpecificationModel>;
}