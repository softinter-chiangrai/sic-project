// src/app/feature/pm/dt/pmdt04/pmdt04A/pmdt04A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY, timeout, catchError, throwError } from 'rxjs';
import { Pmdt04AForm } from './pmdt04A.form';
import { Pmdt04APageData, RequirementModel } from './pmdt04A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
// The real requirement CRUD service lives inline in pmdt04A.component.ts
// (pmdt04A.service.ts is a separate, unrelated export-only service kept as-is).
import { Pmdt04AService } from './pmdt04A.component';

export const pmdt04AResolver: ResolveFn<Pmdt04APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt04AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt04AForm.createForm(fb);

  if (!id) {
    return { requirementData: new SicFromData<RequirementModel>(form) };
  }

  try {
    const data = await lastValueFrom(
      service.getRequirement(id).pipe(
        timeout(15000),
        catchError((err) => throwError(() => err))
      )
    );
    if (data) {
      form.patchValue(data as any);
      return {
        requirementData: new SicFromData<RequirementModel>(form, data),
        requirementDetail: data,
      };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch (err) {
    console.error('pmdt04AResolver error:', err);
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
