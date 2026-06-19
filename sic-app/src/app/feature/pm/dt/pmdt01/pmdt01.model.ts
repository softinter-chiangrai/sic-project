import type { SicBaseStateModel } from "../../../../core/model/sic-base-model";
import type { SicFromData } from "../../../../core/model/sic-from-data";
import type { StorageUploadReference } from "../../../../core/services/chat.service";


export interface CustomerFormData {
  business: SicFromData<CustomerModel>;
}

export interface CustomerModel extends SicBaseStateModel {
  id: string;
  personType: string; // 'INDIVIDUAL' | 'CORPORATE'
  businessCode: string;
  taxId: string;
  branchCode: string;
  titleId: string;
  firstNameEn: string;
  middleNameEn: string;
  lastNameEn: string;
  firstNameLocal: string;
  middleNameLocal: string;
  lastNameLocal: string;
  countryId: string;
  supportLocalAddress: boolean;
  addressEn: string;
  addressLocal: string;
  provinceId: string;
  districtId: string;
  subDistrictId: string;
  zipCode: string;
  email: string;
  phoneNumber: string;
  uploadGroupId: string;
  uploadGroupData: StorageUploadReference[];
  isActive: boolean;
}