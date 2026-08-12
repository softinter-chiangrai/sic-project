// src/app/feature/pm/dt/pmdt25/pmdt25.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface DocumentVersionModel extends SicBaseStateModel {
  id: string;
  documentType: string;
  documentId: string;
  versionNo: string;
  changeSummary?: string;
  filePath?: string;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

export interface DocumentVersionPageData {
  versionData: SicFromData<DocumentVersionModel>;
}

export interface DocumentVersionCreateRequest {
  documentType: string;
  documentId: string;
  versionNo: string;
  changeSummary?: string;
  filePath?: string;
  isActive?: boolean;
}