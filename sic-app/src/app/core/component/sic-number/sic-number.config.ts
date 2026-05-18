import { Injectable, InjectionToken, Provider, inject, signal } from '@angular/core';

export interface SicNumberConfig {
  decimal: number;
}

export const SIC_NUMBER_CONFIG = new InjectionToken<SicNumberConfig>('SIC_NUMBER_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    decimal: 4,
  }),
});

@Injectable({
  providedIn: 'root',
})
export class SicNumberConfigService {
  private readonly initialConfig = inject(SIC_NUMBER_CONFIG);
  private readonly state = signal<SicNumberConfig>(this.initialConfig);

  readonly config = this.state.asReadonly();

  setConfig(config: Partial<SicNumberConfig>): void {
    this.state.update((current) => ({
      ...current,
      ...config,
    }));
  }

  setDecimal(decimal: number): void {
    this.setConfig({ decimal });
  }
}

type SicNumberConfigInput = Partial<SicNumberConfig> | (() => Partial<SicNumberConfig>);

export function provideSicNumberConfig(config: SicNumberConfigInput): Provider {
  const resolvedConfig = typeof config === 'function' ? config() : config;

  return {
    provide: SIC_NUMBER_CONFIG,
    useValue: {
      decimal: resolvedConfig.decimal ?? 4,
    } satisfies SicNumberConfig,
  };
}
