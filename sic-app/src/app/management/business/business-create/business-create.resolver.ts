import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ResolveFn } from '@angular/router';
import { SicFromData } from '../../../core/model/sic-from-data';
import { BusinessCreateModel, BusinessFormData } from './business-create.model';
import { BusinessCreateForm } from './business-create.form';

export const businessCreateResolver: ResolveFn<BusinessFormData> = () => {
  const fb = inject(FormBuilder);
  const form = BusinessCreateForm.createForm(fb);
  return { business: new SicFromData<BusinessCreateModel>(form) };
};
