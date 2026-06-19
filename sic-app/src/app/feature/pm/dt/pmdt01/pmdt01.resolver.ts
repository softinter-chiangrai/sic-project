import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { CustomerModel } from './pmdt01.model';
import { Pmdt01Form } from './pmdt01.form';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const pmdt01Resolver: ResolveFn<any> = (route, state) => {
  const fb = inject(FormBuilder);
  const form = Pmdt01Form.createForm(fb);
  return { customer: new SicFromData<CustomerModel>(form) };
};