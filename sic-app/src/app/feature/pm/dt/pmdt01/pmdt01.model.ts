// src/app/feature/pm/dt/pmdt01/pmdt01.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface PhaseModel extends SicBaseStateModel {
  id: string;
  projectId: string;
  phaseName: string;
  description?: string;
  startDate: string;      // ISO datetime
  endDate: string;        // ISO datetime
  owner?: string;
  color?: string;
  status?: string;
  progress?: number;
  milestoneCount?: number;
  taskCount?: number;
  taskCompletedCount?: number;
}

export interface PhasePageData {
  phaseData: SicFromData<PhaseModel>;
}