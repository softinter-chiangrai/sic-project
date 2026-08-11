// src/app/feature/pm/dt/pmdt03/pmdt03A/pmdt03A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt03AService } from './pmdt03A.service';
import { Pmdt03AForm } from './pmdt03A.form';
import { Pmdt03AModel, Pmdt03APageData } from './pmdt03A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmdt03AResolver: ResolveFn<Pmdt03APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt03AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt03AForm.createForm(fb);

  if (!id) {
    return { approvalData: new SicFromData<Pmdt03AModel>(form) };
  }

  try {
    const data = await lastValueFrom(service.getApprovalDetail(id));
    if (data) {
      form.patchValue(data);
      return { approvalData: new SicFromData<Pmdt03AModel>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
