import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { AiAttachmentPayload } from '../../../../../core/utils/ai-attachment.util';

export interface PmUserManualFormData {
  manual: SicFromData<PmUserManualModel>;
}

export interface PmUserManualPageData {
  formData: SicFromData<PmUserManualModel>;
  isEdit: boolean;
  isLocked: boolean;
  sections: PmUserManualSectionModel[];
  deliveryOptions: Array<{ value: string; text: string }>;
  requirementOptions: Array<{ value: string; text: string }>;
  specificationOptions: Array<{ value: string; text: string }>;
}

export interface PmUserManualSectionModel {
  id?: string;
  manualId?: string;
  sectionCode?: string;
  sectionTitle: string;
  content?: string;
  sortOrder?: number;
  specId?: string;
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
  approvalStatus?: string;
  isLocked?: boolean;
  attachmentGroupId?: string;
  sections?: PmUserManualSectionModel[];
}

export interface GenerateUserManualDraftRequest {
  projectId?: string;
  manualTitle?: string;
  manualType?: string;
  requirementIds?: string[];
  specificationIds?: string[];
  prompt?: string;
  model?: string;
  attachments?: AiAttachmentPayload[];
}

export interface UserManualSectionDraft {
  sectionCode?: string;
  sectionTitle: string;
  content: string;
  sortOrder?: number;
}

export interface UserManualDraftResponse {
  manualTitle?: string;
  manualType?: string;
  summary?: string;
  sections?: UserManualSectionDraft[];
}

