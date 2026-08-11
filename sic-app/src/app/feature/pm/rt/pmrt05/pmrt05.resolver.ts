// src/app/feature/pm/rt/pmrt05/pmrt05.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of, catchError, map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { RequirementDetail, TraceLink, Pmrt05PageData } from './pmrt05.model';

export const pmrt05Resolver: ResolveFn<Pmrt05PageData> = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  const reqId = route.queryParams['requirementId'];

  if (!reqId) {
    return of({
      requirementDetail: null as any,
      traceLinks: [],
    });
  }

  const req$ = http.get<RequirementDetail>(`${environment.apiBaseUrl}/api/pm/requirement/${reqId}`).pipe(
    catchError((err) => {
      console.error('Resolver load requirement error:', err);
      return of(null as any);
    })
  );

  const trace$ = http.get<TraceLink[]>(`${environment.apiBaseUrl}/api/trace/links/source/REQUIREMENT/${reqId}`).pipe(
    catchError((err) => {
      console.error('Resolver load trace links error:', err);
      return of([]);
    })
  );

  return forkJoin({
    requirementDetail: req$,
    traceLinks: trace$,
  });
};
