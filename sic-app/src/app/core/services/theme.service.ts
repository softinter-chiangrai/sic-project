import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  readonly mode = signal<ThemeMode>('system');
  readonly isDark = signal(false);

  private mediaQuery?: MediaQueryList;
  private mediaQueryHandler?: (event: MediaQueryListEvent) => void;

  initTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const saved = (localStorage.getItem('theme') as ThemeMode | null) ?? 'system';
    this.mode.set(saved);
    this.applyTheme(saved);
    this.bindSystemThemeListener();
  }

  setTheme(mode: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.mode.set(mode);
    localStorage.setItem('theme', mode);
    this.applyTheme(mode);
  }

  toggleDark(): void {
    const current = this.mode();

    if (current === 'dark') {
      this.setTheme('light');
      return;
    }

    this.setTheme('dark');
  }

  private applyTheme(mode: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const html = this.document.documentElement;
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.isDark.set(isDark);
    html.classList.toggle('dark', isDark);

    // optional: ช่วยให้ form/control บางตัวของ browser เปลี่ยนโทนตาม
    html.style.colorScheme = isDark ? 'dark' : 'light';
  }

  private bindSystemThemeListener(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    this.mediaQueryHandler = (event: MediaQueryListEvent) => {
      if (this.mode() !== 'system') {
        return;
      }

      const html = this.document.documentElement;
      this.isDark.set(event.matches);
      html.classList.toggle('dark', event.matches);
      html.style.colorScheme = event.matches ? 'dark' : 'light';
    };

    this.mediaQuery.addEventListener('change', this.mediaQueryHandler);
  }
}
