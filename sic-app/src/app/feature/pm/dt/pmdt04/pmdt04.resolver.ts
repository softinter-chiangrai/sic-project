// src/app/feature/pm/dt/pmdt04/pmdt04.resolver.ts
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CustomerStateService } from '../../../../core/services/customer-state.service';

export const pmdt04Resolver: ResolveFn<any> = (route) => {
  const http = inject(HttpClient);
  const customerState = inject(CustomerStateService);
  const projectId = route.queryParams['projectId'] || customerState.getProjectId();

  if (!projectId) {
    return of(null);
  }

  const params = new HttpParams()
    .set('page', '0')
    .set('size', '10')
    .set('projectId', projectId);

  return http.get<any>(`${environment.apiBaseUrl}/api/pm/requirement`, { params }).pipe(
    catchError((err) => {
      console.error('pmdt04Resolver error:', err);
      return of(null);
    })
  );
};

