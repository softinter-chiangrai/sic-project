// src/app/feature/pm/dt/pmdt09/pmdt09.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt09Service } from './pmdt09.service';
import { Pmdt09Form } from './pmdt09.form';
import { Pmdt09Model, Pmdt09PageData } from './pmdt09.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const pmdt09Resolver: ResolveFn<Pmdt09PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt09Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt09Form.createForm(fb);

  if (!id) {
    return { discussionData: new SicFromData<Pmdt09Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getDiscussionById(id));
    if (data) {
      form.patchValue(data);
      return { discussionData: new SicFromData<Pmdt09Model>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
