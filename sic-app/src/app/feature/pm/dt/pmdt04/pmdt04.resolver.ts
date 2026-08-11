// src/app/feature/pm/dt/pmdt04/pmdt04.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt04Service } from './pmdt04.service';
import { Pmdt04Form } from './pmdt04.form';
import { Pmdt04Model, Pmdt04PageData } from './pmdt04.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const pmdt04Resolver: ResolveFn<Pmdt04PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt04Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt04Form.createForm(fb);

  if (!id) {
    return { requirementData: new SicFromData<Pmdt04Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getRequirementById(id));
    if (data) {
      form.patchValue(data);
      return { requirementData: new SicFromData<Pmdt04Model>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
