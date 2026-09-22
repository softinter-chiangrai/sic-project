// src/app/feature/pm/dt/pmdt04/pmdt04.resolver.ts
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';

// Always load ALL requirements of ALL projects (backend projectId is optional and
// omitted here); the navbar project-context selection filters what's shown client-side.
export const pmdt04Resolver: ResolveFn<any> = () => {
  const http = inject(HttpClient);

  const params = new HttpParams()
    .set('page', '1')
    .set('size', '1000');

  return http.get<any>(`${environment.apiBaseUrl}/api/pm/requirement`, { params }).pipe(
    catchError((err) => {
      console.error('pmdt04Resolver error:', err);
      return of(null);
    })
  );
};

