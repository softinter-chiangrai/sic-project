// src/app/feature/pm/dt/pmdt12/pmdt12.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';

export interface TaskRequest {
  workPackageId: string;
  taskCode: string;
  taskName: string;
  description?: string;
  assignedTo?: string;
  startDate: string;
  endDate: string;
  estimateManday: number;
  priority?: string;
  color?: string;
  status?: string;
  assigneeIds?: string[];
  specificationId?: string;
}

export interface TaskResponse {
  id: string;
  workPackageId: string;
  workPackageName: string;
  taskCode: string;
  taskName: string;
  description?: string;
  assignedTo?: string;
  startDate: string;
  endDate: string;
  actualStart?: string;
  actualEnd?: string;
  estimateManday: number;
  actualManday?: number;
  status: string;
  color?: string;
  priority: string;
  assigneeIds?: string[];
  assigneeNames?: Record<string, string>;
  specificationId?: string;
  specificationCode?: string;
  specificationTitle?: string;
}

export interface TaskModel extends SicBaseStateModel {
  id: string;
  workPackageId: string;
  specificationId?: string;
  taskCode: string;
  taskName: string;
  description?: string;
  assignedTo?: string;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  estimateManday: number;
  priority?: string;
  status?: string;
  color?: string;
  assigneeIds?: string[];
  assigneeNames?: Record<string, string>;
}

export interface SpecificationSummary {
  id: string;
  code: string;
  title: string;
  specificationType?: string;
  status?: string;
}

export interface WorkPackageOption {
  id: string;
  packageName: string;
  phaseId: string;
  phaseName: string;
  milestoneId: string;
  milestoneName: string;
}
