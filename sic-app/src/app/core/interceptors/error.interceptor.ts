import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export function extractErrorMessage(err: HttpErrorResponse, fallback: string): string {
  const body = err.error;
  if (body) {
    if (typeof body === 'string' && body.trim()) return body;
    if (typeof body.message === 'string' && body.message.trim()) return body.message;
    if (Array.isArray(body.errors) && body.errors.length) {
      return body.errors.map((e: unknown) => (typeof e === 'string' ? e : (e as any)?.message)).filter(Boolean).join(', ');
    }
  }
  return err.statusText || fallback;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isSicApiRequest = req.url.startsWith(environment.apiBaseUrl);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && isSicApiRequest && err.status === 401) {
        authService.logout();
      }
      return throwError(() => err);
    }),
  );
};
