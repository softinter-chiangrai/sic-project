// src/app/feature/bu/rt/burt03/burt03.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Burt03Model extends SicBaseStateModel {
  id: string;
  roleCode: string;
  roleName: string;
  description?: string;
  permissions?: string[];
}

export interface Burt03PageData {
  roleData: SicFromData<Burt03Model>;
}

export interface Role {
  id: string;
  roleCode: string;
  roleName: string;
  roleNameEn: string;
  roleNameLocal: string;
  roleLevel: string;
  sortOrder: number;
  isActive: boolean;
  businessId: string;
  parentRoleId?: string;
  rowVersion?: number;
  isDelete?: boolean;
  color?: string;
}

export interface ComboboxItem {
  value: string;
  text: string;
}
