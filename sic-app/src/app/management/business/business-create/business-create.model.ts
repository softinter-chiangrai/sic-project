import { StorageUploadReference } from "../../../core/component/sic-upload/sic-upload";
import { SicBaseStateModel } from "../../../core/model/sic-base-model";
import { SicFromData } from "../../../core/model/sic-from-data";

export interface BusinessFormData { 
  business : SicFromData<BusinessCreateModel>; 
}

export interface BusinessCreateModel extends SicBaseStateModel {
  id: string;
  taxId: string;
  personType: string;
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
  fax: string;
  uploadGroupId: string;
  uploadGroupData: StorageUploadReference[];
  isActive: string;
}