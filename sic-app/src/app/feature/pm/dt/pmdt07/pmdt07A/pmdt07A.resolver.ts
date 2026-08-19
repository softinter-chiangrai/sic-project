// src/app/feature/pm/dt/pmdt07/pmdt07A/pmdt07A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt07Service } from '../pmdt07.service';
import { Pmdt07AForm } from './pmdt07A.form';
import { Pmdt07AModel, Pmdt07APageData } from './pmdt07A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt07AResolver: ResolveFn<Pmdt07APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt07Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt07AForm.createForm(fb);

  if (!id) {
    return { taskData: new SicFromData<Pmdt07AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getSpecification(id));
    if (data) {
      form.patchValue(data);
      return { taskData: new SicFromData<Pmdt07AModel>(form, data as unknown as Pmdt07AModel) };
    }
    router.navigate(['/feature/pm/pmdt07']);
    return EMPTY as any;
  } catch {
    router.navigate(['/feature/pm/pmdt07']);
    return EMPTY as any;
  }
};
