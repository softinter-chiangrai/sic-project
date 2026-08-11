// src/app/feature/pm/dt/pmdt03/pmdt03.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export type ApprovalStatus =
  | 'PENDING'
  | 'PARTIALLY_APPROVED'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEED_REVISION'
  | 'CANCELLED'
  | 'SKIPPED'
  | 'EXPIRED';

export interface Pmdt03Model extends SicBaseStateModel {
  id: string;
  documentType: string;
  documentId: string;
  documentCode: string;
  documentTitle: string;
  requestedBy?: string;
  requestedDate?: string;
  status: ApprovalStatus;
  comment?: string;
}

export interface Pmdt03PageData {
  approvalData: SicFromData<Pmdt03Model>;
}

export interface ApprovalItem {
  id: string;
  documentType: string;
  documentCode: string;
  title: string;
  projectId: string;
  projectName: string;
  requester: string;
  requestedDate: string;
  dueDate?: string;
  approver: string;
  status: string;
}
