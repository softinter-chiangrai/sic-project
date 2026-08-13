// src/app/feature/pm/rt/pmrt02/pmrt02.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Pmrt02Service } from './pmrt02.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { PmCustomerProject } from './pmrt02.model';
import { PaginationResponse } from '../../../../core/model/pagination.model';

export const pmrt02Resolver: ResolveFn<PaginationResponse<PmCustomerProject> | null> = (route) => {
  const service = inject(Pmrt02Service);
  const customerState = inject(CustomerStateService);
  const customerId = route.queryParams['customerId'] || customerState.getCustomerId() || undefined;

  return service
    .getProjects({
      customerId,
      page: 1,
      size: 10,
      sortBy: 'projectCode',
      sortDir: 'asc',
    })
    .pipe(
      catchError((err) => {
        console.error('pmrt02Resolver load projects error:', err);
        return of(null);
      })
    );
};

