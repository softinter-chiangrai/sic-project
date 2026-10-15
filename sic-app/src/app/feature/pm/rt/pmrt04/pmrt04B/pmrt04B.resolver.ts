// src/app/feature/pm/rt/pmrt04/pmrt04B/pmrt04B.resolver.ts
import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ResolveFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Pmrt04AService } from '../pmrt04A/pmrt04A.service';
import { Pmrt04BForm } from './pmrt04B.form';
import { Pmrt04BModel, Pmrt04BPageData } from './pmrt04B.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

export const pmrt04BResolver: ResolveFn<Pmrt04BPageData> = async (route) => {
  const fb = inject(FormBuilder);
  const service = inject(Pmrt04AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    router.navigate(['/not-found']);
    return { renewalData: new SicFromData<Pmrt04BModel>(Pmrt04BForm.createForm(fb)), originalContract: null };
  }

  try {
    const original = await lastValueFrom(service.getContract(id));
    if (!original) {
      router.navigate(['/not-found']);
      return { renewalData: new SicFromData<Pmrt04BModel>(Pmrt04BForm.createForm(fb)), originalContract: null };
    }

    // หาเลขสัญญาถัดไปที่ไม่ซ้ำ (เช่น ถ้า -R1 ถูกใช้/ยกเลิกไปแล้ว จะได้ -R2)
    let nextContractNo: string | undefined;
    try {
      const nextRes = await lastValueFrom(service.getNextRenewalNo(id));
      if (nextRes?.nextContractNo) {
        nextContractNo = nextRes.nextContractNo;
      }
    } catch {
      const chain = await lastValueFrom(service.getRenewalChain(id)).catch(() => []);
      const taken = (chain || []).map((c) => c.contractNo);
      nextContractNo = Pmrt04BForm.computeRenewalContractNo(original.contractNo, taken);
    }

    const form = Pmrt04BForm.createForm(fb, original);
    form.patchValue(Pmrt04BForm.buildDefaults(original, nextContractNo));

    return {
      renewalData: new SicFromData<Pmrt04BModel>(form, form.getRawValue() as Pmrt04BModel),
      originalContract: original,
    };
  } catch (err) {
    console.error('Failed to load contract for renewal:', err);
    router.navigate(['/not-found']);
    return { renewalData: new SicFromData<Pmrt04BModel>(Pmrt04BForm.createForm(fb)), originalContract: null };
  }
};
