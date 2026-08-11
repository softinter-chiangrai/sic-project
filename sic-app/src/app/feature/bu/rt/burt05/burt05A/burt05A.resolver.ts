// src/app/feature/bu/rt/burt05/burt05A/burt05A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Burt05AService } from './burt05A.service';
import { Burt05AForm } from './burt05A.form';
import { Burt05AModel, Burt05APageData } from './burt05A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const burt05AResolver: ResolveFn<Burt05APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Burt05AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Burt05AForm.createForm(fb);

  if (!id) {
    return { projectData: new SicFromData<Burt05AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getProgram(id));
    if (data) {
      form.patchValue(data);
      return { projectData: new SicFromData<Burt05AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
