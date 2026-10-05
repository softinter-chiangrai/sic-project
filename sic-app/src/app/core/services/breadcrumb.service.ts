import { Injectable, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarItem } from '../component/sic-sidebar/sic-sidebar.model';

export interface BreadcrumbItem {
  label: string;
  url: string | null;
  icon?: string;
  isCurrent?: boolean;
}

/** Path segment -> i18n key (labels live in public/i18n/*.json) */
const COMMON_PATH_LABELS: Record<string, string> = {
  new: 'BREADCRUMB_SEG_NEW',
  create: 'BREADCRUMB_SEG_CREATE',
  edit: 'BREADCRUMB_SEG_EDIT',
  view: 'BREADCRUMB_SEG_VIEW',
  detail: 'BREADCRUMB_SEG_DETAIL',
  approval: 'BREADCRUMB_SEG_APPROVAL',
  renew: 'BREADCRUMB_SEG_RENEW',
  gantt: 'BREADCRUMB_SEG_GANTT',
  calendar: 'BREADCRUMB_SEG_CALENDAR',
  history: 'BREADCRUMB_SEG_HISTORY',
  options: 'BREADCRUMB_SEG_OPTIONS',
  invite: 'BREADCRUMB_SEG_INVITE',
  join: 'BREADCRUMB_SEG_JOIN',
  profile: 'BREADCRUMB_SEG_PROFILE',
  business: 'BREADCRUMB_SEG_BUSINESS',
  requirement: 'BREADCRUMB_SEG_REQUIREMENT',
  diagram: 'BREADCRUMB_SEG_DIAGRAM',
  phase: 'BREADCRUMB_SEG_PHASE',
  milestone: 'BREADCRUMB_SEG_MILESTONE',
  'work-package': 'BREADCRUMB_SEG_WORK_PACKAGE',
  task: 'BREADCRUMB_SEG_TASK',
  'task-list': 'BREADCRUMB_SEG_TASK_LIST',
  'task-board': 'BREADCRUMB_SEG_TASK_BOARD',
  'my-tasks': 'BREADCRUMB_SEG_MY_TASKS',
  manual: 'BREADCRUMB_SEG_MANUAL',
  invoice: 'BREADCRUMB_SEG_INVOICE',
  payment: 'BREADCRUMB_SEG_PAYMENT',
  bug: 'BREADCRUMB_SEG_BUG',
  delivery: 'BREADCRUMB_SEG_DELIVERY',
  renewal: 'BREADCRUMB_SEG_RENEWAL',
  audit: 'BREADCRUMB_SEG_AUDIT',
  version: 'BREADCRUMB_SEG_VERSION',
  discussion: 'BREADCRUMB_SEG_DISCUSSION',
  'design-review': 'BREADCRUMB_SEG_DESIGN_REVIEW',
  'ma-ticket': 'BREADCRUMB_SEG_MA_TICKET',
  dashboard: 'BREADCRUMB_SEG_DASHBOARD',
};

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Current main menu hierarchy from sidebar */
  private menuItems: SidebarItem[] = [];

  /** Dynamic title override set by a page component */
  private readonly customPageTitle = signal<string | null>(null);

  /** Full dynamic breadcrumbs override set by a page component */
  private readonly customBreadcrumbs = signal<BreadcrumbItem[] | null>(null);

  /** Final calculated breadcrumbs signal read by UI */
  readonly breadcrumbs = signal<BreadcrumbItem[]>([
    { label: 'BREADCRUMB_HOME', url: '/feature/dashboard', icon: 'bi-house-door', isCurrent: true },
  ]);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Reset dynamic overrides on page navigation
        this.customPageTitle.set(null);
        this.customBreadcrumbs.set(null);
        this.updateBreadcrumbs();
      });
  }

  /**
   * Supply the sidebar main menu items so breadcrumbs can match menu structure.
   */
  setMenuItems(items: SidebarItem[]): void {
    this.menuItems = items;
    this.updateBreadcrumbs();
  }

  /**
   * Set a custom page title for the current route's final breadcrumb item.
   * Example: `breadcrumbService.setPageTitle('บริษัท เอสไอซี จำกัด')`
   */
  setPageTitle(title: string): void {
    this.customPageTitle.set(title);
    this.updateBreadcrumbs();
  }

  /**
   * Set full custom breadcrumbs if a page needs full control.
   */
  setCustomBreadcrumbs(crumbs: BreadcrumbItem[]): void {
    this.customBreadcrumbs.set(crumbs);
    this.updateBreadcrumbs();
  }

  /**
   * Recalculate breadcrumbs based on route, menu, and custom overrides.
   */
  private updateBreadcrumbs(): void {
    if (this.customBreadcrumbs()) {
      const custom = this.customBreadcrumbs()!;
      this.breadcrumbs.set(
        custom.map((item, index) => ({
          ...item,
          isCurrent: index === custom.length - 1,
          url: index === custom.length - 1 ? null : item.url,
        })),
      );
      return;
    }

    const currentUrl = this.router.url.split('?')[0];

    const home: BreadcrumbItem = {
      label: 'BREADCRUMB_HOME',
      url: '/feature/dashboard',
      icon: 'bi-house-door',
    };

    if (currentUrl === '/feature/dashboard' || currentUrl === '/feature') {
      this.breadcrumbs.set([{ ...home, isCurrent: true, url: null }]);
      return;
    }

    const items: BreadcrumbItem[] = [home];

    // 1. Try matching against Sidebar Menu Trail
    const activeTrail = this.findActiveTrail(this.menuItems, currentUrl) ?? [];
    const trailWithoutDashboard = activeTrail.filter((item) => item.code !== 'dashboard');

    let matchedMenuPath = '';
    for (const item of trailWithoutDashboard) {
      const itemUrl = this.findLeafPath(item);
      items.push({
        label: item.label,
        url: itemUrl,
        icon: item.icon,
      });
      if (itemUrl) {
        matchedMenuPath = itemUrl;
      }
    }

    // 2. Parse ActivatedRoute data / title if available
    let routeSnapshot = this.route.root.snapshot;
    while (routeSnapshot.firstChild) {
      routeSnapshot = routeSnapshot.firstChild;
      if (routeSnapshot.data?.['breadcrumb']) {
        const routeLabel = routeSnapshot.data['breadcrumb'];
        const routeUrl = '/' + routeSnapshot.url.map((s) => s.path).join('/');
        if (!items.some((i) => i.label === routeLabel)) {
          items.push({ label: routeLabel, url: routeUrl });
        }
      } else if (routeSnapshot.title) {
        const routeTitle = routeSnapshot.title;
        const routeUrl = '/' + routeSnapshot.url.map((s) => s.path).join('/');
        if (!items.some((i) => i.label === routeTitle)) {
          items.push({ label: routeTitle, url: routeUrl });
        }
      }
    }

    // 3. Inspect remaining URL segments if URL goes deeper than matched menu path
    if (matchedMenuPath && currentUrl.startsWith(matchedMenuPath)) {
      const remainingPath = currentUrl.substring(matchedMenuPath.length);
      const segments = remainingPath.split('/').filter(Boolean);

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];

        // Skip numeric IDs or UUIDs unless dynamic page title set
        const isId = /^\d+$/.test(seg) || /^[0-9a-fA-F-]{36}$/.test(seg);

        if (isId) {
          continue;
        }

        const label = COMMON_PATH_LABELS[seg.toLowerCase()] || this.formatSegmentName(seg);
        if (!items.some((item) => item.label.toLowerCase() === label.toLowerCase())) {
          items.push({ label, url: null });
        }
      }
    } else if (items.length === 1) {
      // Fallback if no menu matched: parse URL segments after /feature or root
      const cleanSegments = currentUrl.split('/').filter(Boolean);
      for (const seg of cleanSegments) {
        if (seg === 'feature') continue;
        const isId = /^\d+$/.test(seg) || /^[0-9a-fA-F-]{36}$/.test(seg);
        if (isId) continue;

        const label = COMMON_PATH_LABELS[seg.toLowerCase()] || this.formatSegmentName(seg);
        items.push({ label, url: null });
      }
    }

    // 4. If customPageTitle was set, update the leaf breadcrumb's label
    if (this.customPageTitle()) {
      if (items.length > 1) {
        items[items.length - 1].label = this.customPageTitle()!;
      } else {
        items.push({
          label: this.customPageTitle()!,
          url: null,
        });
      }
    }

    // 5. Finalize items: ensure every non-current item has a valid, clickable URL
    this.breadcrumbs.set(
      items.map((item, index) => {
        const isCurrent = index === items.length - 1;
        const url = isCurrent ? null : item.url;
        return {
          ...item,
          isCurrent,
          url,
        };
      }),
    );
  }

  private findActiveTrail(
    items: SidebarItem[],
    url: string,
    trail: SidebarItem[] = [],
  ): SidebarItem[] | null {
    for (const item of items) {
      const nextTrail = [...trail, item];
      if (item.path && this.isPathActive(item.path, url)) {
        return nextTrail;
      }
      if (item.children?.length) {
        const childTrail = this.findActiveTrail(item.children, url, nextTrail);
        if (childTrail) return childTrail;
      }
    }
    return null;
  }

  private isPathActive(path: string, url: string): boolean {
    const full = this.getItemLink(path) || '';
    return url === full || url.startsWith(full + '/') || url.startsWith(full + '?');
  }

  private findLeafPath(item: SidebarItem): string | null {
    if (item.path) {
      const link = this.getItemLink(item.path);
      if (link) return link;
    }
    if (item.children?.length) {
      for (const child of item.children) {
        const childLink = this.findLeafPath(child);
        if (childLink) return childLink;
      }
    }
    return null;
  }

  private getItemLink(path: string | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('/')) return path;
    if (
      path.startsWith('management/') ||
      path.startsWith('auth/') ||
      path.startsWith('feature/') ||
      path.startsWith('tutorial/')
    ) {
      return `/${path}`;
    }
    return `/feature/${path}`;
  }

  private formatSegmentName(segment: string): string {
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
