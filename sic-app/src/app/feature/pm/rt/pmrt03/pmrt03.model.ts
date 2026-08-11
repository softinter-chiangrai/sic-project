// src/app/feature/pm/rt/pmrt03/pmrt03.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmrt03Model extends SicBaseStateModel {
  id: string;
  projectId: string;
  projectName: string;
  progress?: number;
  phaseCount?: number;
  taskCount?: number;
}

export interface Pmrt03PageData {
  dashboardData: SicFromData<Pmrt03Model>;
}

export interface ProjectDashboard {
  id: string;
  projectCode: string;
  projectName: string;
  customerId: string;
  customerName: string;
  contractId: string;
  contractNo: string;
  projectManager: string;
  ba: string;
  sa: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  budgetManday: number;
  usedManday: number;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description?: string;
  isActive: boolean;
  rowVersion?: number;

  phaseCount: number;
  taskCount: number;
  taskCompletedCount: number;
  requirementCount: number;
  bugCount: number;
  bugOpenCount: number;

  recentPhases: RecentPhase[];
  recentTasks: RecentTask[];
}

export interface RecentPhase {
  id: string;
  phaseCode: string;
  phaseName: string;
  status: string;
  progress: number;
  endDate: string;
}

export interface RecentTask {
  id: string;
  taskCode: string;
  taskName: string;
  assignedTo: string;
  status: string;
  priority: string;
}
