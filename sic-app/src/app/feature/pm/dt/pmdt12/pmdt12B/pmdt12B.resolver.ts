// src/app/feature/pm/dt/pmdt12/pmdt12B/pmdt12B.resolver.ts
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';

export const pmdt12BResolver: ResolveFn<any> = (route) => {
  const id = route.params['id'];
  return of({ id: id || null, loaded: true });
};
