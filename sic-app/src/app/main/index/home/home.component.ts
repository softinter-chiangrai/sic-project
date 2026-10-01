import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

export type HeroDemoTab = 'pm' | 'bu' | 'su' | 'ai';

@Component({
  selector: 'app-home',
  imports: [TranslateModule],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.css',
})
export class Home {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);

  readonly isDark = this.themeService.isDark.asReadonly();
  readonly activeHeroTab = signal<HeroDemoTab>('pm');
  readonly activeWorkflowStep = signal<number>(1);
  readonly copiedStatus = signal<boolean>(false);

  setHeroTab(tab: HeroDemoTab): void {
    this.activeHeroTab.set(tab);
  }

  setWorkflowStep(step: number): void {
    this.activeWorkflowStep.set(step);
  }

  login(): void {
    if (this.authService.isLoggedIn()) {
      void this.router.navigate(['feature']);
    } else {
      void this.authService.login('/feature/dashboard');
    }
  }

  scrollToSection(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToFeatures(): void {
    this.scrollToSection('features');
  }

  copyApiSnippet(): void {
    void navigator.clipboard.writeText('https://sic-api.softinter.co.th/api/v1/projects');
    this.copiedStatus.set(true);
    setTimeout(() => this.copiedStatus.set(false), 2000);
  }
}
