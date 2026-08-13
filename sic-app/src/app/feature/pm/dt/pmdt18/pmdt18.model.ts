import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface PmDeliveryFormData {
  delivery: SicFromData<PmDeliveryModel>;
}

export interface PmDeliveryChecklistModel {
  id?: string;
  deliveryId?: string;
  itemName: string;
  itemCategory?: string;
  isChecked: boolean;
  checkedBy?: string;
  checkedDate?: string;
  remark?: string;
  sortOrder?: number;
  state?: number;
  rowVersion?: number;
}

export interface PmDeliveryModel extends SicBaseStateModel {
  id: string;
  projectId: string;
  deliveryCode: string;
  deliveryTitle: string;
  deliveryType: string; // FINAL, PARTIAL, MILESTONE
  contractId?: string;
  milestoneId?: string;
  deliveryDate?: string;
  deliveryVersion: string;
  releaseNote?: string;
  deliverySummary?: string;
  status: string; // DRAFT, PREPARING, READY, DELIVERED, CONFIRMED
  pmApprovedBy?: string;
  pmApprovedDate?: string;
  customerSignedBy?: string;
  customerSignedDate?: string;
  attachmentGroupId?: string;
  checklists?: PmDeliveryChecklistModel[];
}

export interface GateCheckItem {
  category: string;
  name: string;
  passed: boolean;
  status: string;
  detail: string;
}

export interface PmDeliveryGateCheckResponse {
  isPassed: boolean;
  totalChecks: number;
  passedChecks: number;
  checkItems: GateCheckItem[];
}
