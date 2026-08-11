// src/app/feature/pm/rt/pmrt01/pmrt01.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmrt01Service } from './pmrt01.service';
import { Pmrt01Form } from './pmrt01.form';
import { Pmrt01Model, Pmrt01PageData } from './pmrt01.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const pmrt01Resolver: ResolveFn<Pmrt01PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmrt01Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmrt01Form.createForm(fb);

  if (!id) {
    return { customerData: new SicFromData<Pmrt01Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getCustomer(id));
    if (data) {
      form.patchValue(data as any);
      return { customerData: new SicFromData<Pmrt01Model>(form, data as any) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
