import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { TooltipDirective } from '../../directive/tooltip/tootop.directive';
import { AppLanguage, LanguageService } from '../../services/language.service';
import { ThemeService } from '../../services/theme.service';
import { DateTimeUtil } from '../../utils/datetime.util';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '../../services/dialog.service';
import { SicSidebarService } from './sic-sidebar.service';
import { BusinessInfoModel, MenuItemModel, ProfileInfoModel } from './sic-sidebar.model';
import { Router, RouterLink, NavigationEnd, RouterLinkActive } from '@angular/router'; // เพิ่ม Router และ NavigationEnd ตรงนี้
import { filter, Subscription } from 'rxjs'; // เพิ่มเครื่องมือ RxJS สำหรับดักฟังเส้นทาง

type SidebarSubItem = {
  label: string;
  path?: string;
  active?: boolean;
};

type SidebarItem = {
  code: string;
  label: string;
  icon: string;
  path?: string;
  badge?: string;
  notification?: boolean;
  children?: SidebarSubItem[];
};

@Component({
  selector: 'sic-sidebar',
  standalone: true,
  imports: [TooltipDirective, TranslateModule, RouterLink,RouterLinkActive],
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
  public readonly router = inject(Router); // Inject Router เพิ่มเติมที่นี่

  private clockTimer?: ReturnType<typeof setInterval>;
  private routerSubscription?: Subscription; // ตัวเก็บ Subscription สำหรับเคลียร์ความจำตอนทำลายคอมโพเนนต์

  readonly isMobileSidebarOpen = signal(false);
  readonly expandedMenus = signal<string[]>(
    JSON.parse(localStorage.getItem('expandedMenus') || '[]'),
  );
  readonly isDark = this.themeService.isDark.asReadonly();
  readonly currentLanguage = signal<AppLanguage>(this.languageService.getCurrentLanguage());
  readonly datetime = signal('--/--/---- --:--:--');

  private readonly DASHBOARD_ITEM: SidebarItem = {
    code: 'dashboard',
    label: 'Dashboard',
    icon: 'bi-house-door',
    path: '/feature/dashboard',
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
      const currentMenus = this.expandedMenus();
      localStorage.setItem('expandedMenus', JSON.stringify(currentMenus));
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadInfomations();

    // ติดตามการเปลี่ยนแปลงของ URL: เมื่อไหร่ก็ตามที่ย้ายหน้า ให้คำนวณความ Active และสั่ง Auto Expand ใหม่ทันที
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveStatesAndExpands();
      });

    setTimeout(() => {
      this.updateClock();
      this.clockTimer = setInterval(() => this.updateClock(), 1000);
    }, 0);
  }

  loadInfomations(): void {
    this.service.getProfile().subscribe((profile) => {
      this.profile = profile;
    });

    this.service.getBusiness().subscribe((business) => {
      this.business = business;
    });

    this.service.getMenu().subscribe((menu) => {
      // 1. Map รายการเมนูพื้นฐานเข้าสู่ระบบก่อน
      this.mainMenu.set([this.DASHBOARD_ITEM, ...menu.map((item) => this.mapMenuItem(item))]);

      // 2. ดึงค่า URL จริงและปัจจุบันของเบราว์เซอร์ ณ วินาทีนี้ออกมา
      let currentUrl = this.router.url;

      // 3. ดึงรายการเมนูที่เก็บว่ากางอยู่ปัจจุบันใน LocalStorage / Signal ออกมา
      const currentlyExpanded = this.expandedMenus();
      const newExpands: string[] = [];

      // 4. วนลูปตรวจสอบว่าเมนูหลักตัวไหน หรือเมนูลูกตัวไหน มี path ที่ตรงกับ URL ปัจจุบัน
      this.mainMenu().forEach((item) => {
        // เช็คว่า URL ปัจจุบัน ตรงกับ Path ของเมนูหลักตัวนี้ไหม
        const isMainUrlMatched = item.path ? currentUrl.startsWith(item.path) : false;

        // เช็คว่า URL ปัจจุบัน ตรงกับ Path ของเมนูลูกตัวใดตัวหนึ่งในเมนูหลักนี้ไหม
        // (ใช้ ?. เผื่อกรณี children เป็น undefined เพื่อป้องกัน Error Cannot read properties of undefined (reading 'some'))
        const isChildUrlMatched =
          item.children?.some((child) => (child.path ? currentUrl.includes(child.path) : false)) ??
          false;

        // ถ้า URL ตรงกับเมนูหลัก หรือตรงกับเมนูลูกตัวใดตัวหนึ่ง
        if (isMainUrlMatched || isChildUrlMatched) {
          // ตรวจสอบว่าเมนูหลักนี้มีกลุ่มเมนูลูกอยู่จริงไหม และในระบบความจำปัจจุบันยังไม่ได้ถูกสั่งสั่งกางใช่หรือไม่
          if (item.children?.length && !currentlyExpanded.includes(item.code)) {
            newExpands.push(item.code); // บันทึก code เพื่อเตรียมสั่งกางออก
          }
        }
      });

      // 5. หากพบเมนูที่เข้าเงื่อนไขและยังไม่ถูกกาง ให้ทำการอัปเดตระบบสั่งกางทันที
      if (newExpands.length > 0) {
        this.expandedMenus.update((current) => [...current, ...newExpands]);
      }
    });
  }

  // ฟังก์ชันส่วนกลางในการคำนวณ Active และหาเมนูที่ต้องกางออกอัตโนมัติ
  private updateActiveStatesAndExpands(): void {
    const currentMenus = this.mainMenu();
    let changed = false;

    // 1. อัปเดตสถานะ Active ของแต่ละ Node ในใจตามจริงของ Router สถานะปัจจุบัน
    const updatedMenus = currentMenus.map((item) => {
      const isMainActive = item.path
        ? this.router.isActive(item.path, {
            paths: 'exact',
            queryParams: 'ignored',
            fragment: 'ignored',
            matrixParams: 'ignored',
          })
        : false;

      const updatedChildren = item.children?.map((child) => {
        const isChildActive = child.path
          ? this.router.isActive(child.path, {
              paths: 'exact',
              queryParams: 'ignored',
              fragment: 'ignored',
              matrixParams: 'ignored',
            })
          : false;
        return { ...child, active: isChildActive };
      });

      return {
        ...item,
        active: isMainActive,
        children: updatedChildren,
      };
    });

    this.mainMenu.set(updatedMenus);

    // 2. เช็คหาตัวที่ระบบเปิดทำงานอยู่ว่าถูกสั่งกางเมนู (Expand) ไว้ในความจำระบบแล้วหรือยัง
    const currentlyExpanded = this.expandedMenus();
    const newExpands: string[] = [];

    this.mainMenu().forEach((item) => {
      const hasActiveChild = item.children?.some((child) => child.active);
      if (hasActiveChild) {
        if (item.children?.length && !currentlyExpanded.includes(item.code)) {
          newExpands.push(item.code);
        }
      }
    });

    if (newExpands.length > 0) {
      this.expandedMenus.update((current) => [...current, ...newExpands]);
    }
  }

  private mapMenuItem(item: MenuItemModel): SidebarItem {
    return {
      label: item.name,
      icon: item.icon ?? 'bi-circle',
      path: item.path ?? undefined,
      code: item.code,
      // แก้ไขบั๊ก .map of undefined: เพิ่มเครื่องหมาย ?. เพื่อตรวจสอบว่ามี children หรือไม่ก่อนทำงาน
      children: item.children?.length
        ? item.children.map((c) => ({ label: c.name, path: c.path ?? undefined, active: false }))
        : undefined,
    };
  }

  ngOnDestroy(): void {
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  toggleMenu(code: string, hasChildren: boolean): void {
    if (!hasChildren) {
      return;
    }
    this.expandedMenus.update((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    );
  }

  isExpanded(code: string): boolean {
    return this.expandedMenus().includes(code);
  }

  openMobileSidebar(): void {
    this.isMobileSidebarOpen.set(true);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  toggleTheme(): void {
    this.themeService.toggleDark();
  }

  toggleLanguage(): void {
    const nextLanguage: AppLanguage = this.currentLanguage() === 'th' ? 'en' : 'th';
    this.languageService.setLanguage(nextLanguage);
    this.currentLanguage.set(nextLanguage);
    DateTimeUtil.setEra(nextLanguage);
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
}
