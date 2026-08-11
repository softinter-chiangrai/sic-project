// src/app/feature/pm/dt/pmdt02/pmdt02A/pmdt02A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import type { WorkPackageResponse } from '../pmdt02B/pmdt02B.model';

export interface MilestoneRequest {
  phaseId: string;
  milestoneName: string;
  description?: string;
  dueDate: string;
  color?: string;
}

export interface MilestoneResponse {
  id: string;
  phaseId: string;
  phaseName: string;
  milestoneName: string;
  description?: string;
  dueDate: string;
  status: string;
  color?: string;
  workPackages?: WorkPackageResponse[];
}

export interface MilestoneModel extends SicBaseStateModel {
  id: string;
  phaseId: string;
  milestoneName: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  status?: string;
  color?: string;
}

export interface MilestonePageData {
  milestoneData: SicFromData<MilestoneModel>;
  milestoneDetail?: MilestoneResponse;
}
