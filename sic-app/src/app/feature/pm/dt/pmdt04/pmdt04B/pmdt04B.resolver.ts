// src/app/feature/pm/dt/pmdt04/pmdt04B/pmdt04B.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt04BService } from './pmdt04B.service';
import { Pmdt04BForm } from './pmdt04B.form';
import { Pmdt04BModel, Pmdt04BPageData } from './pmdt04B.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt04BResolver: ResolveFn<Pmdt04BPageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt04BService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt04BForm.createForm(fb);

  if (!id) {
    return { requirementData: new SicFromData<Pmdt04BModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getRequirementById(id));
    if (data) {
      form.patchValue(data);
      return { requirementData: new SicFromData<Pmdt04BModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
