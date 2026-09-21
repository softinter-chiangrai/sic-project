// src/app/feature/bu/rt/burt06/burt06A/burt06A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Burt06Service } from '../burt06.service';
import { Burt06AForm } from './burt06A.form';
import { Burt06AModel, Burt06APageData } from './burt06A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const burt06AResolver: ResolveFn<Burt06APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Burt06Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    const form = Burt06AForm.createForm(fb, null);
    return { flowData: new SicFromData<Burt06AModel>(form), isEdit: false };
  }

  try {
    const flow = await lastValueFrom(service.getFlow(id));
    if (!flow) {
      router.navigate(['/not-found']);
      return { flowData: new SicFromData<Burt06AModel>(Burt06AForm.createForm(fb, null)), isEdit: false };
    }
    const form = Burt06AForm.createForm(fb, flow);
    return {
      flowData: new SicFromData<Burt06AModel>(form, form.getRawValue() as Burt06AModel),
      isEdit: true,
    };
  } catch (err) {
    console.error('Failed to load approval flow:', err);
    router.navigate(['/not-found']);
    return { flowData: new SicFromData<Burt06AModel>(Burt06AForm.createForm(fb, null)), isEdit: false };
  }
};
