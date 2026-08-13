// src/app/feature/pm/rt/pmrt02/pmrt02.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmrt02Model extends SicBaseStateModel {
  id: string;
  projectCode: string;
  projectName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface Pmrt02PageData {
  projectData: SicFromData<Pmrt02Model>;
}

export interface PmCustomerProject {
  id: string;
  projectCode: string;
  projectName: string;
  customerId: string;
  customerName: string;
  contractId?: string;
  contractNo?: string;
  projectManager: string;
  ba: string;
  sa: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  budgetManday: number;
  usedManday: number;
  status: string;
  priority: string;
  description?: string;
  isActive: boolean;
  rowVersion?: number;
  createdDate?: string;
  updatedDate?: string;
}

import { PaginationResponse } from '../../../../core/model/sic-base-model';

export { PaginationResponse };
