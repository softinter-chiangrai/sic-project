// src/app/feature/pm/dt/pmdt06/pmdt06.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt06Service } from './pmdt06.service';
import { Pmdt06Form } from './pmdt06.form';
import { Pmdt06Model, Pmdt06PageData } from './pmdt06.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const pmdt06Resolver: ResolveFn<Pmdt06PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt06Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt06Form.createForm(fb);

  if (!id) {
    return { changeRequestData: new SicFromData<Pmdt06Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getChangeRequestById(id));
    if (data) {
      form.patchValue(data);
      return { changeRequestData: new SicFromData<Pmdt06Model>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
