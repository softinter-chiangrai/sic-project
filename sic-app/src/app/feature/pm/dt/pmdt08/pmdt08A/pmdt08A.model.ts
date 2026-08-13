// src/app/feature/pm/dt/pmdt08/pmdt08A/pmdt08A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmdt08AModel extends SicBaseStateModel {
  id?: string;
  specificationCode: string;
  specificationType?: string;
  specType?: string;
  title: string;
  module?: string;
  version?: string;
  status?: string;
  priority?: string;
  owner?: string;
  estimatedManday?: number;
  description?: string;
  uploadGroupId?: string;
  uploadGroupData?: any[];
  isActive?: boolean;
  isAiGenerated?: boolean;
  aiGeneratedAt?: string;
  generatedFromRequirementId?: string;
  generatedFromDiagramId?: string;
  projectId?: string;
  projectName?: string;
  requirementId?: string;
  requirementCode?: string;
  requirementTitle?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pmdt08APageData {
  specData: SicFromData<Pmdt08AModel>;
}
