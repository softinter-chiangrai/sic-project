import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface DocumentVersionFormData {
  version: SicFromData<DocumentVersionModel>;
}

export interface DocumentVersionModel extends SicBaseStateModel {
  id: string;
  documentType: string; // REQUIREMENT, DFD, ER, SPEC, TEST_CASE, DELIVERY, CONTRACT, CHANGE_REQUEST, MANUAL
  documentId: string;
  documentCode?: string;
  projectId?: string;
  versionNo: string;
  changeSummary?: string;
  previousVersionId?: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvedDate?: string;
  snapshotData?: string;
  fileRefId?: string;
  filePath?: string;
  isActive: boolean;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
}