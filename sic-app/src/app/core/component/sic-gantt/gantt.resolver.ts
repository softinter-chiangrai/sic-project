import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Pmrt02Service } from '../../../feature/pm/rt/pmrt02/pmrt02.service';

export const ganttResolver: ResolveFn<any> = (route) => {
  const pmrt02Service = inject(Pmrt02Service);
  const projectId = route.queryParams['projectId'] || route.params['id'] || null;

  return pmrt02Service.getProjects({ size: 200 }).pipe(
    map((res) => ({
      projectId,
      projects: res?.data || [],
      loaded: true,
    })),
    catchError(() => of({ projectId, projects: [], loaded: true }))
  );
};

