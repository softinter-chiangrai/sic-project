// src/app/feature/pm/dt/pmdt09/pmdt09.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmdt09Model extends SicBaseStateModel {
  id: string;
  projectId: string;
  topic: string;
  content?: string;
  category?: string;
  author?: string;
  createdDate?: string;
}

export interface Pmdt09PageData {
  discussionData: SicFromData<Pmdt09Model>;
}
