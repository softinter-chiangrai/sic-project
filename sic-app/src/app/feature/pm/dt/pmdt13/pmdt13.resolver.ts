// src/app/feature/pm/dt/pmdt13/pmdt13.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';

export const pmdt13Resolver: ResolveFn<any> = (route) => {
  return of({ loaded: true });
};
