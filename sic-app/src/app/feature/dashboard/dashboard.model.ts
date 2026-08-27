import { SicBaseStateModel } from '../../core/model/sic-base-model';
import { SicFromData } from '../../core/model/sic-from-data';
import {
  BusinessInfoModel,
  MenuItemModel,
  ProfileInfoModel,
} from '../../core/component/sic-sidebar/sic-sidebar.model';
import { PmCustomerProject } from '../pm/rt/pmrt02/pmrt02.model';
import { DesignReview } from '../pm/dt/pmdt09/pmdt09.model';
import { AuditLog } from '../pm/dt/pmdt20/audit-log.service';

export interface SmartProgramTile {
  code: string;
  name: string;
  path: string;
  icon: string;
  category: string;
  badgeCount?: number;
  badgeType?: 'danger' | 'warning' | 'info' | 'success';
}

export interface SdlcStageSummary {
  stage: string;
  thStage: string;
  icon: string;
  count: number;
  colorClass: string;
  bgClass: string;
}

export interface DashboardModel extends SicBaseStateModel {
  id?: string;
  searchQuery?: string;
  selectedCategory?: string;
  isAdmin?: boolean;
}

export interface DashboardPageData {
  formData?: SicFromData<DashboardModel>;
  profile?: ProfileInfoModel | null;
  business?: BusinessInfoModel | null;
  rawMenu?: MenuItemModel[];
  projects?: PmCustomerProject[];
  reviews?: DesignReview[];
  auditLogs?: AuditLog[];
}

export interface DashboardPreloadData {
  profile: ProfileInfoModel | null;
  business: BusinessInfoModel | null;
  rawMenu: MenuItemModel[];
  projects: PmCustomerProject[];
  reviews: DesignReview[];
  auditLogs: AuditLog[];
}

