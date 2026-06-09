import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';
import { DateTimeUtil } from './core/utils/datetime.util';
import { SicNumberConfigService } from './core/component/sic-number/sic-number.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [],
})
export class AppComponent {

  protected readonly title = signal('sic-app');
  
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);
  private readonly sicNumberConfig = inject(SicNumberConfigService);

  constructor() {
    this.themeService.initTheme();
    this.languageService.initLanguage();
    this.sicNumberConfig.setDecimal(4);

    DateTimeUtil.setDefaults({
      offset: 7,
      era:  this.languageService.getCurrentLanguage(),
      dateFormat: 'DD/MM/YYYY',
      dateTimeFormat: 'DD/MM/YYYY HH:mm',
    });
  }


  
}
