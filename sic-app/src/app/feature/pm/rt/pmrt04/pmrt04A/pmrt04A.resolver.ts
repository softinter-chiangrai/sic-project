// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmrt04AService } from './pmrt04A.service';
import { Pmrt04AForm } from './pmrt04A.form';
import { Pmrt04AModel, Pmrt04APageData } from './pmrt04A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmrt04AResolver: ResolveFn<Pmrt04APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmrt04AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmrt04AForm.createForm(fb);

  if (!id) {
    return { installmentData: new SicFromData<Pmrt04AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getInstallmentById(id));
    if (data) {
      form.patchValue(data);
      return { installmentData: new SicFromData<Pmrt04AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
