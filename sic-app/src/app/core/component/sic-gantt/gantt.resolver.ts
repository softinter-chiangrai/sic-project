import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { of } from 'rxjs';

export const ganttResolver: ResolveFn<any> = (route) => {
  const projectId = route.queryParams['projectId'] || route.params['id'];
  return of({ projectId: projectId || null, loaded: true });
};
