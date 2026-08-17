// src/app/feature/pm/dt/pmdt13/pmdt13B/pmdt13B.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';

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
