// src/app/feature/bu/rt/burt06/burt06.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Burt06Service } from './burt06.service';
import { Burt06PageData } from './burt06.model';

export const burt06Resolver: ResolveFn<Burt06PageData> = async () => {
  const service = inject(Burt06Service);

  try {
    const flows = await lastValueFrom(service.getFlows());
    return { flows: flows ?? [] };
  } catch (err) {
    console.error('Failed to load approval flows:', err);
    return { flows: [] };
  }
};
