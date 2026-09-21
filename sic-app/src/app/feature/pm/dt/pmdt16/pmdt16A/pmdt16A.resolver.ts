import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Pmdt16AService } from './pmdt16A.service';
import { PmInvoiceModel } from './pmdt16A.model';

export interface Pmdt16APageData {
  data: PmInvoiceModel | null;
}

export const pmdt16AResolver: ResolveFn<Pmdt16APageData> = async (route) => {
  const service = inject(Pmdt16AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    return { data: null };
  }

  try {
    const data = await lastValueFrom(service.getById(id));
    if (!data) {
      router.navigate(['/not-found']);
      return { data: null };
    }
    return { data };
  } catch (err) {
    console.error('Failed to load invoice:', err);
    router.navigate(['/not-found']);
    return { data: null };
  }
};
