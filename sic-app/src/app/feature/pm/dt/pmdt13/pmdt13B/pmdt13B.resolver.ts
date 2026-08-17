// src/app/feature/pm/dt/pmdt13/pmdt13B/pmdt13B.resolver.ts
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';

export const pmdt13BResolver: ResolveFn<any> = (route) => {
  const id = route.params['id'];
  return of({ id: id || null, loaded: true });
};
