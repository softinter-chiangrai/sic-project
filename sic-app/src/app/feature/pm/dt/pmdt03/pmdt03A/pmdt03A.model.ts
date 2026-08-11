// src/app/feature/pm/dt/pmdt03/pmdt03A/pmdt03A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmdt03AModel extends SicBaseStateModel {
  id: string;
  documentType: string;
  documentId: string;
  documentCode: string;
  documentTitle: string;
  comment?: string;
  flowId?: string;
}

export interface Pmdt03APageData {
  approvalData: SicFromData<Pmdt03AModel>;
}
