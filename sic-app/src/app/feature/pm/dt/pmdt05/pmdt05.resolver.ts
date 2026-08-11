// src/app/feature/pm/dt/pmdt05/pmdt05.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Pmdt05Form } from './pmdt05.form';
import { Pmdt05Model, Pmdt05PageData } from './pmdt05.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const pmdt05Resolver: ResolveFn<Pmdt05PageData> = () => {
  const fb = inject(FormBuilder);
  const form = Pmdt05Form.createForm(fb);
  return { exportData: new SicFromData<Pmdt05Model>(form) };
};
