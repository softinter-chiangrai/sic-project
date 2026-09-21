import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { DocumentVersionModel } from './pmdt19A/pmdt19A.model';

export interface Pmdt19Model extends SicBaseStateModel {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Pmdt19PageData {
  formData?: SicFromData<Pmdt19Model>;
  detail?: any;
  /** Version history rows preloaded by the resolver (real service call, not mock). */
  items: DocumentVersionModel[];
  /** Initial filter state resolved from query params (and the `code` route param on the /version/history/:code route). */
  filterType: string;
  filterDocId: string;
  projectId: string | null;
}
