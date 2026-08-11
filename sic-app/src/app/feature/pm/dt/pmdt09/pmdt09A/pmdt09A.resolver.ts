// src/app/feature/pm/dt/pmdt09/pmdt09A/pmdt09A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt09AService } from './pmdt09A.service';
import { Pmdt09AForm } from './pmdt09A.form';
import { Pmdt09AModel, Pmdt09APageData } from './pmdt09A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt09AResolver: ResolveFn<Pmdt09APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt09AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt09AForm.createForm(fb);

  if (!id) {
    return { discussionData: new SicFromData<Pmdt09AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getDiscussionById(id));
    if (data) {
      form.patchValue(data);
      return { discussionData: new SicFromData<Pmdt09AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
