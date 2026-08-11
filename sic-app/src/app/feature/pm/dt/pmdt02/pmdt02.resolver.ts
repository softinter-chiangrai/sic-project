// src/app/feature/pm/dt/pmdt02/pmdt02.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, catchError, EMPTY } from 'rxjs';
import { Pmdt02Service } from './pmdt02.service';
import { Pmdt02Form } from './pmdt02.form';
import { PhaseModel, PhasePageData } from './pmdt02.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const pmdt02Resolver: ResolveFn<PhasePageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt02Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt02Form.createForm(fb);

  if (!id) {
    return { phaseData: new SicFromData<PhaseModel>(form) };
  }

  try {
    const detail = await lastValueFrom(service.getPhaseById(id));
    if (detail) {
      form.patchValue(detail as any);
      return {
        phaseData: new SicFromData<PhaseModel>(form, detail as any),
        phaseDetail: detail,
      };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
