// src/app/feature/bu/rt/burt04/burt04A/burt04A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Burt04AService } from './burt04A.service';
import { Burt04AForm } from './burt04A.form';
import { Burt04AModel, Burt04APageData } from './burt04A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const burt04AResolver: ResolveFn<Burt04APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Burt04AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Burt04AForm.createForm(fb);

  if (!id) {
    return { memberData: new SicFromData<Burt04AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getMemberById(id));
    if (data) {
      form.patchValue(data);
      return { memberData: new SicFromData<Burt04AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
