// src/app/feature/pm/rt/pmrt04/pmrt04B/pmrt04B.model.ts
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { ContractModel } from '../pmrt04A/pmrt04A.model';

// Page data for the CONTRACT RENEWAL wizard (pmrt04B.component.ts) — builds a
// NEW contract from an existing one, so it is not a classic CRUD-by-id form
// and does not extend SicBaseStateModel.
export interface Pmrt04BModel {
  newContractNo: string;
  newStartDate: string | null;
  newEndDate: string | null;
  newContractValue: number | null;
  renewalRemark?: string | null;
  renewalStatus: string;
  approvalFlowId?: string | null;
}

export interface Pmrt04BPageData {
  renewalData: SicFromData<Pmrt04BModel>;
  originalContract: ContractModel | null;
}
