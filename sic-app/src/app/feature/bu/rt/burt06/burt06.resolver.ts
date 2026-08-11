// src/app/feature/bu/rt/burt06/burt06.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Burt06Service } from './burt06.service';
import { Burt06Form } from './burt06.form';
import { Burt06Model, Burt06PageData } from './burt06.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const burt06Resolver: ResolveFn<Burt06PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Burt06Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Burt06Form.createForm(fb);

  if (!id) {
    return { memberData: new SicFromData<Burt06Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getFlow(id));
    if (data) {
      form.patchValue(data as any);
      return { memberData: new SicFromData<Burt06Model>(form, data as any) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
