// src/app/feature/pm/dt/pmdt06/pmdt06A/pmdt06A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt06AService } from './pmdt06A.service';
import { Pmdt06AForm } from './pmdt06A.form';
import { Pmdt06AModel, Pmdt06APageData } from './pmdt06A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt06AResolver: ResolveFn<Pmdt06APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt06AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt06AForm.createForm(fb);

  if (!id) {
    return { diagramData: new SicFromData<Pmdt06AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getDiagramById(id));
    if (data) {
      form.patchValue(data);
      return { diagramData: new SicFromData<Pmdt06AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
