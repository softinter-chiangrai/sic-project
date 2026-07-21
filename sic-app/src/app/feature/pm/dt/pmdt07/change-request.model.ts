// src/app/feature/pm/dt/pmdt07/models/change-request.model.ts
export interface ChangeRequest {
  id?: string;
  requirementId: string;
  requirementCode?: string;
  requirementTitle?: string;
  changeDescription: string;
  impactSummary?: string;
  estimatedManday?: number;
  status: string; // Draft, Submitted, Approved, Rejected
  isActive?: boolean;
  rowVersion?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImpactAnalysis {
  id?: string;
  changeRequestId: string;
  dfdImpact?: string;
  erImpact?: string;
  uiImpact?: string;
  apiImpact?: string;
  testImpact?: string;
  mandayImpact?: number;
  timelineImpact?: number;
  costImpact?: string;
  impactedRequirementIds?: string[];
  impactedSpecIds?: string[];
  impactedTaskIds?: string[];
  impactedTestCaseIds?: string[];
  impactedBugIds?: string[];
  impactedTableNames?: string[];
  analysisStatus?: 'AUTO' | 'MANUAL';
  analyzedAt?: string;
  analyzedBy?: string;
}