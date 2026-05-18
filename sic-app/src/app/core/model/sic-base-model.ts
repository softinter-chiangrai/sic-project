import { SicEntityState } from "./sic-entity-state";

export interface SicBaseModel {
  id: string;
  createdBy: string; 
  createdDate: Date;
  updatedBy: string;
  updatedDate: Date;
  state: SicEntityState;
  rowVersion: number;
}

export interface SicBaseStateModel {
  state: SicEntityState;
  rowVersion: number;
}