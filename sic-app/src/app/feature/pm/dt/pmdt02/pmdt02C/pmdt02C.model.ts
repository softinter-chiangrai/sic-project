// src/app/feature/pm/dt/pmdt02/pmdt02C/pmdt02C.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

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
  projectId?: string;
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

export interface TaskPageData {
  taskData: SicFromData<TaskModel>;
  taskDetail?: TaskResponse;
}
