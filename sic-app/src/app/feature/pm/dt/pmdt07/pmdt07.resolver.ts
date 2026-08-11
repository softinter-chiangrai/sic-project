// src/app/feature/pm/dt/pmdt07/pmdt07.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt07Service } from './pmdt07.service';
import { Pmdt07Form } from './pmdt07.form';
import { Pmdt07Model, Pmdt07PageData } from './pmdt07.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const pmdt07Resolver: ResolveFn<Pmdt07PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt07Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt07Form.createForm(fb);

  if (!id) {
    return { changeRequestData: new SicFromData<Pmdt07Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getChangeRequestById(id));
    if (data) {
      form.patchValue(data);
      return { changeRequestData: new SicFromData<Pmdt07Model>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
