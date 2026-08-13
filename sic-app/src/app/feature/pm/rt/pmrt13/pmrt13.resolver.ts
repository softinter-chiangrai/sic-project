import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';

export const pmrt13Resolver: ResolveFn<any> = (route) => {
  return of({ loaded: true });
};
