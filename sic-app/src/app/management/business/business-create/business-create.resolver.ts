import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ResolveFn } from '@angular/router';
import { SicFromData } from '../../../core/model/sic-from-data';
import { ProfileModel } from '../../profile/profile.model';
import { BusinessCreateForm } from './business-create.form';

export const businessCreateResolver: ResolveFn<BusinessCreateForm> = (route, state) => {
  const fb = inject(FormBuilder);
  const form = BusinessCreateForm.createForm(fb);
  return { business: new SicFromData<ProfileModel>(form)};
};
