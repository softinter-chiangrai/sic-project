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

const COMMON_PATH_LABELS: Record<string, string> = {
  new: 'เพิ่มข้อมูล',
  create: 'เพิ่มข้อมูล',
  edit: 'แก้ไข',
  view: 'รายละเอียด',
  detail: 'รายละเอียด',
  approval: 'อนุมัติ',
  renew: 'ต่ออายุ',
  gantt: 'ผังโครงการ (Gantt Chart)',
  history: 'ประวัติการทำรายการ',
  options: 'ตัวเลือก',
  invite: 'คำเชิญ',
  join: 'เข้าร่วม',
  profile: 'โปรไฟล์',
  business: 'ข้อมูลสถานประกอบการ',
  requirement: 'ความต้องการ (Requirement)',
  diagram: 'ไดอะแกรม',
  phase: 'เฟสการทำงาน (Phase)',
  milestone: 'ไมล์สโตน (Milestone)',
  'work-package': 'Work Package',
  task: 'งาน (Task)',
  'task-list': 'รายการงานทั้งหมด',
  'task-board': 'บอร์ดงาน (Task Board)',
  'my-tasks': 'งานของฉัน',
  manual: 'คู่มือใช้งาน',
  invoice: 'ใบแจ้งหนี้',
  payment: 'การชำระเงิน',
  bug: 'รายการบั๊ก',
  delivery: 'การส่งมอบ',
  renewal: 'การต่อสัญญา',
  audit: 'Audit Log',
  version: 'เวอร์ชันเอกสาร',
  discussion: 'การสนทนา / อภิปราย',
  'design-review': 'ทบทวนการออกแบบ (Design Review)',
  'ma-ticket': 'ตั๋วแจ้งปัญหา (MA Ticket)',
  dashboard: 'แดชบอร์ด',
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
    { label: 'Home', url: '/feature/dashboard', icon: 'bi-house-door', isCurrent: true },
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
      label: 'Home',
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

      let accumulatedUrl = matchedMenuPath;
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        accumulatedUrl += `/${seg}`;

        // Skip numeric IDs or UUIDs unless dynamic page title set
        const isId = /^\d+$/.test(seg) || /^[0-9a-fA-F-]{36}$/.test(seg);

        if (isId) {
          continue;
        }

        const label = COMMON_PATH_LABELS[seg.toLowerCase()] || this.formatSegmentName(seg);
        if (!items.some((item) => item.label.toLowerCase() === label.toLowerCase())) {
          items.push({
            label,
            url: accumulatedUrl,
          });
        }
      }
    } else if (items.length === 1) {
      // Fallback if no menu matched: parse URL segments after /feature or root
      const cleanSegments = currentUrl.split('/').filter(Boolean);
      let accUrl = '';
      for (const seg of cleanSegments) {
        accUrl += `/${seg}`;
        if (seg === 'feature') continue;
        const isId = /^\d+$/.test(seg) || /^[0-9a-fA-F-]{36}$/.test(seg);
        if (isId) continue;

        const label = COMMON_PATH_LABELS[seg.toLowerCase()] || this.formatSegmentName(seg);
        items.push({
          label,
          url: accUrl,
        });
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
    const urlSegments = currentUrl.split('/').filter(Boolean);
    this.breadcrumbs.set(
      items.map((item, index) => {
        const isCurrent = index === items.length - 1;
        let url = isCurrent ? null : item.url;
        if (!isCurrent && !url) {
          // Reconstruct URL from current path segments up to this depth
          if (index <= urlSegments.length) {
            url = '/' + urlSegments.slice(0, index).join('/');
          }
        }
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
