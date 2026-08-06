import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type SicThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'sic-ng-theme';

@Injectable({
  providedIn: 'root',
})
export class SicThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  readonly mode = signal<SicThemeMode>('system');
  readonly isDark = signal(false);

  private mediaQuery?: MediaQueryList;
  private mediaQueryHandler?: (event: MediaQueryListEvent) => void;

  init(defaultMode: SicThemeMode = 'system'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const saved = (localStorage.getItem(STORAGE_KEY) as SicThemeMode | null) ?? defaultMode;
    this.mode.set(saved);
    this.applyTheme(saved);
    this.bindSystemThemeListener();
  }

  setTheme(mode: SicThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.mode.set(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    this.applyTheme(mode);
  }

  toggleDark(): void {
    this.setTheme(this.mode() === 'dark' ? 'light' : 'dark');
  }

  private applyTheme(mode: SicThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const html = this.document.documentElement;
    const isDark =
      mode === 'dark' ||
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    this.isDark.set(isDark);
    html.classList.toggle('dark', isDark);
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
