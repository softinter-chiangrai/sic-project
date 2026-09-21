// src/app/feature/pm/dt/pmdt03/pmdt03A/pmdt03A.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ApprovalService } from '../approval.service';
import { Pmdt03APageData } from './pmdt03A.model';

// The approval-detail page (approval/:id) renders the full Approval record
// (status, approve/reject/revise/cancel flags, steps, etc.) via <sic-approval>,
// not a form — so the resolver preloads that same Approval the component needs,
// instead of the previously-dead Pmdt03A form/service pairing.
export const pmdt03AResolver: ResolveFn<Pmdt03APageData> = async (route) => {
  const service = inject(ApprovalService);
  const router = inject(Router);
  const id = route.paramMap.get('id')!;

  try {
    const approval = await lastValueFrom(service.getApproval(id));
    if (approval) {
      return { approval };
    }
    router.navigate(['/not-found']);
    return { approval: null };
  } catch (err) {
    console.error('pmdt03AResolver error:', err);
    router.navigate(['/not-found']);
    return { approval: null };
  }
};
