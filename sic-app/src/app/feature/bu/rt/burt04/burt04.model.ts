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

export interface TeamMember {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  roleIds?: string[];
  roleNames?: string[];
  isActive: boolean;
  isDefault: boolean;
  createdDate: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ComboboxRole {
  value: string;
  text: string;
}

export interface MemberWithUI extends TeamMember {
  userName: string;
  userEmail: string;
  roleNames: string[];
  isDefault: boolean;
}
