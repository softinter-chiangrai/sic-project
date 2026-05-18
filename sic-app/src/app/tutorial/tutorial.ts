import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-tutorial',
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './tutorial.html',
  styleUrl: './tutorial.css',
})
export class Tutorial {
  private readonly themeService = inject(ThemeService);
  readonly openMenu = signal<'cli' | 'component' | 'service' | null>(null);

  readonly cliMenus = [
    'ng generate component',
    'ng generate service',
    'ng build',
    'ng test',
  ];

  readonly componentMenus = [
    'SicButton',
    'SicCombobox',
    'SicInput',
    'SicNumber',
    'SicStepper',
    'SicSidebar',
    'SicTooltip',
    'SicDialog',
  ];

  readonly serviceMenus = [
    'ThemeService',
    'LanguageService',
    'DialogService',
    'AppTranslateLoader',
  ];

  toggleTheme(): void {
    this.themeService.toggleDark();
  }

  openDropdown(menu: 'cli' | 'component' | 'service'): void {
    this.openMenu.set(menu);
  }

  closeMenu(): void {
    this.openMenu.set(null);
  }
}
