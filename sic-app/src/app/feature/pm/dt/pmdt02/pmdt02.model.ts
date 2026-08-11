// src/app/feature/pm/dt/pmdt02/pmdt02.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';
import type { MilestoneResponse } from './pmdt02A/pmdt02A.model';

export interface PhaseRequest {
  projectId: string;
  phaseName: string;
  description?: string;
  startDate: string;
  endDate: string;
  owner?: string;
  dependencyId?: string;
  color?: string;
}

export interface PhaseResponse {
  id: string;
  projectId: string;
  projectName: string;
  phaseName: string;
  description?: string;
  startDate: string;
  endDate: string;
  color?: string;
  owner?: string;
  status: string;
  progress: number;
  dependencyId?: string;
  dependencyName?: string;
  milestoneCount: number;
  taskCount: number;
  taskCompletedCount: number;
  milestones?: MilestoneResponse[];
}

export interface PhaseModel extends SicBaseStateModel {
  id: string;
  projectId: string;
  phaseName: string;
  description?: string;
  startDate: string;
  endDate: string;
  owner?: string;
  color?: string;
  status?: string;
  progress?: number;
  dependencyId?: string;
}

export interface PhasePageData {
  phaseData: SicFromData<PhaseModel>;
  phaseDetail?: PhaseResponse;
}

export interface CalendarItemDetail {
  id: string;
  type: 'phase' | 'milestone' | 'workpackage' | 'task' | 'holiday' | 'event';
  title: string;
  subtitle?: string;
  description?: string;
  color: string;
  icon: string;
  isCustom?: boolean;
  rawObject?: any;
}
