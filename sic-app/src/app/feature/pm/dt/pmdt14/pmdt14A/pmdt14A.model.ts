import { SicEntityState } from '../../../../../core/model/sic-base-model';

export interface PmDeliveryModel {
  id?: string;
  projectId: string;
  deliveryCode: string;
  deliveryTitle: string;
  deliveryType: 'FINAL' | 'PARTIAL' | 'MILESTONE';
  deliveryVersion: string;
  deliveryDate: string;
  status: 'DRAFT' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CONFIRMED';
  releaseNote?: string;
  deliverySummary?: string;
  attachmentGroupId?: string;
  checklists?: PmDeliveryChecklistModel[];
  isGatePassed?: boolean;
  passedGateChecks?: number;
  totalGateChecks?: number;
  isChecklistPassed?: boolean;
  checkedChecklistCount?: number;
  totalChecklistCount?: number;
  isActive?: boolean;
  state?: SicEntityState | null;
  rowVersion?: number | null;
}

export interface PmDeliveryChecklistModel {
  id?: string;
  deliveryId?: string;
  itemName: string;
  isChecked: boolean;
  checkedBy?: string;
  checkedDate?: string;
  remark?: string;
  sortOrder?: number;
  state?: SicEntityState | null;
  rowVersion?: number | null;
}

export interface PmDeliveryGateCheckItem {
  category: string;
  name: string;
  passed: boolean;
  detail: string;
}

export interface PmDeliveryGateCheckResponse {
  projectId: string;
  deliveryId?: string;
  isPassed: boolean;
  totalChecks: number;
  passedChecks: number;
  checkItems: PmDeliveryGateCheckItem[];
}
