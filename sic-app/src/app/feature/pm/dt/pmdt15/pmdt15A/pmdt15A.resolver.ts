import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Pmdt15AService } from './pmdt15A.service';
import { PmUserManualModel } from './pmdt15A.model';

export interface Pmdt15APageData {
  data: PmUserManualModel | null;
}

export const pmdt15AResolver: ResolveFn<Pmdt15APageData> = async (route) => {
  const service = inject(Pmdt15AService);
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
    console.error('Failed to load user manual:', err);
    router.navigate(['/not-found']);
    return { data: null };
  }
};
