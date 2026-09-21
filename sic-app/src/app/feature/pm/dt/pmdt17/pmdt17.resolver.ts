import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of, timeout } from 'rxjs';
import { Pmdt17Service } from './pmdt17.service';
import { Pmdt17PageData } from './pmdt17.model';

/**
 * Preloads page-1 (or the page implied by current query params) of the MA Ticket list
 * via the real Pmdt17Service, so the grid does not have to fire a duplicate fetch on
 * first render. All subsequent paging/search/filter loads are handled lazily by the
 * component's handleGridLoad, which reuses the same service.
 */
export const pmdt17Resolver: ResolveFn<Pmdt17PageData> = (route) => {
  const service = inject(Pmdt17Service);

  const qp = route.queryParams;
  const page = qp['page'] ? +qp['page'] || 1 : 1;
  const keyword = qp['q'] || undefined;
  const status = qp['status'] || undefined;
  const pageSize = 10;

  return service.getTickets(page, pageSize, keyword, status).pipe(
    timeout(15000),
    map((res) => ({
      initialTickets: res?.data ?? [],
      initialTotal: res?.pageable?.totalElements ?? (res?.data?.length ?? 0),
      initialPage: page,
    })),
    catchError((err) => {
      console.error('Failed to load MA ticket list:', err);
      return of({ initialTickets: [], initialTotal: 0, initialPage: page });
    }),
  );
};
