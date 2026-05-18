import { isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { TooltipDirective } from '../../directive/tooltip/tootop';
import { AppLanguage, LanguageService } from '../../services/language-service';
import { ThemeService } from '../../services/theme.service';
import { DateTimeUtil } from '../../utils/datetime.util';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '../../services/dialog.service';

type SidebarSubItem = {
  label: string;
  active?: boolean;
};

type SidebarItem = {
  label: string;
  icon: string;
  active?: boolean;
  badge?: string;
  notification?: boolean;
  children?: SidebarSubItem[];
};

@Component({
  selector: 'sic-sidebar',
  standalone: true,
  imports: [TooltipDirective, TranslateModule],
  templateUrl: './sic-sidebar.html',
  styleUrl: './sic-sidebar.css',
  host: {
    ngSkipHydration: 'true',
  },
})
export class SicSidebar implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);
  private readonly dialog = inject(DialogService);
  private clockTimer?: ReturnType<typeof setInterval>;

  readonly isMobileSidebarOpen = signal(false);
  readonly expandedMenus = signal<string[]>(['Müşteriler']);
  readonly isDark = this.themeService.isDark.asReadonly();
  readonly currentLanguage = signal<AppLanguage>(this.languageService.getCurrentLanguage());
  readonly datetime = signal('--/--/---- --:--:--');

  readonly quickActions = [
    { icon: 'bi-person-plus', label: 'Müşteri' },
    { icon: 'bi-telephone-plus', label: 'Görüşme' },
    { icon: 'bi-calendar-event', label: 'Toplantı' },
    { icon: 'bi-clipboard-check', label: 'Görev' },
  ];

  readonly mainMenu: SidebarItem[] = [
    { label: 'Dashboard', icon: 'bi-house-door', active: true },
    {
      label: 'Müşteriler',
      icon: 'bi-people',
      badge: '428',
      children: [
        { label: 'Tüm Müşteriler' },
        { label: 'Yeni Müşteriler' },
        { label: 'Aktif Müşteriler', active: true },
        { label: 'Pasif Müşteriler' },
      ],
    },
    {
      label: 'Fırsatlar',
      icon: 'bi-briefcase',
      badge: '16',
      children: [
        { label: 'Tüm Fırsatlar' },
        { label: 'Kazanılan' },
        { label: 'Kaybedilen' },
      ],
    },
    { label: 'İletişim', icon: 'bi-envelope', notification: true },
    { label: 'Takvim', icon: 'bi-calendar3' },
    { label: 'Görevler', icon: 'bi-check2-square' },
    { label: 'Dokümanlar', icon: 'bi-file-earmark-text' },
  ];

  readonly reportMenu: SidebarItem[] = [
    { label: 'Satış', icon: 'bi-bar-chart-line' },
    { label: 'Performans', icon: 'bi-graph-up-arrow' },
  ];

  readonly settingsMenu: SidebarItem[] = [
    { label: 'Profil', icon: 'bi-person' },
    { label: 'Ayarlar', icon: 'bi-gear' },
  ];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    setTimeout(() => {
      this.updateClock();
      this.clockTimer = setInterval(() => this.updateClock(), 1000);
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.clockTimer) {
      clearInterval(this.clockTimer);
    }
  }

  toggleMenu(label: string, hasChildren: boolean): void {
    if (!hasChildren) {
      return;
    }

    this.expandedMenus.update((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  }

  isExpanded(label: string): boolean {
    return this.expandedMenus().includes(label);
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
