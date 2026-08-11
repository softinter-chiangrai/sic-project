// src/app/feature/pm/dt/pmdt01/pmdt01A/pmdt01A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt01AService } from './pmdt01A.service';
import { Pmdt01AForm } from './pmdt01A.form';
import { Pmdt01AModel, Pmdt01APageData } from './pmdt01A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt01AEditResolver: ResolveFn<Pmdt01APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt01AService);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  const form = Pmdt01AForm.createForm(fb);

  try {
    const data = await lastValueFrom(service.getPhaseById(id));
    if (data) {
      form.patchValue(data);
      return { phaseData: new SicFromData<Pmdt01AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};

export const pmdt01ACreateResolver: ResolveFn<Pmdt01APageData> = () => {
  const fb = inject(FormBuilder);
  const form = Pmdt01AForm.createForm(fb);
  return { phaseData: new SicFromData<Pmdt01AModel>(form) };
};
