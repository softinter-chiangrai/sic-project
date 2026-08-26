import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { lastValueFrom, EMPTY } from 'rxjs';
import { Pmrt04AService } from '../pmrt04A/pmrt04A.service';

export const pmrt04BResolver: ResolveFn<any> = async (route) => {
  const service = inject(Pmrt04AService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    return null;
  }

  try {
    const data = await lastValueFrom(service.getContract(id));
    if (data) {
      return data;
    }
    router.navigate(['/not-found']);
    return EMPTY;
  } catch (error) {
    console.error('pmrt04BResolver load contract error:', error);
    router.navigate(['/feature/pm/pmrt04']);
    return EMPTY;
  }
};
