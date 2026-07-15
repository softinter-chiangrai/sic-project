import { InjectionToken } from '@angular/core';

export interface SicThemeConfig {
  mode?: 'light' | 'dark' | 'system';

  colorPrimary?: string;
  colorSuccess?: string;
  colorDanger?: string;
  colorWarning?: string;

  radiusSm?: string;
  radiusMd?: string;
  radiusLg?: string;

  fontSans?: string;
}

export const SIC_THEME_CONFIG = new InjectionToken<SicThemeConfig>('SIC_THEME_CONFIG');

const CONFIG_TO_TOKEN: Record<Exclude<keyof SicThemeConfig, 'mode'>, string> = {
  colorPrimary: '--sic-color-primary',
  colorSuccess: '--sic-color-success',
  colorDanger: '--sic-color-danger',
  colorWarning: '--sic-color-warning',
  radiusSm: '--sic-radius-sm',
  radiusMd: '--sic-radius-md',
  radiusLg: '--sic-radius-lg',
  fontSans: '--sic-font-sans',
};

export function applySicThemeConfig(config: SicThemeConfig, target: HTMLElement): void {
  for (const key of Object.keys(CONFIG_TO_TOKEN) as (keyof typeof CONFIG_TO_TOKEN)[]) {
    const value = config[key];

    if (value) {
      target.style.setProperty(CONFIG_TO_TOKEN[key], value);
    }
  }
}
