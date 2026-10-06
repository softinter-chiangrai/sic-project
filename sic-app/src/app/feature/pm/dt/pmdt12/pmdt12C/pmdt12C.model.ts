// src/app/feature/pm/dt/pmdt12/pmdt12C/pmdt12C.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';

export interface BugTaskModel extends SicBaseStateModel {
  id?: string;
  taskCode: string;
  taskName: string;
  description: string;
  priority: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  estimateManday?: number;
  workPackageId?: string;
  workPackageName?: string;
  specificationId?: string;
  specificationCode?: string;
  assignedTo?: string | null;
  assigneeIds?: string[];
  attachmentGroupId?: string | null;
  projectId?: string;
  projectName?: string;
  // Relationship reference metadata
  testCaseId?: string | null;
  testCaseCode?: string | null;
  testCaseTitle?: string | null;
  testCaseStatus?: string | null;
  scenarioId?: string | null;
  scenarioCode?: string | null;
  scenarioName?: string | null;
  parentTaskId?: string | null;
  parentTaskCode?: string | null;
  parentTaskName?: string | null;
}
