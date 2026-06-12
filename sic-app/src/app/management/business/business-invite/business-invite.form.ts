import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from '../../../core/types/form.type';
import { InviteEmailModel, InviteTokenModel } from './business-invite.model';

export class BusinessInviteForm {
  static createEmailForm(fb: FormBuilder): FormGroup<ToForm<InviteEmailModel>> {
    return fb.group<ToForm<InviteEmailModel>>({
      roleId: fb.control(null, [Validators.required]),
      inviteEmail: fb.control(null, [Validators.required, Validators.email, Validators.maxLength(320)]),
    });
  }

  static createTokenForm(fb: FormBuilder): FormGroup<ToForm<InviteTokenModel>> {
    return fb.group<ToForm<InviteTokenModel>>({
      roleId: fb.control(null, [Validators.required]),
      maxUses: fb.control(null),
    });
  }
}
