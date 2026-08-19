// src/app/feature/pm/dt/pmdt05/pmdt05.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmdt05Model extends SicBaseStateModel {
  id: string;
  projectId: string;
  diagramName: string;
  diagramType?: string;
  contentData?: string;
  version?: string;
}

export interface Pmdt05PageData {
  diagramData: SicFromData<Pmdt05Model>;
}

export interface DiagramPage {
  id: string;
  name: string;
  xml: string;
}
