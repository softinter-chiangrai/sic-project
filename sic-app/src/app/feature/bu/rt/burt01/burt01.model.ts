import { SicBaseStateModel } from "../../../../core/model/sic-base-model";
import { SicFromData } from "../../../../core/model/sic-from-data";
import { StorageUploadReference } from "../../../../core/services/chat.service";


export interface Burt01FormData { 
  businessInfo: SicFromData<Burt01Model>;
}

export interface Burt01Model extends SicBaseStateModel {
  id: string;
  taxId?: string | null;
  businessCode: string;
  branchCode?: string | null;
  personType: string;
  titleId: string;
  firstNameEn: string;
  middleNameEn?: string | null;
  lastNameEn?: string | null;
  firstNameLocal: string;
  middleNameLocal?: string | null;
  lastNameLocal?: string | null;
  countryId: string;
  supportLocalAddress: boolean;
  addressEn?: string | null;
  addressLocal?: string | null;
  provinceId?: string | null;
  districtId?: string | null;
  subDistrictId?: string | null;
  zipCode?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  uploadGroupId?: string | null;
  uploadGroupData: StorageUploadReference[];
}
