import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ResolveFn } from '@angular/router';
import { BusinessJoinFormData } from './business-join.model';
import { BusinessJoinForm } from './business-join.form';

export const businessJoinResolver: ResolveFn<BusinessJoinFormData> = () => {
  const fb = inject(FormBuilder);
  return {
    joinForm: BusinessJoinForm.createForm(fb),
  };
};
