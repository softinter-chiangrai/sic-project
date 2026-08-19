// src/app/feature/pm/dt/pmdt06/pmdt06A/pmdt06A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Pmdt05AModel extends SicBaseStateModel {
  id: string;
  projectId: string;
  diagramName: string;
  diagramType?: string;
  contentData?: string;
}

export interface Pmdt05APageData {
  diagramData: SicFromData<Pmdt05AModel>;
}
