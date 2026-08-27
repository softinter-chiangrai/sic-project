import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { BusinessService } from './business.service';
import { BusinessForm } from './business.form';
import { BusinessModel, BusinessPageData } from './business.model';
import { SicFromData } from '../../core/model/sic-from-data';

export const businessResolver: ResolveFn<BusinessPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(BusinessService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = BusinessForm.createForm(fb);

  return {
    formData: new SicFromData<BusinessModel>(form),
  };
};
