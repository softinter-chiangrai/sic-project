// src/app/feature/bu/rt/burt03/burt03.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { burt03Service } from './burt03.service';
import { Burt03Form } from './burt03.form';
import { Burt03Model, Burt03PageData } from './burt03.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const burt03Resolver: ResolveFn<Burt03PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(burt03Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Burt03Form.createForm(fb);

  if (!id) {
    return { roleData: new SicFromData<Burt03Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getRole(id));
    if (data) {
      form.patchValue(data as any);
      return { roleData: new SicFromData<Burt03Model>(form, data as any) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
