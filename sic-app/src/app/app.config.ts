import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AuthService } from './core/auth/auth.service';
import { LanguageService } from './core/services/language.service';
import {
  APP_TRANSLATE_MODULE_CODE,
  APP_TRANSLATE_PROGRAM_CODE,
  AppTranslateLoader
} from './core/services/app-translate-loader.service';
import { provideSicNumberConfig } from './core/component/sic-number/sic-number.config';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authTokenInterceptor])),
    provideEnvironmentNgxMask(),
    provideSicNumberConfig({ decimal: 2 }),
    provideOAuthClient(),
    provideAppInitializer(() => inject(AuthService).initializeAuth()),
    provideAppInitializer(() => inject(LanguageService).initLanguage()),
    { provide: APP_TRANSLATE_MODULE_CODE, useValue: 'COMMON' },
    { provide: APP_TRANSLATE_PROGRAM_CODE, useValue: 'ALL' },
    { provide: APP_TRANSLATE_PROGRAM_CODE, useValue: 'TEST' },
    AppTranslateLoader,
    provideTranslateService({
      lang: 'th',
      fallbackLang: 'en',
      loader: {
        provide: TranslateLoader,
        useExisting: AppTranslateLoader
      }
    })
  ]
};
