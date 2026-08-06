import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { forkJoin, map, Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export const APP_TRANSLATE_MODULE_CODE = new InjectionToken<string>(
  'APP_TRANSLATE_MODULE_CODE'
);

export const APP_TRANSLATE_PROGRAM_CODE = new InjectionToken<string>(
  'APP_TRANSLATE_PROGRAM_CODE'
);

@Injectable()
export class AppTranslateLoader implements TranslateLoader {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);
  private moduleCode = this.normalizeOrDefault(
    inject(APP_TRANSLATE_MODULE_CODE, { optional: true }),
    'COMMON'
  );
  private programCode = this.normalizeOrDefault(
    inject(APP_TRANSLATE_PROGRAM_CODE, { optional: true }),
    'ALL'
  );

  setContext(moduleCode?: string | null, programCode?: string | null): void {
    this.moduleCode = this.normalizeOrDefault(moduleCode, 'COMMON');
    this.programCode = this.normalizeOrDefault(programCode, 'ALL');
  }

  resetContext(): void {
    this.moduleCode = 'COMMON';
    this.programCode = 'ALL';
  }

  getTranslation(lang: string): Observable<TranslationObject> {
    const languageCode = this.normalizeOrDefault(lang, 'en').toLowerCase();
    const requests = [
      this.loadModuleTranslations('COMMON', 'ALL', languageCode),
    ];

    if (this.moduleCode !== 'COMMON' || this.programCode !== 'ALL') {
      requests.push(
        this.loadModuleTranslations(this.moduleCode, this.programCode, languageCode)
      );
    }

    return forkJoin(requests).pipe(
      map((translations) =>
        translations.reduce<TranslationObject>(
          (result, current) => this.deepMerge(result, current),
          {}
        )
      )
    );
  }

  private loadModuleTranslations(
    moduleCode: string,
    programCode: string,
    languageCode: string
  ): Observable<TranslationObject> {
    return this.http.get<TranslationObject>(
      `${this.apiBaseUrl}/api/i18n/${encodeURIComponent(moduleCode)}/${encodeURIComponent(programCode)}/${encodeURIComponent(languageCode)}`
    ).pipe(
      catchError(() => {
        // Prevent SSR process from crashing if the backend is down
        return of({});
      })
    );
  }

  private normalizeOrDefault(value: string | null | undefined, fallback: string): string {
    const normalized = value?.trim();
    return normalized ? normalized : fallback;
  }

  private deepMerge(
    target: TranslationObject,
    source: TranslationObject
  ): TranslationObject {
    const result: TranslationObject = { ...target };

    for (const [key, value] of Object.entries(source)) {
      const currentValue = result[key];

      if (this.isPlainObject(currentValue) && this.isPlainObject(value)) {
        result[key] = this.deepMerge(currentValue, value);
        continue;
      }

      result[key] = value;
    }

    return result;
  }

  private isPlainObject(value: unknown): value is TranslationObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
