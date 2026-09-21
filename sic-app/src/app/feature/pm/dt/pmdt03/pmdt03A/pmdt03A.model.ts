// src/app/feature/pm/dt/pmdt03/pmdt03A/pmdt03A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import type { Approval } from '../approval.model';

// Kept for pmdt03A.form.ts / pmdt03A.service.ts, which are not wired into the
// approval-detail route (see pmdt03A.resolver.ts) but are preserved as-is.
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
  approval: Approval | null;
}
