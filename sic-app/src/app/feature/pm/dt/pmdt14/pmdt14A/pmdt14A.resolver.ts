import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';

export const pmdt14AResolver: ResolveFn<any> = (route) => {
  const id = route.params['id'];
  return of({ id: id || null, loaded: true });
};
