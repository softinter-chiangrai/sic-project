import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { TooltipDirective } from '../../directive/tooltip/tootop.directive';
import { AppLanguage, LanguageService } from '../../services/language.service';
import { ThemeService } from '../../services/theme.service';
import { DateTimeUtil } from '../../utils/datetime.util';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '../../services/dialog.service';
import { SicSidebarService, SidebarAction } from './sic-sidebar.service';
import { BusinessInfoModel, MenuItemModel, MenuActionFlags, ProfileInfoModel, SidebarItem } from './sic-sidebar.model';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SicCardComponent } from "../sic-card/sic-card.component";

interface BreadcrumbItem {
  label: string;
  url: string | null;
  icon?: string;
  isCurrent?: boolean;
}

@Component({
  selector: 'sic-sidebar',
  standalone: true,
  imports: [TooltipDirective, TranslateModule, RouterLink, NgTemplateOutlet, SicCardComponent],
  templateUrl: './sic-sidebar.component.html',
  styleUrl: './sic-sidebar.component.css',
  host: {
    ngSkipHydration: 'true',
  },
})
export class SicSidebarComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);
  private readonly dialog = inject(DialogService);
  private readonly service = inject(SicSidebarService);
  public readonly router = inject(Router);

  private clockTimer?: ReturnType<typeof setInterval>;
  private routerSubscription?: Subscription;

  isBack:boolean = false;
  isSearch:boolean = false; 
  isAdd:boolean = false;
  isSave:boolean = false;
  isPrint:boolean = false;

  /** Raw menu items from API — kept so we can look up flags on route change */
  private rawMenuItems: MenuItemModel[] = [];

  readonly isMobileSidebarOpen = signal(false);
  readonly expandedMenus = signal<string[]>(
    JSON.parse(localStorage.getItem('expandedMenus') || '[]'),
  );
  readonly isDark = this.themeService.isDark.asReadonly();
  readonly currentLanguage = signal<AppLanguage>(this.languageService.getCurrentLanguage());
  readonly datetime = signal('--/--/---- --:--:--');
  readonly breadcrumbs = signal<BreadcrumbItem[]>([
    { label: 'Home', url: '/feature/dashboard', icon: 'bi-house-door', isCurrent: true },
  ]);

  // signal เก็บ URL ปัจจุบัน — อัปเดตทุกครั้งที่ route เปลี่ยน
  // template อ่าน signal นี้โดยตรง → Angular re-render อัตโนมัติ
  readonly currentUrl = signal('');

  private readonly DASHBOARD_ITEM: SidebarItem = {
    code: 'dashboard',
    label: 'Dashboard',
    icon: 'bi-house-door',
    path: 'dashboard',
  };

  readonly mainMenu = signal<SidebarItem[]>([this.DASHBOARD_ITEM]);

  profile: ProfileInfoModel = {} as ProfileInfoModel;
  business: BusinessInfoModel = {} as BusinessInfoModel;

  get profileImageSrc(): string {
    return this.profile?.uploadGroupData?.[0]?.accessUrl || 'images/profile.png';
  }

  get businessImageSrc(): string {
    return this.business?.uploadGroupData?.[0]?.accessUrl || 'images/business_logo.png';
  }

  constructor() {
    effect(() => {
      localStorage.setItem('expandedMenus', JSON.stringify(this.expandedMenus()));
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.currentUrl.set(this.router.url);
    this.loadInfomations();

    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        this.currentUrl.set(url);
        this.autoExpand();
        this.updateBreadcrumbs();
        this.updateActionFlags();
      });

    setTimeout(() => {
      this.updateClock();
      this.clockTimer = setInterval(() => this.updateClock(), 1000);
    }, 0);
  }

  loadInfomations(): void {
    this.service.getProfile().subscribe((profile) => (this.profile = profile));
    this.service.getBusiness().subscribe((business) => (this.business = business));

    this.service.getMenu().subscribe((menu) => {
      this.rawMenuItems = menu;
      this.mainMenu.set([this.DASHBOARD_ITEM, ...menu.map((item) => this.mapMenuItem(item))]);
      this.autoExpand();
      this.updateBreadcrumbs();
      this.updateActionFlags();
    });
  }

  // ────────────────────────────────────────────────────────────────
  // Action-button flag sync
  // ────────────────────────────────────────────────────────────────

  /**
   * Derive which header action-buttons to show from the active menu item.
   * Matches /feature/<path> URL to the item.path stored in the menu JSON.
   */
  private updateActionFlags(): void {
    const url = this.currentUrl();
    // Extract the path segment after /feature/  e.g. "bu/burt01"
    const match = url.match(/^\/feature\/(.+?)(\?.*)?$/);
    const pathSegment = match ? match[1] : null;

    const flags = pathSegment
      ? this.service.getActionFlagsForPath(this.rawMenuItems, pathSegment)
      : null;

    const f = flags ?? this.service.DEFAULT_FLAGS;
    this.isBack   = f.isBack;
    this.isSearch = f.isSearch;
    this.isAdd    = f.isAdd;
    this.isSave   = f.isSave;
    this.isPrint  = f.isPrint;
  }

  // ────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────

  private mapMenuItem(item: MenuItemModel): SidebarItem {
    return {
      code: item.code,
      label: item.name,
      icon: item.icon ?? 'bi-circle',
      path: item.path ?? undefined,
      children: item.children?.length
        ? item.children.map((c) => this.mapMenuItem(c))
        : undefined,
    };
  }

  /**
   * กาง ancestor ของ node ที่ path ตรงกับ URL ปัจจุบัน
   */
  private autoExpand(): void {
    const url = this.currentUrl();
    const toAdd: string[] = [];
    this.collectAncestorsToExpand(this.mainMenu(), url, toAdd);
    const current = this.expandedMenus();
    const newOnes = toAdd.filter((code) => !current.includes(code));
    if (newOnes.length > 0) {
      this.expandedMenus.update((curr) => [...curr, ...newOnes]);
    }
  }

  private collectAncestorsToExpand(items: SidebarItem[], url: string, out: string[]): boolean {
    for (const item of items) {
      if (item.children?.length) {
        const childMatch = this.collectAncestorsToExpand(item.children, url, out);
        if (childMatch && !out.includes(item.code)) {
          out.push(item.code);
        }
      } else if (item.path && this.isPathActive(item.path, url)) {
        return true;
      }
    }
    return false;
  }

  private updateBreadcrumbs(): void {
    const home: BreadcrumbItem = {
      label: 'Home',
      url: '/feature/dashboard',
      icon: 'bi-house-door',
    };
    const activeTrail = this.findActiveTrail(this.mainMenu(), this.currentUrl()) ?? [];
    const trailWithoutDashboard = activeTrail.filter((item) => item.code !== this.DASHBOARD_ITEM.code);
    const breadcrumbItems: BreadcrumbItem[] = [home];

    for (const item of trailWithoutDashboard) {
      breadcrumbItems.push({
        label: item.label,
        url: item.children?.length ? null : this.getItemLink(item.path),
        icon: item.icon,
      });
    }

    this.breadcrumbs.set(
      breadcrumbItems.map((item, index) => ({
        ...item,
        isCurrent: index === breadcrumbItems.length - 1,
        url: index === breadcrumbItems.length - 1 ? null : item.url,
      })),
    );
  }

  private findActiveTrail(items: SidebarItem[], url: string, trail: SidebarItem[] = []): SidebarItem[] | null {
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

  // ────────────────────────────────────────────────────────────────
  // Template-facing pure functions (อ่าน currentUrl() signal)
  // ────────────────────────────────────────────────────────────────

  /**
   * ใช้ใน template แทน routerLinkActive สำหรับ leaf node
   * (path ของ child คือ "bu/budt01" → full URL คือ /feature/bu/budt01)
   */
  isLeafActive(path: string | undefined): boolean {
    if (!path) return false;
    return this.isPathActive(path, this.currentUrl());
  }

  isItemActive(item: SidebarItem): boolean {
    return item.children?.length ? this.isParentActive(item) : this.isLeafActive(item.path);
  }

  /**
   * ใช้ใน template สำหรับ root/parent node ที่มี children
   * คืน true เมื่อ URL ปัจจุบันอยู่ใน subtree ของ node นี้
   */
  isParentActive(item: SidebarItem): boolean {
    if (!item.children?.length) return false;
    return this.subtreeHasActivePath(item.children, this.currentUrl());
  }

  private isPathActive(path: string, url: string): boolean {
    // รองรับทั้ง path แบบ "bu/budt01" (child) และ "/dashboard" (absolute)
    const full = path.startsWith('/') ? path : `/feature/${path}`;
    return url === full || url.startsWith(full + '/') || url.startsWith(full + '?');
  }

  private subtreeHasActivePath(items: SidebarItem[], url: string): boolean {
    return items.some(
      (item) =>
        (item.path ? this.isPathActive(item.path, url) : false) ||
        (item.children?.length ? this.subtreeHasActivePath(item.children, url) : false),
    );
  }

  getItemLink(path: string | undefined): string | null {
    if (!path) return null;
    return path.startsWith('/') ? path : `/feature/${path}`;
  }

  // ────────────────────────────────────────────────────────────────

  toggleMenu(code: string, hasChildren: boolean): void {
    if (!hasChildren) return;
    this.expandedMenus.update((curr) =>
      curr.includes(code) ? curr.filter((c) => c !== code) : [...curr, code],
    );
  }

  isExpanded(code: string): boolean {
    return this.expandedMenus().includes(code);
  }

  openMobileSidebar(): void { this.isMobileSidebarOpen.set(true); }
  closeMobileSidebar(): void { this.isMobileSidebarOpen.set(false); }
  toggleTheme(): void { this.themeService.toggleDark(); }

  toggleLanguage(): void {
    const next: AppLanguage = this.currentLanguage() === 'th' ? 'en' : 'th';
    this.languageService.setLanguage(next);
    this.currentLanguage.set(next);
    DateTimeUtil.setEra(next);
    this.loadInfomations();
  }

  logout(): void {
    this.dialog.confirm('ลงชื่ออก', 'ยืนยันการออกจากระบบหรือไม่?').then((confirmed) => {
      if (confirmed) {
        this.closeMobileSidebar();
        this.authService.logout();
      }
    });
  }

  private updateClock(): void {
    this.datetime.set(DateTimeUtil.formatDateTime(DateTimeUtil.now(), 'DD/MM/YYYY HH:mm:ss'));
  }

  ngOnDestroy(): void {
    if (this.clockTimer) clearInterval(this.clockTimer);
    if (this.routerSubscription) this.routerSubscription.unsubscribe();
  }

  onActionClick(action: SidebarAction) {
    this.service.triggerAction(action);
  }
}
