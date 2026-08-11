// src/app/feature/pm/dt/pmdt07/pmdt07A/pmdt07A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt07AService } from './pmdt07A.service';
import { Pmdt07AForm } from './pmdt07A.form';
import { Pmdt07AModel, Pmdt07APageData } from './pmdt07A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt07AResolver: ResolveFn<Pmdt07APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt07AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt07AForm.createForm(fb);

  if (!id) {
    return { changeRequestData: new SicFromData<Pmdt07AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getChangeRequestById(id));
    if (data) {
      form.patchValue(data);
      return { changeRequestData: new SicFromData<Pmdt07AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
