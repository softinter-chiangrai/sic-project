// src/app/feature/pm/dt/pmdt12/pmdt12.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';

export const pmdt12Resolver: ResolveFn<any> = (route) => {
  return of({ loaded: true });
};
