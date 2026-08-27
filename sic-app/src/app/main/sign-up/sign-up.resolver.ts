import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { SignUpService } from './sign-up.service';
import { SignUpForm } from './sign-up.form';
import { SignUpModel, SignUpPageData } from './sign-up.model';
import { SicFromData } from '../../core/model/sic-from-data';

export const signUpResolver: ResolveFn<SignUpPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(SignUpService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = SignUpForm.createForm(fb);

  return {
    formData: new SicFromData<SignUpModel>(form),
  };
};
