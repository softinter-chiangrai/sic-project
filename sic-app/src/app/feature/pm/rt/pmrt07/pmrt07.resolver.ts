import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NotificationService } from '../../../../core/services/notification.service';
import { Pmrt07PageData } from './pmrt07.model';

/**
 * Preloads the first page (page 0, "all" tab) of notifications so the
 * Notification Center renders with data immediately instead of the component
 * fetching it again in ngOnInit. Subsequent pages (infinite scroll / "unread"
 * tab switch) are still fetched lazily by the component via NotificationService.
 */
export const pmrt07Resolver: ResolveFn<Pmrt07PageData> = () => {
  const notificationSvc = inject(NotificationService);

  return from(notificationSvc.fetchNotificationsPage(0, 15, false)).pipe(
    map((res) => ({ initialPage: res })),
    catchError((err) => {
      console.error('pmrt07Resolver load notifications error:', err);
      return of<Pmrt07PageData>({ initialPage: null });
    })
  );
};
