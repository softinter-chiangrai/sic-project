import { StorageUploadReference } from "../sic-upload/sic-upload.component";

export interface MenuItemModel {
  name: string;
  icon?: string;
  path?: string;
  code: string;
  isBack: boolean;
  isSearch: boolean;
  isAdd: boolean;
  isSave: boolean;
  isRemove: boolean;
  isPrint: boolean;
  children: MenuItemModel[];
}

export interface MenuActionFlags {
  isBack: boolean;
  isSearch: boolean;
  isAdd: boolean;
  isSave: boolean;
  isRemove: boolean;
  isPrint: boolean;
}

export interface ProfileInfoModel {
  id: string;
  name: string;
  uploadGroupId: string;
  uploadGroupData: StorageUploadReference[];
}

export interface BusinessInfoModel {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  uploadGroupId: string;
  uploadGroupData: StorageUploadReference[];
}

export interface SidebarItem {
  code: string;
  label: string;
  icon?: string;
  path?: string;
  badge?: string;
  notification?: boolean;
  children?: SidebarItem[];
}

export interface ISidebarAction {
  onBack?(): void;
  onSearch?(): void;
  onAdd?(): void;
  onSave?(): void;
  onPrint?(): void;
}
