// src/app/feature/pm/dt/pmdt12/pmdt12B/pmdt12B.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Pmdt12BService } from './pmdt12B.service';
import { PmTestScenarioModel } from './pmdt12B.model';

export interface Pmdt12BPageData {
  data: PmTestScenarioModel | null;
}

export const pmdt12BResolver: ResolveFn<Pmdt12BPageData> = async (route) => {
  const service = inject(Pmdt12BService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    return { data: null };
  }

  try {
    const data = await lastValueFrom(service.getTestScenarioById(id));
    if (!data) {
      router.navigate(['/not-found']);
      return { data: null };
    }
    return { data };
  } catch (err) {
    console.error('Failed to load test scenario:', err);
    router.navigate(['/not-found']);
    return { data: null };
  }
};
