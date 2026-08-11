// src/app/feature/pm/rt/pmrt02/pmrt02.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';

import { Pmrt02Form } from './pmrt02.form';
import { Pmrt02Model, Pmrt02PageData } from './pmrt02.model';
import { SicFromData } from '../../../../core/model/sic-from-data';
import { Pmrt02Service } from './pmrt02.service';

export const pmrt02Resolver: ResolveFn<Pmrt02PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmrt02Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmrt02Form.createForm(fb);

  if (!id) {
    return { projectData: new SicFromData<Pmrt02Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getProject(id));
    if (data) {
      form.patchValue(data as any);
      return { projectData: new SicFromData<Pmrt02Model>(form, data as any) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
