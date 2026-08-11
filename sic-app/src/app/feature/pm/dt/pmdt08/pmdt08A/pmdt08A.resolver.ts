// src/app/feature/pm/dt/pmdt08/pmdt08A/pmdt08A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt08AService } from './pmdt08A.service';
import { Pmdt08AForm } from './pmdt08A.form';
import { Pmdt08AModel, Pmdt08APageData } from './pmdt08A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt08AResolver: ResolveFn<Pmdt08APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt08AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt08AForm.createForm(fb);

  if (!id) {
    return { taskData: new SicFromData<Pmdt08AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getTaskById(id));
    if (data) {
      form.patchValue(data);
      return { taskData: new SicFromData<Pmdt08AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
