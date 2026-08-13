import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';

export const pmdt10Resolver: ResolveFn<any> = (route) => {
  return of({ loaded: true });
};

export const pmdt10AResolver: ResolveFn<any> = (route) => {
  const id = route.params['id'];
  return of({ id: id || null, loaded: true });
};

export const pmdt10BResolver: ResolveFn<any> = (route) => {
  const id = route.params['id'];
  return of({ id: id || null, loaded: true });
};

export const pmdt10CResolver: ResolveFn<any> = (route) => {
  const id = route.params['id'];
  return of({ id: id || null, loaded: true });
};
