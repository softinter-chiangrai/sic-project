// src/app/feature/pm/rt/pmrt04/pmrt04.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmrt04Service } from './pmrt04.service';
import { Pmrt04Form } from './pmrt04.form';
import { Pmrt04Model, Pmrt04PageData } from './pmrt04.model';
import { SicFromData } from '../../../../core/model/sic-from-data';

export const pmrt04Resolver: ResolveFn<Pmrt04PageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmrt04Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  const form = Pmrt04Form.createForm(fb);

  if (!id) {
    return { contractData: new SicFromData<Pmrt04Model>(form) };
  }

  try {
    const data = await lastValueFrom(service.getContract(id));
    if (data) {
      form.patchValue(data as any);
      return { contractData: new SicFromData<Pmrt04Model>(form, data as any) };
    }
    router.navigate(['/not-found']);
    return EMPTY as any;
  } catch {
    router.navigate(['/not-found']);
    return EMPTY as any;
  }
};
