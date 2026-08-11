// src/app/feature/bu/rt/burt02/burt02.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Burt02Service } from './burt02.service';
import { Burt02Form } from './burt02.form';
import { Burt02Model, Burt02PageData } from './burt02.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const burt02Resolver: ResolveFn<Burt02PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Burt02Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Burt02Form.createForm(fb);

  if (!id) {
    return { customerData: new SicFromData<Burt02Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getCustomerById(id));
    if (data) {
      form.patchValue(data);
      return { customerData: new SicFromData<Burt02Model>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
