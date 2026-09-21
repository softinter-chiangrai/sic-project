// src/app/feature/pm/dt/pmdt06/pmdt06A/pmdt06A.resolver.ts
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResolveFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ChangeRequestFormModel, Pmdt06APageData } from './pmdt06A.model';

export const pmdt06AResolver: ResolveFn<Pmdt06APageData> = async (route) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const id = route.paramMap.get('id');
  const baseUrl = environment.apiBaseUrl + '/api/pm/change-requests';

  if (!id) {
    return { data: null };
  }

  try {
    const data = await lastValueFrom(http.get<ChangeRequestFormModel>(`${baseUrl}/${id}`));
    if (!data) {
      router.navigate(['/not-found']);
      return { data: null };
    }
    return { data };
  } catch (err) {
    console.error('Failed to load change request:', err);
    router.navigate(['/not-found']);
    return { data: null };
  }
};
