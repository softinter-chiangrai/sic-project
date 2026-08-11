// src/app/feature/pm/dt/pmdt09/pmdt09A/pmdt09A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmdt09AModel extends SicBaseStateModel {
  id: string;
  projectId: string;
  topic: string;
  content?: string;
  category?: string;
  author?: string;
}

export interface Pmdt09APageData {
  discussionData: SicFromData<Pmdt09AModel>;
}
