import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface PmUserManualFormData {
  manual: SicFromData<PmUserManualModel>;
}

export interface PmUserManualSectionModel {
  id?: string;
  manualId?: string;
  sectionCode?: string;
  sectionTitle: string;
  content?: string;
  sortOrder?: number;
  permissionRoles?: string;
  screenshotGroupId?: string;
  state?: number;
  rowVersion?: number;
}

export interface PmUserManualModel extends SicBaseStateModel {
  id: string;
  projectId: string;
  manualCode: string;
  manualTitle: string;
  manualType: string; // USER, ADMIN, INSTALLATION, OPERATION, TROUBLESHOOT
  version: string;
  relatedSpecId?: string;
  deliveryId?: string;
  status: string; // DRAFT, REVIEW, APPROVED, PUBLISHED
  attachmentGroupId?: string;
  sections?: PmUserManualSectionModel[];
}
