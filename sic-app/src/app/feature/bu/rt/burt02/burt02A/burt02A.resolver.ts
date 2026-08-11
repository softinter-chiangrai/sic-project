// src/app/feature/bu/rt/burt02/burt02A/burt02A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Burt02AService } from './burt02A.service';
import { Burt02AForm } from './burt02A.form';
import { Burt02AModel, Burt02APageData } from './burt02A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const burt02AResolver: ResolveFn<Burt02APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Burt02AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Burt02AForm.createForm(fb);

  if (!id) {
    return { customerData: new SicFromData<Burt02AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getCustomerById(id));
    if (data) {
      form.patchValue(data);
      return { customerData: new SicFromData<Burt02AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
