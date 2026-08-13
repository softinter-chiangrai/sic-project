// src/app/feature/pm/rt/pmrt01/pmrt01.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Pmrt01AService } from './pmrt01A/pmrt01A.service';
import { PaginationResponse } from '../../../../core/model/pagination.model';
import { CustomerModel } from './pmrt01A/pmrt01A.model';

export const pmrt01Resolver: ResolveFn<PaginationResponse<CustomerModel> | null> = (route) => {
  const service = inject(Pmrt01AService);
  const businessId = (typeof localStorage !== 'undefined' ? localStorage.getItem('businessId') : null) || '';

  if (!businessId) {
    return of(null);
  }

  return service.getCustomers(businessId, 0, 10).pipe(
    catchError((err) => {
      console.error('pmrt01Resolver load customers error:', err);
      return of(null);
    })
  );
};

