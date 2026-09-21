import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { AuditLogService } from './audit-log.service';
import { Pmdt20PageData } from './pmdt20.model';

// Preloads only the filter/dropdown options (modules, users) for the Audit Log
// list page. Grid rows themselves stay lazily loaded via handleGridLoad since
// the audit log is server-paginated.
export const pmdt20Resolver: ResolveFn<Pmdt20PageData> = () => {
  const auditLogService = inject(AuditLogService);

  return forkJoin({
    modules: auditLogService.getModules().pipe(
      catchError((err) => {
        console.warn('Failed to load audit modules from backend:', err);
        return of([]);
      })
    ),
    users: auditLogService.getUsers().pipe(
      catchError((err) => {
        console.warn('Failed to load audit users from backend:', err);
        return of([]);
      })
    ),
  });
};
