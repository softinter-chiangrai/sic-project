import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AppLanguage, LanguageService } from '../../core/services/language.service';
import { TooltipDirective } from "../../core/directive/tooltip/tootop.directive";
import { SicButtonComponent } from "../../core/component/sic-button/sic-button.component";
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-index',
  imports: [RouterOutlet, TooltipDirective, SicButtonComponent,TranslateModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css',
  providers: [],
})
export class Index {

  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);
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
    void this.router.navigate(['feature']);
  }
  
}
