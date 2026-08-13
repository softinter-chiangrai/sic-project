// src/app/feature/pm/rt/pmrt04/pmrt04.resolver.ts
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ResolveFn } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Pmrt02Service } from '../pmrt02/pmrt02.service';

export const pmrt04Resolver: ResolveFn<any> = (route) => {
  const http = inject(HttpClient);
  const projectService = inject(Pmrt02Service);
  const projectId = route.queryParams['projectId'];

  if (!projectId) {
    return of(null);
  }

  return projectService.getProject(projectId).pipe(
    switchMap((project) => {
      let params = new HttpParams().set('page', '0').set('size', '10');
      if (project?.customerId) {
        params = params.set('customerId', project.customerId);
      }
      return http.get<any>(`${environment.apiBaseUrl}/api/pm/contracts`, { params }).pipe(
        map((contracts) => ({ project, contracts }))
      );
    }),
    catchError((err) => {
      console.error('pmrt04Resolver error:', err);
      return of(null);
    })
  );
};

