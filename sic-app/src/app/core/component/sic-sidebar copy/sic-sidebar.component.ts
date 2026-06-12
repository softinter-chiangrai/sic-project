import { isPlatformBrowser } from '@angular/common';
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
import { RouterLink } from "@angular/router";
import { Router } from 'express';

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
  active?: boolean;
  badge?: string;
  notification?: boolean;
  children?: SidebarSubItem[];
};

@Component({
  selector: 'sic-sidebar',
  standalone: true,
  imports: [TooltipDirective, TranslateModule, RouterLink],
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
  private readonly router = inject(Router);

  private clockTimer?: ReturnType<typeof setInterval>;

  readonly isMobileSidebarOpen = signal(false);
  readonly expandedMenus = signal<string[]>(
    JSON.parse(localStorage.getItem('expandedMenus') || '[]')
  );
  readonly isDark = this.themeService.isDark.asReadonly();
  readonly currentLanguage = signal<AppLanguage>(this.languageService.getCurrentLanguage());
  readonly datetime = signal('--/--/---- --:--:--');

  private readonly DASHBOARD_ITEM: SidebarItem = {code: 'dashboard', label: 'Dashboard', icon: 'bi-house-door', active: true, path: '/feature'};

  readonly mainMenu = signal<SidebarItem[]>([this.DASHBOARD_ITEM]);


  profile:ProfileInfoModel = {} as ProfileInfoModel;
  business:BusinessInfoModel = {} as BusinessInfoModel;

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
      debugger;
      // 1. Map เมนูตามปกติ (ฟังก์ชัน mapMenuItem ด้านในจะเปลี่ยนค่า item.active และ child.active ให้แล้ว)
      this.mainMenu.set([this.DASHBOARD_ITEM, ...menu.map(item => this.mapMenuItem(item))]);
      
      // 2. ดึงค่ารายการเมนูที่กางอยู่ ณ ปัจจุบันใน Signal ออกมา
      const currentlyExpanded = this.expandedMenus();
      // เตรียม Array ใหม่สำหรับเก็บค่าที่จะสั่งกางเพิ่ม
      const newExpands: string[] = [];

      // 3. วนลูปเช็คสถานะเมนูหลักแต่ละตัว
      this.mainMenu().forEach(item => {
        // ถ้าเมนูหลักตัวนี้ active อยู่ หรือ มีเมนูลูกตัวใดตัวหนึ่ง active อยู่
        const hasActiveChild = item.children?.some(child => child.active);
        
        if (item.active || hasActiveChild) {
          // เช็คว่าเมนูนี้มีลูกไหม และ ใน expandedMenus ปัจจุบันยังไม่มี code นี้ใช่หรือไม่
          if (item.children?.length && !currentlyExpanded.includes(item.code)) {
            newExpands.push(item.code);
          }
        }
      });

      // 4. ถ้ามีเมนูที่ต้องกางเพิ่ม ให้ทำการอัปเดต Signal (ซึ่งจะส่งผลให้เซฟลง localStorage อัตโนมัติผ่าน effect)
      if (newExpands.length > 0) {
        this.expandedMenus.update(current => [...current, ...newExpands]);
      }
    });
  }

  private mapMenuItem(item: MenuItemModel): SidebarItem {
    return {
      label: item.name,
      icon: item.icon ?? 'bi-circle',
      path: item.path ?? undefined,
      code: item.code,
      children: item.children?.length
        ? item.children.map(c => ({ label: c.name, path: c.path ?? undefined }))
        : undefined,
    };
  }

  ngOnDestroy(): void {
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }
  }

  toggleMenu(code: string, hasChildren: boolean): void {
    if (!hasChildren) {
      return;
    }

    this.expandedMenus.update((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
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

    if (isPlatformBrowser(this.platformId)) {
      this.updateClock();
    }
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
    this.datetime.set(DateTimeUtil.formatDateTime(DateTimeUtil.now(),'DD/MM/YYYY HH:mm:ss'));
  }
}
