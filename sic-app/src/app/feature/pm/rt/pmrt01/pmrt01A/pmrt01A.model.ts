// src/app/feature/pm/rt/pmrt01A/pmrt01A.model.ts

import type { SicFromData } from '../../../../../core/model/sic-from-data';
import type { StorageUploadReference } from '../../../../../core/services/chat.service';

export interface CustomerModel {
  id?: string;
  customerCode: string;
  personType?: string;
  taxId?: string;
  companyNameEn: string;
  companyNameLocal: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  lineId?: string;
  addressEn?: string;
  addressLocal?: string;
  provinceId?: string;
  districtId?: string;
  subDistrictId?: string;
  countryId?: string;
  zipCode?: string;
  remark?: string;
  isActive?: boolean;

  // Response fields
  provinceName?: string;
  countryName?: string;
  districtName?: string;
  subDistrictName?: string;

  // State & Version
  state?: number;
  rowVersion?: number;
  uploadGroupId?: string;
  uploadGroupData?: StorageUploadReference[];
}

export interface CustomerFormData {
  customer: SicFromData<CustomerModel>;
}
