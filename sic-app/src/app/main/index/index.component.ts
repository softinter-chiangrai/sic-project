import { Component, inject, PLATFORM_ID, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AppLanguage, LanguageService } from '../../core/services/language.service';
import { AuthService } from '../../core/auth/auth.service';
import { TooltipDirective } from "../../core/directive/tooltip/tootop.directive";
import { SicButtonComponent } from "sic-ng";
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-index',
  imports: [RouterOutlet, TooltipDirective, SicButtonComponent,TranslateModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [],
})
export class Index {

  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);
  private readonly authService = inject(AuthService);
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

  login(): void {
    console.log('[DEBUG] "Sign In" button clicked!');
    if (this.authService.isLoggedIn()) {
      void this.router.navigate(['feature']);
    } else {
      void this.authService.login('/feature/dashboard');
    }
  }
  
}
