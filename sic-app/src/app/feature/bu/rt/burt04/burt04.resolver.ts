// src/app/feature/bu/rt/burt04/burt04.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { burt04Service } from './burt04.service';
import { Burt04Form } from './burt04.form';
import { Burt04Model, Burt04PageData } from './burt04.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const burt04Resolver: ResolveFn<Burt04PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(burt04Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Burt04Form.createForm(fb);

  if (!id) {
    return { teamData: new SicFromData<Burt04Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getMemberById(id));
    if (data) {
      form.patchValue(data as any);
      return { teamData: new SicFromData<Burt04Model>(form, data as any) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
