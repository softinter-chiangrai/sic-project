import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ManagementService } from './management.service';
import { ManagementForm } from './management.form';
import { ManagementModel, ManagementPageData } from './management.model';
import { SicFromData } from '../core/model/sic-from-data';

export const managementResolver: ResolveFn<ManagementPageData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(ManagementService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = ManagementForm.createForm(fb);

  return {
    formData: new SicFromData<ManagementModel>(form),
  };
};
