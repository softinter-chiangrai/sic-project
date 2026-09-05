import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Services
import { SicSidebarService } from '../../core/component/sic-sidebar/sic-sidebar.service';
import { AuthService } from '../../core/auth/auth.service';
import { Pmrt02Service } from '../pm/rt/pmrt02/pmrt02.service';
import { Pmdt09Service } from '../pm/dt/pmdt09/pmdt09.service';
import { AuditLogService } from '../pm/dt/pmdt20/audit-log.service';
import { burt04Service } from '../bu/rt/burt04/burt04.service';
import { DashboardService } from './dashboard.service';

// Models
import {
  BusinessInfoModel,
  MenuItemModel,
  ProfileInfoModel,
} from '../../core/component/sic-sidebar/sic-sidebar.model';
import { PmCustomerProject } from '../pm/rt/pmrt02/pmrt02.model';
import { DesignReview } from '../pm/dt/pmdt09/pmdt09.model';
import { AuditLog } from '../pm/dt/pmdt20/audit-log.service';
import { SicDatePipe } from '../../core/pipes/sic-date.pipe';
import { DashboardPageData, SdlcStageSummary, SmartProgramTile } from './dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, SicDatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly sidebarService = inject(SicSidebarService);
  private readonly authService = inject(AuthService);
  private readonly pmrt02Service = inject(Pmrt02Service);
  private readonly pmdt09Service = inject(Pmdt09Service);
  private readonly auditLogService = inject(AuditLogService);
  private readonly burt04Service = inject(burt04Service);
  private readonly dashboardService = inject(DashboardService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  // Real Data Signals
  readonly profile = signal<ProfileInfoModel | null>(null);
  readonly business = signal<BusinessInfoModel | null>(null);
  readonly rawMenu = signal<MenuItemModel[]>([]);
  readonly realProjects = signal<PmCustomerProject[]>([]);
  readonly realDesignReviews = signal<DesignReview[]>([]);
  readonly realAuditLogs = signal<AuditLog[]>([]);

  // Real Role Signals
  readonly isAdmin = signal(false);
  readonly realRoleName = signal<string>('');

  // UI Control Signals
  readonly searchQuery = signal('');
  readonly selectedCategory = signal<string>('ALL');
  readonly isLoading = signal(false);

  // =========================================================================
  // 1. DYNAMIC SDLC STAGES (Calculated from Real Projects & Design Reviews)
  // =========================================================================
  readonly sdlcStages = computed<SdlcStageSummary[]>(() => {
    const projects = this.realProjects();
    const reviews = this.realDesignReviews();

    const reqCount = projects.filter(
      (p) => p.status === 'PLANNING' || p.status === 'DRAFT' || p.status === 'NEW'
    ).length;
    const reviewCount = reviews.filter(
      (r) => r.status === 'PENDING' || r.status === 'IN_REVIEW' || r.status === 'REVISION'
    ).length;
    const devCount = projects.filter(
      (p) => p.status === 'IN_PROGRESS' || p.status === 'ACTIVE' || p.status === 'DEVELOPMENT'
    ).length;
    const qaCount = projects.filter(
      (p) => p.status === 'TESTING' || p.status === 'QA' || p.status === 'REVIEW'
    ).length;
    const releaseCount = projects.filter(
      (p) => p.status === 'COMPLETED' || p.status === 'CLOSED' || p.status === 'DEPLOYED'
    ).length;

    return [
      {
        stage: 'Planning & Req',
        thStage: 'วิเคราะห์ความต้องการ',
        icon: 'bi-clipboard-data',
        count: reqCount || 0,
        colorClass: 'text-[var(--crm-info,#3b82f6)]',
        bgClass: 'bg-[var(--crm-info,#3b82f6)]/10 border-[var(--crm-info,#3b82f6)]/20',
      },
      {
        stage: 'Design & Review',
        thStage: 'ตรวจแบบและสถาปัตยกรรม',
        icon: 'bi-palette2',
        count: reviewCount || 0,
        colorClass: 'text-purple-500',
        bgClass: 'bg-purple-500/10 border-purple-500/20',
      },
      {
        stage: 'Development',
        thStage: 'กำลังพัฒนาโค้ดและระบบ',
        icon: 'bi-code-slash',
        count: devCount || 0,
        colorClass: 'text-[var(--crm-primary)]',
        bgClass: 'bg-[var(--crm-primary)]/10 border-[var(--crm-primary)]/20',
      },
      {
        stage: 'Testing & QA',
        thStage: 'ทดสอบ & ตรวจรับงาน',
        icon: 'bi-shield-check',
        count: qaCount || 0,
        colorClass: 'text-[var(--crm-warning)]',
        bgClass: 'bg-[var(--crm-warning)]/10 border-[var(--crm-warning)]/20',
      },
      {
        stage: 'Release / Prod',
        thStage: 'ขึ้นระบบและส่งมอบสำเร็จ',
        icon: 'bi-rocket-takeoff',
        count: releaseCount || 0,
        colorClass: 'text-[var(--crm-success)]',
        bgClass: 'bg-[var(--crm-success)]/10 border-[var(--crm-success)]/20',
      },
    ];
  });

  readonly totalWorkItemsCount = computed(() => {
    return this.realProjects().length + this.realDesignReviews().length;
  });

  // =========================================================================
  // 2. REAL ACTION QUEUE (Real Pending Design Reviews)
  // =========================================================================
  readonly pendingDesignReviews = computed(() => {
    return this.realDesignReviews()
      .filter((r) => r.status !== 'APPROVED' && r.status !== 'REJECTED')
      .slice(0, 5);
  });

  // =========================================================================
  // 3. SMART ROLE-BASED PROGRAM HUB WITH REAL NOTIFICATION BADGES
  // =========================================================================
  readonly smartProgramTiles = computed<SmartProgramTile[]>(() => {
    const tiles: SmartProgramTile[] = [];
    const pendingReviewsCount = this.pendingDesignReviews().length;
    const activeProjectsCount = this.realProjects().length;

    const traverse = (items: MenuItemModel[], categoryName: string = 'General') => {
      for (const item of items) {
        const currentCategory = item.children?.length ? item.name : categoryName;
        if (item.path && item.path.trim().length > 0) {
          const code = (item.code || 'PROG').toUpperCase();
          tiles.push({
            code: item.code || 'PROG',
            name: item.name,
            path: item.path.startsWith('/') ? item.path : `/feature/${item.path}`,
            icon: item.icon || this.getDefaultIcon(item.code),
            category: categoryName,
          });
        }
        if (item.children && item.children.length > 0) {
          traverse(item.children, item.name);
        }
      }
    };

    traverse(this.rawMenu());
    return tiles;
  });

  readonly categories = computed<string[]>(() => {
    const list = this.smartProgramTiles().map((p) => p.category || 'General');
    return ['ALL', ...Array.from(new Set(list))];
  });

  readonly filteredTiles = computed<SmartProgramTile[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();

    return this.smartProgramTiles().filter((p) => {
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query));

      const matchCat = cat === 'ALL' || p.category === cat;
      return matchQuery && matchCat;
    });
  });

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isAdmin.set(this.authService.isAdmin());

    // Populate preloaded data from resolver if available
    const resolvedData: DashboardPageData = this.route.snapshot.data['form'] || this.route.snapshot.data['data'];
    if (resolvedData) {
      if (resolvedData.profile) this.profile.set(resolvedData.profile);
      if (resolvedData.business) this.business.set(resolvedData.business);
      if (resolvedData.rawMenu?.length) this.rawMenu.set(resolvedData.rawMenu);
      if (resolvedData.projects?.length) this.realProjects.set(resolvedData.projects);
      if (resolvedData.reviews?.length) this.realDesignReviews.set(resolvedData.reviews);
      if (resolvedData.auditLogs?.length) this.realAuditLogs.set(resolvedData.auditLogs);
    }

    this.loadAllRealData();
  }

  loadAllRealData(): void {
    this.isLoading.set(true);
    const currentUserId = this.authService.getUserId();
    const businessId = localStorage.getItem('businessId') || '';

    forkJoin({
      profile: this.sidebarService.getProfile().pipe(catchError(() => of(null))),
      business: this.sidebarService.getBusiness().pipe(catchError(() => of(null))),
      menu: this.sidebarService.getMenu().pipe(catchError(() => of([]))),
      members: businessId
        ? this.burt04Service.getMembers(businessId, 0, 100).pipe(catchError(() => of(null)))
        : of(null),
      projects: this.pmrt02Service
        .getProjects({ page: 0, size: 10, sortBy: 'createdDate', sortDir: 'desc' })
        .pipe(catchError(() => of({ data: [], total: 0, page: 0, size: 10, totalPages: 0 }))),
      designReviews: this.pmdt09Service
        .getDesignReviews({ page: 0, size: 10 })
        .pipe(catchError(() => of({ data: [], total: 0, page: 0, size: 10, totalPages: 0 }))),
      auditLogs: this.auditLogService
        .getLogs({ page: 0, size: 5, sortBy: 'createdDate', sortDir: 'desc' })
        .pipe(
          catchError(() =>
            of({ content: [], totalPages: 0, totalElements: 0, size: 5, number: 0 })
          )
        ),
    }).subscribe({
      next: (res) => {
        if (res.profile) this.profile.set(res.profile);
        if (res.business) this.business.set(res.business);
        if (res.menu) this.rawMenu.set(res.menu);
        if (res.projects?.data) this.realProjects.set(res.projects.data);
        if (res.designReviews?.data) this.realDesignReviews.set(res.designReviews.data);
        if (res.auditLogs?.content) this.realAuditLogs.set(res.auditLogs.content);

        // Resolve Real Business Role Name from Member API or Keycloak claims
        this.resolveUserRole(res.members, currentUserId);

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private resolveUserRole(membersResponse: any, currentUserId: string | null): void {
    if (this.isAdmin()) {
      this.realRoleName.set('ผู้ดูแลระบบ (Administrator)');
      return;
    }

    // 1. Check from Business Member API (BURT04 / su-user-business)
    if (membersResponse && membersResponse.data && currentUserId) {
      const currentMember = membersResponse.data.find(
        (m: any) => m.userId === currentUserId
      );
      if (currentMember?.roleNames && currentMember.roleNames.length > 0) {
        this.realRoleName.set(currentMember.roleNames.join(', '));
        return;
      }
    }

    // 2. Check from Keycloak Realm & Client Roles
    const claims = this.authService.getIdentityClaims();
    if (claims) {
      const realmRoles: string[] = claims.realm_access?.roles || [];
      const filteredRealm = realmRoles.filter(
        (r) => !r.startsWith('default-') && !r.startsWith('offline_') && r !== 'uma_authorization'
      );
      if (filteredRealm.length > 0) {
        this.realRoleName.set(filteredRealm.join(', '));
        return;
      }
    }

    // 3. Fallback to Member
    this.realRoleName.set('สมาชิกในระบบ (Member)');
  }

  get profileImage(): string {
    return (
      this.profile()?.uploadGroupData?.[0]?.accessUrl ||
      'images/profile.png'
    );
  }

  navigateTo(path: string): void {
    if (path) {
      this.router.navigateByUrl(path);
    }
  }

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  calcProjectProgress(proj: PmCustomerProject): number {
    if (!proj.budgetManday || proj.budgetManday <= 0) return 0;
    const progress = Math.round(((proj.usedManday || 0) / proj.budgetManday) * 100);
    return Math.min(progress, 100);
  }

  private getDefaultIcon(code: string): string {
    if (!code) return 'bi-grid';
    const c = code.toUpperCase();
    if (c.startsWith('PMDT')) return 'bi-kanban';
    if (c.startsWith('PMRT')) return 'bi-file-earmark-bar-graph';
    if (c.startsWith('BU')) return 'bi-briefcase';
    if (c.startsWith('DB')) return 'bi-database';
    return 'bi-app-indicator';
  }
}
