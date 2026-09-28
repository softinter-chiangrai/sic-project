import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of, timeout } from 'rxjs';
import { Pmdt17Service } from './pmdt17.service';
import { Pmdt17PageData } from './pmdt17.model';

/**
 * Preloads the full keyword/status-matching MA Ticket dataset via the real Pmdt17Service, so
 * the grid does not have to fire a duplicate fetch on first render. The backend has no
 * project/customer-scope filter param, so — matching the pattern used by sibling PM list
 * pages (pmdt16, pmdt14, pmdt19, ...) — the whole matching set is fetched once and the
 * component's `filteredTickets` further filters it client-side by the navbar's selected
 * project(s) (`projectId`/`customerId`/`projectIds` query params, via CustomerStateService).
 * `status=CHANGED` (and any other status/keyword filter) is still applied here, server-side,
 * exactly as before. All subsequent keyword/status changes are refetched by the component
 * itself (see its constructor effect), reusing the same service.
 */
export const pmdt17Resolver: ResolveFn<Pmdt17PageData> = (route) => {
  const service = inject(Pmdt17Service);

  const qp = route.queryParams;
  const keyword = qp['q'] || undefined;
  const status = qp['status'] || undefined;

  return service.getTickets(1, 10000, keyword, status).pipe(
    timeout(15000),
    map((res) => ({
      initialTickets: res?.data ?? [],
      initialTotal: res?.pageable?.totalElements ?? (res?.data?.length ?? 0),
      initialPage: 1,
    })),
    catchError((err) => {
      console.error('Failed to load MA ticket list:', err);
      return of({ initialTickets: [], initialTotal: 0, initialPage: 1 });
    }),
  );
};
