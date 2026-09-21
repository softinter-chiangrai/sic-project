// src/app/feature/pm/dt/pmdt12/pmdt12A/pmdt12A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Pmdt12Service } from '../pmdt12.service';
import { PmTestCaseModel } from './pmdt12A.model';

export interface Pmdt12APageData {
  data: PmTestCaseModel | null;
}

export const pmdt12AResolver: ResolveFn<Pmdt12APageData> = async (route) => {
  const service = inject(Pmdt12Service);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    return { data: null };
  }

  try {
    const data = await lastValueFrom(service.getTestCaseById(id));
    if (!data) {
      router.navigate(['/not-found']);
      return { data: null };
    }
    return { data };
  } catch (err) {
    console.error('Failed to load test case:', err);
    router.navigate(['/not-found']);
    return { data: null };
  }
};
