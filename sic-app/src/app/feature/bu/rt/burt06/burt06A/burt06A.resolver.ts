// src/app/feature/bu/rt/burt06/burt06A/burt06A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Burt06AService } from './burt06A.service';
import { Burt06AForm } from './burt06A.form';
import { Burt06AModel, Burt06APageData } from './burt06A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const burt06AResolver: ResolveFn<Burt06APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Burt06AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Burt06AForm.createForm(fb);

  if (!id) {
    return { flowData: new SicFromData<Burt06AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getFlow(id));
    if (data) {
      form.patchValue(data);
      return { flowData: new SicFromData<Burt06AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
