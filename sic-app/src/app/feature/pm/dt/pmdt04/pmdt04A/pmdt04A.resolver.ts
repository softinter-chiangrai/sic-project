// src/app/feature/pm/dt/pmdt04/pmdt04A/pmdt04A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt04AService } from './pmdt04A.service';
import { Pmdt04AForm } from './pmdt04A.form';
import { Pmdt04AModel, Pmdt04APageData } from './pmdt04A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt04AResolver: ResolveFn<Pmdt04APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt04AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt04AForm.createForm(fb);

  if (!id) {
    return { requirementData: new SicFromData<Pmdt04AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getRequirementById(id));
    if (data) {
      form.patchValue(data);
      return { requirementData: new SicFromData<Pmdt04AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
