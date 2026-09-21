// src/app/feature/pm/dt/pmdt03/pmdt03.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { lastValueFrom, catchError, of } from 'rxjs';
import { ApprovalService } from './approval.service';
import { Pmdt03PageData } from './pmdt03.model';

// The Approval Center ("approval") route has no :id — it is a paginated grid whose
// rows are always loaded lazily via handleGridLoad(). The only thing genuinely
// worth preloading here is the summary counts shown on the tab headers.
export const pmdt03Resolver: ResolveFn<Pmdt03PageData> = async () => {
  const service = inject(ApprovalService);

  try {
    const summary = await lastValueFrom(
      service.getSummary().pipe(catchError(() => of(null)))
    );
    return { summary };
  } catch (err) {
    console.error('pmdt03Resolver error:', err);
    return { summary: null };
  }
};
