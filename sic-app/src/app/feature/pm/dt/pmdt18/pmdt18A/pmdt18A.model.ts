import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface PmMaRenewalFormData {
  renewal: SicFromData<PmMaRenewalModel>;
}

export interface PmMaRenewalModel extends SicBaseStateModel {
  id: string;
  renewalNo: string;
  contractId: string;
  contractNo?: string;
  customerId: string;
  customerName?: string;
  projectId: string;
  projectName?: string;
  currentEndDate: string;
  newStartDate: string;
  newEndDate: string;
  proposedAmount: number;
  status: string;
  approvalStatus?: string;
  isLocked?: boolean;
  newContractId?: string;
  remark?: string;
}
