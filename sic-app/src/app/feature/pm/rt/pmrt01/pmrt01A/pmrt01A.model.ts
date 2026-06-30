// src/app/feature/pm/rt/pmrt01A/pmrt01A.model.ts

import type { StorageUploadReference } from "../../../../../core/services/chat.service";

export interface CustomerModel {
  id?: string;
  customerCode: string;                    // แทน businessCode
  taxId?: string;
  companyNameEn: string;                  // แทน firstNameEn (ใช้ชื่อบริษัท)
  companyNameLocal: string;               // แทน firstNameLocal
  contactPerson?: string;                 // เพิ่ม
  phoneNumber?: string;
  email?: string;
  lineId?: string;                        // เพิ่ม
  addressEn?: string;
  addressLocal?: string;
  provinceId?: string;
  districtId?: string;
  subDistrictId?: string;
  zipCode?: string;
  customerType?: string;                  // เพิ่ม (เช่น "INDIVIDUAL", "CORPORATE")
  remark?: string;                        // เพิ่ม
  isActive?: boolean;
  // ฟิลด์เพิ่มเติมจาก Backend (response)
  provinceName?: string;
  districtName?: string;
  subDistrictName?: string;
  state?: number;
  rowVersion?: number;
  // เก็บไว้สำหรับ upload
  uploadGroupId?: string;
  uploadGroupData?: StorageUploadReference[];
}