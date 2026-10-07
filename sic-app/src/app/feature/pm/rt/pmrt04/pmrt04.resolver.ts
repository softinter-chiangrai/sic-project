// src/app/feature/pm/rt/pmrt04/pmrt04.resolver.ts
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PaginationResponse } from '../../../../core/model/pagination.model';
import { Contract, Pmrt04ListPageData } from './pmrt04.model';

// Always load all contracts (page 1, unfiltered by project/customer);
// navbar project-context selection filters what's shown client-side.
export const pmrt04Resolver: ResolveFn<Pmrt04ListPageData | null> = () => {
  const http = inject(HttpClient);
  const params = new HttpParams().set('page', '1').set('size', '10');

  return http.get<PaginationResponse<Contract>>(`${environment.apiBaseUrl}/api/pm/contracts`, { params }).pipe(
    map((contracts) => ({ project: null, contracts })),
    catchError((err) => {
      console.error('pmrt04Resolver error:', err);
      return of(null);
    })
  );
};
