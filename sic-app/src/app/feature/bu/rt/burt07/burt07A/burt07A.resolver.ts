// src/app/feature/bu/rt/burt07/burt07A/burt07A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Burt07Service } from '../burt07.service';
import { Burt07AForm } from './burt07A.form';
import { Burt07AModel, Burt07APageData } from './burt07A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const burt07AResolver: ResolveFn<Burt07APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Burt07Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    const form = Burt07AForm.createForm(fb, null);
    return { modelData: new SicFromData<Burt07AModel>(form), isEdit: false };
  }

  try {
    const model = await lastValueFrom(service.getModel(id));
    if (!model) {
      router.navigate(['/not-found']);
      return { modelData: new SicFromData<Burt07AModel>(Burt07AForm.createForm(fb, null)), isEdit: false };
    }
    const form = Burt07AForm.createForm(fb, model);
    return {
      modelData: new SicFromData<Burt07AModel>(form, form.getRawValue() as Burt07AModel),
      isEdit: true,
    };
  } catch (err) {
    console.error('Failed to load AI model config:', err);
    router.navigate(['/not-found']);
    return { modelData: new SicFromData<Burt07AModel>(Burt07AForm.createForm(fb, null)), isEdit: false };
  }
};
