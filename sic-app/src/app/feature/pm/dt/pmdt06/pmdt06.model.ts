// src/app/feature/pm/dt/pmdt06/pmdt06.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmdt06Model extends SicBaseStateModel {
  id: string;
  projectId: string;
  diagramName: string;
  diagramType?: string;
  contentData?: string;
  version?: string;
}

export interface Pmdt06PageData {
  diagramData: SicFromData<Pmdt06Model>;
}

export interface DiagramPage {
  id: string;
  name: string;
  xml: string;
}
