import { APP_INITIALIZER, DOCUMENT, EnvironmentProviders, Provider, inject, makeEnvironmentProviders } from '@angular/core';
import { SIC_THEME_CONFIG, SicThemeConfig, applySicThemeConfig } from './theme.config';
import { SicThemeService } from './theme.service';

export function provideSicTheme(config: SicThemeConfig = {}): EnvironmentProviders {
  const providers: Provider[] = [
    { provide: SIC_THEME_CONFIG, useValue: config },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => () => {
        const document = inject(DOCUMENT);
        const themeService = inject(SicThemeService);

        applySicThemeConfig(config, document.documentElement);
        themeService.init(config.mode ?? 'system');
      },
    },
  ];

  return makeEnvironmentProviders(providers);
}
