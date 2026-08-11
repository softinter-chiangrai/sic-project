// src/app/feature/pm/dt/pmdt02/pmdt02B/pmdt02B.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import type { TaskResponse } from '../pmdt02C/pmdt02C.model';

export interface WorkPackageRequest {
  milestoneId: string;
  packageName: string;
  description?: string;
  startDate: string;
  endDate: string;
  color?: string;
}

export interface WorkPackageResponse {
  id: string;
  milestoneId: string;
  milestoneName: string;
  packageName: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  color?: string;
  tasks?: TaskResponse[];
}

export interface WorkPackageModel extends SicBaseStateModel {
  id: string;
  milestoneId: string;
  packageName: string;
  description?: string;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
  status?: string;
  color?: string;
}

export interface WorkPackagePageData {
  workPackageData: SicFromData<WorkPackageModel>;
  workPackageDetail?: WorkPackageResponse;
}
