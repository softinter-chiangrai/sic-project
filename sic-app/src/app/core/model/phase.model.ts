// src/app/core/model/phase.model.ts

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
  assigneeIds?: string[]; // ✅ เพิ่ม
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
  assigneeIds?: string[]; // ✅ เพิ่ม
  assigneeNames?: Record<string, string>; // ✅ เพิ่ม
}