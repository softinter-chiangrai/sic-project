// src/app/feature/bu/rt/burt05/burt05.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { burt05Service } from './burt05.service';
import { Burt05Form } from './burt05.form';
import { Burt05Model, Burt05PageData } from './burt05.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const burt05Resolver: ResolveFn<Burt05PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(burt05Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Burt05Form.createForm(fb);

  if (!id) {
    return { projectData: new SicFromData<Burt05Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getProgram(id));
    if (data) {
      form.patchValue(data as any);
      return { projectData: new SicFromData<Burt05Model>(form, data as any) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
