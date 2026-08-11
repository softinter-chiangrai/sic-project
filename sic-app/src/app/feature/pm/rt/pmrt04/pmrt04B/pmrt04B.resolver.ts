// src/app/feature/pm/rt/pmrt04/pmrt04B/pmrt04B.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmrt04BService } from './pmrt04B.service';
import { Pmrt04BForm } from './pmrt04B.form';
import { Pmrt04BModel, Pmrt04BPageData } from './pmrt04B.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmrt04BResolver: ResolveFn<Pmrt04BPageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmrt04BService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmrt04BForm.createForm(fb);

  if (!id) {
    return { deliverableData: new SicFromData<Pmrt04BModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getDeliverableById(id));
    if (data) {
      form.patchValue(data);
      return { deliverableData: new SicFromData<Pmrt04BModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
