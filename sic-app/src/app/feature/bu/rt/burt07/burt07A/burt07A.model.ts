// src/app/feature/bu/rt/burt07/burt07A/burt07A.model.ts
import { SicBaseStateModel } from '../../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export interface Burt07AModel extends SicBaseStateModel {
  id: string;
  modelCode: string;
  displayName: string;
  providerLabel: string;
  apiFormat: string;
  apiUrl: string;
  apiKey: string;
  hasApiKey: boolean;
  maxTokens: number;
  description?: string;
  icon?: string;
  isRecommended: boolean;
  isDefault: boolean;
  isActive: boolean;
}

export interface Burt07APageData {
  modelData: SicFromData<Burt07AModel>;
  isEdit: boolean;
}
