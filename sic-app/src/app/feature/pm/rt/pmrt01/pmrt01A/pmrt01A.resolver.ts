// src/app/feature/pm/rt/pmrt01A/pmrt01A.resolver.ts

import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ResolveFn, Router } from '@angular/router';
import { catchError, EMPTY, map, tap } from 'rxjs';

import { SicFromData } from '../../../../../core/model/sic-from-data';
import { Pmrt01AForm } from './pmrt01A.form';
import { CustomerFormData, CustomerModel } from './pmrt01A.model';
import { Pmrt01AService } from './pmrt01A.service';
import { NavigationService } from '../../../../../core/services/navigation.service';

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
  const navigation = inject(NavigationService); // ✅ ใช้ const

  return service.getCustomer(route.params['id']).pipe(
    tap((data) => {
      console.log('✅ Resolver loaded customer data:', data);
      form.patchValue(data);
      form.updateValueAndValidity();
    }),
    map(() => ({
      customer: new SicFromData<CustomerModel>(form),
    })),
    catchError(() => {
      navigation.navigate(['/feature/pm/pmrt01']); // ✅ ใช้ navigation.navigate
      return EMPTY;
    }),
  );
};
