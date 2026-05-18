import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { SicContainer } from "../core/component/sic-container/sic-container";
import { ThemeService } from '../core/services/theme.service';
import { AppLanguage, LanguageService } from '../core/services/language-service';
import { TooltipDirective } from '../core/directive/tooltip/tootop';
import { SicButton } from '../core/component/sic-button/sic-button';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '../core/services/dialog.service';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-management',
  imports: [RouterOutlet, TooltipDirective, SicButton, TranslateModule, SicContainer, RouterLinkWithHref],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css',
})
export class Management {

  readonly dialog = inject(DialogService);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly languageService = inject(LanguageService);
  readonly isDark = this.themeService.isDark.asReadonly();
  readonly currentLanguage = signal<AppLanguage>(this.languageService.getCurrentLanguage());

  toggleTheme(): void {
    this.themeService.toggleDark();
  }

  toggleLanguage(): void {
    const nextLanguage: AppLanguage = this.currentLanguage() === 'th' ? 'en' : 'th';
    this.languageService.setLanguage(nextLanguage);
    this.currentLanguage.set(nextLanguage);
  }

  logout(): void {
    this.dialog.confirm('ลงชื่ออก', 'ยืนยันการออกจากระบบหรือไม่?').then((confirmed) => {
      if (confirmed) {
        this.authService.logout();
      }
    });
  }

}
