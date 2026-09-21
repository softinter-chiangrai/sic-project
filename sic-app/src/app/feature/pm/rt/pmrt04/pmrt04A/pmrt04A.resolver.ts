// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Pmrt04AService } from './pmrt04A.service';
import { Pmrt04AForm } from './pmrt04A.form';
import { ContractModel, Pmrt04APageData } from './pmrt04A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmrt04AResolver: ResolveFn<Pmrt04APageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmrt04AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    const form = Pmrt04AForm.createForm(fb, null);
    return { contractData: new SicFromData<ContractModel>(form), isEdit: false };
  }

  try {
    const data = await lastValueFrom(service.getContract(id));
    if (!data) {
      router.navigate(['/not-found']);
      return { contractData: new SicFromData<ContractModel>(Pmrt04AForm.createForm(fb, null)), isEdit: false };
    }
    const form = Pmrt04AForm.createForm(fb, data);
    return {
      contractData: new SicFromData<ContractModel>(form, form.getRawValue() as ContractModel),
      isEdit: true,
    };
  } catch (err) {
    console.error('Failed to load contract:', err);
    router.navigate(['/not-found']);
    return { contractData: new SicFromData<ContractModel>(Pmrt04AForm.createForm(fb, null)), isEdit: false };
  }
};
