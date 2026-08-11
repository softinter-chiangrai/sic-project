// src/app/feature/pm/dt/pmdt01/pmdt01.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt01Service } from './pmdt01.service';
import { Pmdt01Form } from './pmdt01.form';
import { PhaseModel, PhasePageData } from './pmdt01.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const pmdt01EditResolver: ResolveFn<PhasePageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt01Service);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  const form = Pmdt01Form.createForm(fb);

  try {
    const data = await lastValueFrom(service.getPhaseById(id));
    if (data) {
      form.patchValue(data);
      return { phaseData: new SicFromData<PhaseModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};

export const pmdt01CreateResolver: ResolveFn<PhasePageData> = () => {
  const fb = inject(FormBuilder);
  const form = Pmdt01Form.createForm(fb);
  return { phaseData: new SicFromData<PhaseModel>(form) };
};