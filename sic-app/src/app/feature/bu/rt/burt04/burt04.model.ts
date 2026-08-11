// src/app/feature/bu/rt/burt04/burt04.model.ts
import { SicBaseStateModel } from '../../../../core/model/sic-base-model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export interface Burt04Model extends SicBaseStateModel {
  id: string;
  teamCode: string;
  teamName: string;
  description?: string;
  leaderId?: string;
  memberCount?: number;
}

export interface Burt04PageData {
  teamData: SicFromData<Burt04Model>;
}
