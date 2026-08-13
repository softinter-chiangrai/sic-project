// src/app/feature/pm/rt/pmrt04/pmrt04.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmrt04Model extends SicBaseStateModel {
  id: string;
  projectId: string;
  contractCode: string;
  contractName: string;
  amount?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface Pmrt04PageData {
  contractData: SicFromData<Pmrt04Model>;
}

export interface ComboboxItem {
  value: string;
  text: string;
}

export interface Contract {
  id: string;
  contractNo: string;
  contractType: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  paymentTerms: string;
  scopeSummary: string;
  signStatus: 'Draft' | 'Sent' | 'Signed' | 'Expired';
  renewalStatus: string;
  isActive: boolean;
  createdAt: string;
  rowVersion?: number;
}

