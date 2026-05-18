import { StorageUploadReference } from '../../core/component/sic-upload/sic-upload';
import { SicBaseStateModel } from '../../core/model/sic-base-model';
import { SicFromData } from '../../core/model/sic-from-data';

export interface ProfileFormData { 
  profile: SicFromData<ProfileModel>; 
  verify: SicFromData<EmailVerifyModel> 
}

export interface ProfileModel extends SicBaseStateModel {
  id: string;
  taxId: string;
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
  referenceNumber: string;
  verifyToken: string;
}

export interface EmailVerifyModel {
  verifyType: string;
  verifyToken: string;
  referenceNumber: string;
  expirationMinutes: number;
  maxRetry: number;
  recipient: string;
}
