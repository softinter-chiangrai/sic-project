// src/app/feature/pm/dt/pmdt05/pmdt05.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt05Service } from './pmdt05.service';
import { Pmdt05Form } from './pmdt05.form';
import { Pmdt05Model, Pmdt05PageData } from './pmdt05.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const pmdt05Resolver: ResolveFn<Pmdt05PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt05Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt05Form.createForm(fb);

  if (!id) {
    return { diagramData: new SicFromData<Pmdt05Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getDiagramById(id));
    if (data) {
      form.patchValue(data);
      return { diagramData: new SicFromData<Pmdt05Model>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
