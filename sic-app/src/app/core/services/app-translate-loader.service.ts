import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, catchError, of } from 'rxjs';

export const APP_TRANSLATE_MODULE_CODE = new InjectionToken<string>(
  'APP_TRANSLATE_MODULE_CODE'
);

export const APP_TRANSLATE_PROGRAM_CODE = new InjectionToken<string>(
  'APP_TRANSLATE_PROGRAM_CODE'
);

@Injectable()
export class AppTranslateLoader implements TranslateLoader {
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
    return this.http.get<TranslationObject>(`/assets/i18n/${languageCode}.json`).pipe(
      catchError(() => {
        // Prevent SSR process from crashing if the JSON file is missing
        return of({});
      })
    );
  }

  private normalizeOrDefault(value: string | null | undefined, fallback: string): string {
    const normalized = value?.trim();
    return normalized ? normalized : fallback;
  }
}
