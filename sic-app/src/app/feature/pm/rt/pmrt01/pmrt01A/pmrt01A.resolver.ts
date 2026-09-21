// src/app/feature/pm/rt/pmrt01A/pmrt01A.resolver.ts

import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY, map, timeout } from 'rxjs';

import { SicFromData } from '../../../../../core/model/sic-from-data';
import { Pmrt01AForm } from './pmrt01A.form';
import { CustomerFormData, CustomerModel } from './pmrt01A.model';
import { Pmrt01AService } from './pmrt01A.service';

// Create: ไม่โหลดข้อมูล
export const customerCreateResolver: ResolveFn<CustomerFormData> = () => {
  const fb = inject(FormBuilder);
  const form = Pmrt01AForm.createForm(fb);
  return { customer: new SicFromData<CustomerModel>(form) };
};

export const customerEditResolver: ResolveFn<CustomerFormData> = (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmrt01AService);
  const router = inject(Router);
  const form = Pmrt01AForm.createForm(fb);

  return service.getCustomer(route.params['id']).pipe(
    timeout(10000),
    map((data) => ({
      customer: new SicFromData<CustomerModel>(form, data),
    })),
    catchError((err) => {
      console.error('Failed to load customer:', err);
      router.navigate(['/not-found']);
      return EMPTY;
    }),
  );
};
