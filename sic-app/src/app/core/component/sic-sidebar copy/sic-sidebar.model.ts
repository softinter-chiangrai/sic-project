import { StorageUploadReference } from "../sic-upload/sic-upload.component";

export interface MenuItemModel {
  name: string;
  icon?: string;
  path?: string;
  code: string;
  RoleBack:boolean;
  RoleSearch:boolean;
  RoleAdd:boolean;
  RoleSave:boolean;
  RolePrint:boolean;
  children: MenuItemModel[];
}

export interface ProfileInfoModel{
  id: string;
  name: string;
  uploadGroupId: string;
  uploadGroupData: StorageUploadReference[];
}

export interface BusinessInfoModel{
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  uploadGroupId: string;
  uploadGroupData: StorageUploadReference[];
}
