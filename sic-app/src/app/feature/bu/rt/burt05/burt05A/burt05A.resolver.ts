// src/app/feature/bu/rt/burt05/burt05A/burt05A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { burt05Service } from '../burt05.service';
import { Burt05AForm } from './burt05A.form';
import { Burt05AModel, Burt05APageData } from './burt05A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const burt05AResolver: ResolveFn<Burt05APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(burt05Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Burt05AForm.createForm(fb);

  try {
    const programs = await lastValueFrom(service.getPrograms());

    if (!id) {
      return { programData: new SicFromData<Burt05AModel>(form), programs };
    }

    const data = await lastValueFrom(service.getProgram(id));
    if (data) {
      form.patchValue(data as any);
      return { programData: new SicFromData<Burt05AModel>(form, data as any), programs };
    }
    router.navigate(['/not-found']);
    return { programData: new SicFromData<Burt05AModel>(form), programs: [] };
  } catch (err) {
    console.error('Failed to load program:', err);
    router.navigate(['/not-found']);
    return { programData: new SicFromData<Burt05AModel>(form), programs: [] };
  }
};
