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

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface ComboboxItem {
    value: string;
    text: string;
}