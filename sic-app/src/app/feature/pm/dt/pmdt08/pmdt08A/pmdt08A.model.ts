// src/app/feature/pm/dt/pmdt08/pmdt08A/pmdt08A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmdt08AModel extends SicBaseStateModel {
  id: string;
  projectId: string;
  topic: string;
  content?: string;
  category?: string;
  author?: string;
}

export interface Pmdt08APageData {
  discussionData: SicFromData<Pmdt08AModel>;
}
