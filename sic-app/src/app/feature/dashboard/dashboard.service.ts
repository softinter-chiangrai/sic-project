import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { SicSidebarService } from '../../core/component/sic-sidebar/sic-sidebar.service';
import { Pmrt02Service } from '../pm/rt/pmrt02/pmrt02.service';
import { Pmdt09Service } from '../pm/dt/pmdt09/pmdt09.service';
import { AuditLogService } from '../pm/dt/pmdt20/audit-log.service';
import { burt04Service } from '../bu/rt/burt04/burt04.service';
import { apiBaseUrl } from '../../core/config/api.config';
import {
  DashboardDeadlineItem,
  DashboardOrgSummary,
  DashboardPageData,
  DashboardPreloadData,
  DashboardProjectHealthItem,
} from './dashboard.model';

const EMPTY_SUMMARY: DashboardOrgSummary = {
  totalProjects: 0,
  activeProjects: 0,
  delayedProjects: 0,
  completedProjects: 0,
  openBugs: 0,
  criticalOpenBugs: 0,
  pendingInvoiceCount: 0,
  pendingInvoiceAmount: 0,
  openMaTickets: 0,
  contractsNearExpiry: 0,
};

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly sidebarService = inject(SicSidebarService);
  private readonly authService = inject(AuthService);
  private readonly pmrt02Service = inject(Pmrt02Service);
  private readonly pmdt09Service = inject(Pmdt09Service);
  private readonly auditLogService = inject(AuditLogService);
  private readonly burt04Service = inject(burt04Service);
  private readonly dashboardBaseUrl = `${apiBaseUrl}/api/pm/dashboard`;

  loadDashboardData(): Observable<DashboardPreloadData> {
    return forkJoin({
      profile: this.sidebarService.getProfile().pipe(catchError(() => of(null))),
      business: this.sidebarService.getBusiness().pipe(catchError(() => of(null))),
      rawMenu: this.sidebarService.getMenu().pipe(catchError(() => of([]))),
      projects: this.pmrt02Service.getProjects({ size: 100 }).pipe(
        map((res) => res?.data || []),
        catchError(() => of([]))
      ),
      reviews: this.pmdt09Service.getDesignReviews({ size: 100 }).pipe(
        map((res) => res?.data || []),
        catchError(() => of([]))
      ),
      auditLogs: this.auditLogService.getLogs({ page: 0, size: 5 }).pipe(
        map((res) => res?.content || []),
        catchError(() => of([]))
      ),
    });
  }

  getOrgSummary(): Observable<DashboardOrgSummary> {
    return this.http
      .get<DashboardOrgSummary>(`${this.dashboardBaseUrl}/org/summary`)
      .pipe(catchError(() => of(EMPTY_SUMMARY)));
  }

  getOrgDeadlines(limit = 8): Observable<DashboardDeadlineItem[]> {
    return this.http
      .get<DashboardDeadlineItem[]>(`${this.dashboardBaseUrl}/org/deadlines`, { params: { limit } })
      .pipe(catchError(() => of([])));
  }

  getOrgProjectHealth(limit = 5): Observable<DashboardProjectHealthItem[]> {
    return this.http
      .get<DashboardProjectHealthItem[]>(`${this.dashboardBaseUrl}/org/project-health`, { params: { limit } })
      .pipe(catchError(() => of([])));
  }
}
