// src/app/feature/pm/dt/pmdt13/pmdt13.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';

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
  taskCode?: string;
  taskName?: string;
  taskStatus?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface PmTestScenarioModel extends SicBaseStateModel {
  id?: string;
  projectId?: string;
  testPlanId?: string;
  taskId?: string;
  taskCode?: string;
  taskName?: string;
  scenarioCode?: string;
  scenarioName: string;
  priority?: string;
  description?: string;
  prerequisite?: string;
  status?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface Pmdt12Model extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}


