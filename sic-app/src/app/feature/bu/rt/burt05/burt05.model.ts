// src/app/feature/bu/rt/burt05/burt05.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Burt05Model extends SicBaseStateModel {
  id: string;
  projectCode: string;
  projectName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface Burt05PageData {
  projectData: SicFromData<Burt05Model>;
}

export interface Program {
  id?: string;
  parentProgramId?: string | null;
  parentProgramCode?: string;
  programCode: string;
  programName: string;
  programNameEn: string;
  programNameLocal: string;
  programIcon?: string;
  routePath?: string;
  sortOrder?: number;
  isActive: boolean;
  rowVersion?: number;
}

export interface RolePermission {
  roleId: string;
  level: string;
}

export interface CreateProgramWithPermissionsRequest {
  parentProgramId?: string | null;
  programCode: string;
  programNameEn: string;
  programNameLocal: string;
  programIcon?: string;
  routePath?: string;
  sortOrder?: number;
  permissions: RolePermission[];
}

export interface TreeNode {
  id: string;
  code: string;
  name: string;
  nameLocal: string;
  icon: string;
  routePath: string;
  sortOrder: number;
  isActive: boolean;
  children: TreeNode[];
  parentProgramId?: string | null;
  level: number;
}
