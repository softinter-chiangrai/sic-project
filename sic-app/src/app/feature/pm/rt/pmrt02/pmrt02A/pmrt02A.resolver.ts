// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmrt02AService } from './pmrt02A.service';
import { Pmrt02AForm } from './pmrt02A.form';
import { Pmrt02AModel, Pmrt02APageData } from './pmrt02A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmrt02AResolver: ResolveFn<Pmrt02APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmrt02AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmrt02AForm.createForm(fb);

  if (!id) {
    return { projectData: new SicFromData<Pmrt02AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getProject(id));
    if (data) {
      form.patchValue(data as any);
      return { projectData: new SicFromData<Pmrt02AModel>(form, data as any) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
