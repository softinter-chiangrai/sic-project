// src/app/feature/bu/rt/burt07/burt07.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';

export interface Burt07Model extends SicBaseStateModel {
  id: string;
}

export interface Burt07PageData {
  models: AiModelConfig[];
}

export interface AiModelConfig {
  id?: string;
  modelCode: string;
  displayName: string;
  providerLabel: string;
  apiFormat: 'CLAUDE' | 'OPENAI_COMPATIBLE';
  apiUrl: string;
  apiKeyMasked?: string | null;
  hasApiKey?: boolean;
  // เขียนเท่านั้น (ไม่เคยถูกส่งกลับมาจาก backend) — เว้นว่างตอนแก้ไข = ไม่เปลี่ยน key เดิม
  apiKey?: string;
  maxTokens?: number;
  description?: string;
  icon?: string;
  isRecommended: boolean;
  isDefault: boolean;
  isActive: boolean;
  sortOrder?: number;
  rowVersion?: number;
  updatedDate?: string;
}
