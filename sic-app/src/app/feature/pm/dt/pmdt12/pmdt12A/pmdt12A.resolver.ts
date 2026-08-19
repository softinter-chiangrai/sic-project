// src/app/feature/pm/dt/pmdt12/pmdt12A/pmdt12A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';

export const pmdt12AResolver: ResolveFn<any> = (route) => {
  const id = route.params['id'];
  return of({ id: id || null, loaded: true });
};
