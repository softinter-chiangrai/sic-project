// src/app/feature/bu/rt/burt07/burt07.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Burt07Service } from './burt07.service';
import { Burt07PageData } from './burt07.model';

export const burt07Resolver: ResolveFn<Burt07PageData> = () => {
  const service = inject(Burt07Service);

  return service.getModels().pipe(
    map((models) => ({ models: models || [] })),
    catchError((err) => {
      console.error('Failed to load AI model configs:', err);
      return of({ models: [] });
    }),
  );
};
