import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  console.log('[DEBUG] authGuard evaluating navigation to:', state.url);
  const platformId = inject(PLATFORM_ID);
  const auth = inject(AuthService);

  if (!isPlatformBrowser(platformId)) {
    console.log('[DEBUG] authGuard: SSR detected, allowing navigation');
    return true;
  }

  if (auth.isLoggedIn()) {
    console.log('[DEBUG] authGuard: User is logged in, allowing navigation');
    return true;
  }

  console.log('[DEBUG] authGuard: User NOT logged in. Calling auth.login() to redirect to Keycloak...');
  auth.login(state.url || '/feature');
  return false;
};