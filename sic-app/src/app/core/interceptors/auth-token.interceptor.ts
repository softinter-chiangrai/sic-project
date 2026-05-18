import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  const accessToken = authService.getAccessToken();
  const savedLanguage = isPlatformBrowser(platformId)
    ? localStorage.getItem('app-lang')
    : null;
  const languageCode =
    savedLanguage === 'th' || savedLanguage === 'en'
      ? savedLanguage
      : 'en';
  const isSicApiRequest = req.url.startsWith(environment.apiBaseUrl);

  const setHeaders: Record<string, string> = {};

  if (isSicApiRequest) {
    setHeaders['X-Language-Code'] = languageCode;
  }

  if (accessToken) {
    setHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  if (Object.keys(setHeaders).length === 0) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders,
    }),
  );
};