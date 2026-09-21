// src/app/feature/pm/rt/pmrt03/pmrt03.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Pmrt03Service } from './pmrt03.service';
import { Pmrt03PageData } from './pmrt03.model';

export const pmrt03Resolver: ResolveFn<Pmrt03PageData> = async (route) => {
  const service = inject(Pmrt03Service);
  const id = route.queryParamMap.get('projectId') || route.paramMap.get('id') || '';

  if (!id) {
    return { dashboard: null, projectId: '' };
  }

  try {
    const data = await lastValueFrom(service.getDashboard(id));
    return { dashboard: data ?? null, projectId: id };
  } catch (err) {
    console.error('Failed to load project dashboard:', err);
    return { dashboard: null, projectId: id };
  }
};
