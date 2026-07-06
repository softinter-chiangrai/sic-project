// src/app/feature/pm/models/phase.model.ts

export interface PhaseRequest {
  projectId: string;
  phaseName: string;
  description?: string;
  startDate: string;
  endDate: string;
  owner?: string;
  dependencyId?: string;
}

export interface PhaseResponse {
  id: string;
  projectId: string;
  projectName: string;
  phaseName: string;
  description?: string;
  startDate: string;
  endDate: string;
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

export interface MilestoneRequest {
  phaseId: string;
  milestoneName: string;
  description?: string;
  dueDate: string;
}

export interface MilestoneResponse {
  id: string;
  phaseId: string;
  phaseName: string;
  milestoneName: string;
  description?: string;
  dueDate: string;
  status: string;
  workPackages?: WorkPackageResponse[];
}

export interface WorkPackageRequest {
  milestoneId: string;
  packageName: string;
  description?: string;
  startDate: string;
  endDate: string;
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
  tasks?: TaskResponse[];
}

export interface TaskRequest {
  workPackageId: string;
  taskCode: string;
  taskName: string;
  description?: string;
  assignedTo?: string;
  startDate: string;
  endDate: string;
  estimateManday?: number;
  priority?: string;
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
  priority: string;
}