// src/app/feature/pm/rt/pmrt05/pmrt05.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmrt05Model extends SicBaseStateModel {
  id: string;
  projectId: string;
}

export interface Pmrt05PageData {
  requirementDetail: RequirementDetail;
  traceLinks: TraceLink[];
}

export interface TraceLink {
  id: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  relationshipType: string;
}

export interface RequirementDetail {
  id: string;
  requirementCode: string;
  title: string;
  description: string;
  priority: string;
  businessValue: string;
  acceptanceCriteria: string;
  projectId: string;
  projectName: string;
  customerId: string;
  customerName: string;
  status: string;
  version: string;
  isActive: boolean;
  createdBy: string;
  createdAt?: string;
  createdDate?: string;
}

export interface RelatedItem {
  id: string;
  name: string;
  code?: string;
  type: string;
  link: string;
  color?: string;
}
