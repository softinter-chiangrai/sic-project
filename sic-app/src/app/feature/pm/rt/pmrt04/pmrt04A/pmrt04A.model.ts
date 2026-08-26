// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmrt04AModel extends SicBaseStateModel {
  id: string;
  contractId: string;
  installmentNo: number;
  installmentName: string;
  amount?: number;
  dueDate?: string;
  status?: string;
}

export interface Pmrt04APageData {
  installmentData: SicFromData<Pmrt04AModel>;
}

export interface ContractModel {
  id?: string;
  contractNo: string;
  contractType: string;
  customerId?: string;
  customerName?: string;
  projectId?: string;
  projectName?: string;
  startDate: string | Date;
  endDate: string | Date;
  contractValue: number;
  paymentTerms: string;
  scopeSummary: string;
  signStatus: 'Draft' | 'Sent' | 'Signed' | 'Expired';
  renewalStatus: string;
  parentContractId?: string;
  parentContractNo?: string;
  isActive: boolean;
  state?: number;
  rowVersion?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
