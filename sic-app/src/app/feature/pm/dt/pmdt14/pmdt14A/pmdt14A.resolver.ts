import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Pmdt14AService } from './pmdt14A.service';
import { PmDeliveryModel } from './pmdt14A.model';

export interface Pmdt14APageData {
  data: PmDeliveryModel | null;
}

export const pmdt14AResolver: ResolveFn<Pmdt14APageData> = async (route) => {
  const service = inject(Pmdt14AService);
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
    console.error('Failed to load delivery:', err);
    router.navigate(['/not-found']);
    return { data: null };
  }
};
