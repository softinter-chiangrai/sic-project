// src/app/feature/pm/rt/pmrt01/pmrt01.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Pmrt01Model extends SicBaseStateModel {
  id: string;
  customerCode: string;
  customerName: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface Pmrt01PageData {
  customerData: SicFromData<Pmrt01Model>;
}

export interface pmrt01 {
  id: string;
  code: string;
  firstNameEn: string;
  lastNameEn: string;
  firstNameLocal?: string;
  lastNameLocal?: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  taxId?: string;
  addressEn?: string;
  addressLocal?: string;
  countryId?: string;
  provinceId?: string;
  districtId?: string;
  subDistrictId?: string;
  zipCode?: string;
  uploadGroupId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface pmrt01FilterParams {
  keyword?: string;
  status?: 'all' | 'active' | 'inactive';
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  projectId?: string;
}
