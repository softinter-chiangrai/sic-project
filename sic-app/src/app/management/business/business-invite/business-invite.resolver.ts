import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ResolveFn } from '@angular/router';
import { BusinessInviteFormData } from './business-invite.model';
import { BusinessInviteForm } from './business-invite.form';

export const businessInviteResolver: ResolveFn<BusinessInviteFormData> = () => {
  const fb = inject(FormBuilder);
  return {
    emailForm: BusinessInviteForm.createEmailForm(fb),
    tokenForm: BusinessInviteForm.createTokenForm(fb),
  };
};
