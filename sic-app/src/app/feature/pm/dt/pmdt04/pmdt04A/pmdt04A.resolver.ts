// src/app/feature/pm/dt/pmdt04/pmdt04A/pmdt04A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Pmdt04AForm } from './pmdt04A.form';
import { Pmdt04AModel, Pmdt04APageData } from './pmdt04A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt04AResolver: ResolveFn<Pmdt04APageData> = () => {
  const fb = inject(FormBuilder);
  const form = Pmdt04AForm.createForm(fb);
  return { exportData: new SicFromData<Pmdt04AModel>(form) };
};
