import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'th' | 'en';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translate = inject(TranslateService);

  private readonly storageKey = 'app-lang';

  constructor() {
    this.translate.onLangChange.subscribe(({ lang }) => {
      this.updateHtmlLang(lang as AppLanguage);
    });
  }

  initLanguage(): void {
    const lang = this.resolveInitialLanguage();

    this.translate.use(lang);
    this.updateHtmlLang(lang);
  }

  setLanguage(lang: AppLanguage): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, lang);
    }

    this.translate.use(lang);
    this.updateHtmlLang(lang);
  }

  getCurrentLanguage(): AppLanguage {
    const current = this.translate.getCurrentLang();

    if (current === 'th' || current === 'en') {
      return current;
    }
    return 'en';
  }

  private resolveInitialLanguage(): AppLanguage {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.storageKey);

      if (saved === 'th' || saved === 'en') {
        return saved;
      }

      const browserLang =
        navigator.language ||
        (Array.isArray(navigator.languages) ? navigator.languages[0] : '') ||
        '';

      return browserLang.toLowerCase().startsWith('th') ? 'th' : 'en';
    }

    return 'en';
  }

  private updateHtmlLang(lang: AppLanguage): void {
    const html = this.document.documentElement;
    html.lang = lang;
    html.dir = 'ltr';
  }
}