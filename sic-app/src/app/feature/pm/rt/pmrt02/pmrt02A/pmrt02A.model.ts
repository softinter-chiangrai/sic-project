// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmrt02AModel extends SicBaseStateModel {
  id: string;
  projectCode: string;
  projectName: string;
  customerId: string;
  customerName?: string;
  contractId?: string;
  contractNo?: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  budgetManday: number;
  usedManday: number;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description?: string;
  isActive: boolean;
  approvalFlowId?: string;
  approvalStatus?: string;
  isApproved?: boolean;
  isLocked?: boolean;
  createdAt?: string;
}

export interface Pmrt02APageData {
  projectData: SicFromData<Pmrt02AModel>;
  isEdit: boolean;
}

// Backward-compatible alias — the component/service historically referenced this name.
export type ProjectModel = Pmrt02AModel;
