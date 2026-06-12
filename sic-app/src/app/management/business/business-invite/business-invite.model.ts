import { FormGroup } from '@angular/forms';
import { ToForm } from '../../../core/types/form.type';

export interface InviteResponse {
  id: string;
  inviteType: string;
  inviteEmail?: string;
  inviteToken?: string;
  roleId: string;
  roleCode: string;
  roleName: string;
  isActivated: boolean;
  maxUses?: number;
  useCount: number;
  createdDate: string;
}

export interface CreateInviteRequest {
  roleId: string;
  inviteType: string;
  inviteEmail?: string;
  maxUses?: number;
}

export interface InviteEmailModel {
  roleId: string;
  inviteEmail: string;
}

export interface InviteTokenModel {
  roleId: string;
  maxUses: number | null;
}

export interface BusinessInviteFormData {
  emailForm: FormGroup<ToForm<InviteEmailModel>>;
  tokenForm: FormGroup<ToForm<InviteTokenModel>>;
}
