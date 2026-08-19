// src/app/feature/pm/dt/pmdt08/pmdt08.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';

import { SicFromData } from '../../../../core/model/sic-from-data';
import { Pmdt08Form } from './pmdt08.form';
import { Pmdt08PageData, Pmdt08Model } from './pmdt08.model';
import { Pmdt08Service } from './pmdt08.service';

export const pmdt08Resolver: ResolveFn<Pmdt08PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt08Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt08Form.createForm(fb);

  if (!id) {
    return { discussionData: new SicFromData<Pmdt08Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getDiscussionById(id));
    if (data) {
      form.patchValue(data);
      return { discussionData: new SicFromData<Pmdt08Model>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
