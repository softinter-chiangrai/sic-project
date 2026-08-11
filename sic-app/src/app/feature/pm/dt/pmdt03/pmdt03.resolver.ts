// src/app/feature/pm/dt/pmdt03/pmdt03.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmdt03Service } from './pmdt03.service';
import { Pmdt03Form } from './pmdt03.form';
import { Pmdt03Model, Pmdt03PageData } from './pmdt03.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const pmdt03Resolver: ResolveFn<Pmdt03PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmdt03Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmdt03Form.createForm(fb);

  if (!id) {
    return { approvalData: new SicFromData<Pmdt03Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getApprovalById(id));
    if (data) {
      form.patchValue(data);
      return { approvalData: new SicFromData<Pmdt03Model>(form, data) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
