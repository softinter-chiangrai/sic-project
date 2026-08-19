// src/app/feature/pm/dt/pmdt06/pmdt06A/pmdt06A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt05AService } from './pmdt05A.service';
import { Pmdt05AForm } from './pmdt05A.form';
import { Pmdt05AModel, Pmdt05APageData } from './pmdt05A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt05AResolver: ResolveFn<Pmdt05APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt05AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt05AForm.createForm(fb);

  if (!id) {
    return { diagramData: new SicFromData<Pmdt05AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getDiagramById(id));
    if (data) {
      form.patchValue(data);
      return { diagramData: new SicFromData<Pmdt05AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
