import { SicBaseStateModel } from '../../../../core/model/sic-base-model';

export interface PmBugModel extends SicBaseStateModel {
  id?: string;
  projectId?: string;
  bugCode: string;
  title: string;
  description?: string;
  stepsToReproduce?: string;
  environment?: string;
  issueType?: string;
  attachmentGroupId?: string;
  severity: string;
  priority: string;
  foundBy?: string;
  assignedTo?: string;
  foundDate?: string;
  fixDueDate?: string;
  fixedDate?: string;
  status: string;
  relatedSpec?: string;
  taskId?: string;
  taskCode?: string;
  taskName?: string;
  testCaseId?: string;
  testCaseCode?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface PmTestCaseModel extends SicBaseStateModel {
  id?: string;
  projectId?: string;
  scenarioId?: string;
  scenarioName?: string;
  testCaseCode: string;
  title?: string;
  priority?: string;
  testStep: string;
  expectedResult: string;
  actualResult?: string;
  testStatus: string;
  tester?: string;
  testDate?: string;
  relatedRequirement?: string;
  relatedSpec?: string;
  relatedTask?: string;
  taskId?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface PmTestScenarioModel extends SicBaseStateModel {
  id?: string;
  projectId?: string;
  testPlanId?: string;
  scenarioName: string;
  description?: string;
  prerequisite?: string;
  status?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface PmTaskItemModel {
  id: string;
  taskCode: string;
  taskName: string;
  description?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  estimateManday?: number;
  actualManday?: number;
  status: string;
  priority: string;
}
