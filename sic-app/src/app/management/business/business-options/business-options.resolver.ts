import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { BusinessOptionsService } from './business-options.service';
import { BusinessOptionsForm } from './business-options.form';
import { BusinessOptionsModel, BusinessOptionsPageData } from './business-options.model';
import { SicFromData } from '../../../core/model/sic-from-data';

export const business-optionsResolver: ResolveFn<BusinessOptionsPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(BusinessOptionsService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = BusinessOptionsForm.createForm(fb);

  return {
    formData: new SicFromData<BusinessOptionsModel>(form),
  };
};
