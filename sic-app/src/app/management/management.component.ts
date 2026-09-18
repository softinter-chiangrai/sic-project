import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SicContainerComponent } from "../core/component/sic-container/sic-container.component";
import { ThemeService } from '../core/services/theme.service';
import { AppLanguage, LanguageService } from '../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '../core/services/dialog.service';
import { AuthService } from '../core/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { APP_TRANSLATE_MODULE_CODE, APP_TRANSLATE_PROGRAM_CODE, AppTranslateLoader } from '../core/services/app-translate-loader.service';

@Component({
  selector: 'app-management',
  imports: [RouterOutlet, TranslateModule, SicContainerComponent],
  templateUrl: './management.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './management.component.css',
})
export class Management {

  readonly dialog = inject(DialogService);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly languageService = inject(LanguageService);
  readonly translate = inject(TranslateService);
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
    this.dialog.confirm(
      this.translate.instant('MANAGEMENT.APP.LOGOUT_CONFIRM_TITLE'),
      this.translate.instant('MANAGEMENT.APP.LOGOUT_CONFIRM_MESSAGE')
    ).then((confirmed) => {
      if (confirmed) {
        this.authService.logout();
      }
    });
  }

}
