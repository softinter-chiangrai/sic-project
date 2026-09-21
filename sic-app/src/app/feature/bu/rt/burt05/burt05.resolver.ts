// src/app/feature/bu/rt/burt05/burt05.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { burt05Service } from './burt05.service';
import { Burt05PageData } from './burt05.model';

export const burt05Resolver: ResolveFn<Burt05PageData> = async () => {
  const service = inject(burt05Service);

  try {
    const programs = await lastValueFrom(service.getPrograms());
    return { programs: programs ?? [] };
  } catch (err) {
    console.error('Failed to load programs:', err);
    return { programs: [] };
  }
};
