import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { OAuthEvent, OAuthService } from 'angular-oauth2-oidc';
import { filter } from 'rxjs';
import { authConfig } from './auth.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser: boolean;
  private initialized = false;

  constructor(
    private readonly oauth: OAuthService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.oauth.configure(authConfig);
      this.oauth.setupAutomaticSilentRefresh();
      this.oauth.events
        .pipe(filter((event: OAuthEvent) => event.type === 'token_expires'))
        .subscribe(() => {
          void this.refreshToken();
        });
    }
  }

  async initializeAuth(): Promise<boolean> {
    if (!this.isBrowser) return false;

    if (this.initialized) {
      return this.oauth.hasValidAccessToken();
    }

    this.initialized = true;

    try {
      await this.oauth.loadDiscoveryDocumentAndTryLogin();
    } catch (error) {
      console.error('Failed to load Keycloak discovery document:', error);
      return false;
    }

    if (this.oauth.hasValidAccessToken()) {
      return true;
    }

    if (this.oauth.getRefreshToken()) {
      return this.refreshToken();
    }

    return false;
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    return this.oauth.hasValidAccessToken();
  }

  getAccessToken(): string | null {
    if (!this.isBrowser) return null;

    const token = this.oauth.getAccessToken();
    return token || null;
  }

  getIdentityClaims(): any {
    if (!this.isBrowser) return null;
    return this.oauth.getIdentityClaims();
  }

  isAdmin(): boolean {
    if (!this.isBrowser) return false;
    const claims = this.getIdentityClaims();
    if (!claims) return false;
    
    // Check keycloak realm roles
    const roles = claims.realm_access?.roles || [];
    const isKeycloakAdmin = roles.includes('ADMIN') || roles.includes('admin');
    
    // Fallback/direct check for admin email
    const isEmailAdmin = claims.email === 'supachaiinchaitap@gmail.com';
    
    return isKeycloakAdmin || isEmailAdmin;
  }

  login(returnUrl: string) {
    if (!this.isBrowser) return;
    console.log('[DEBUG] auth.login called with returnUrl:', returnUrl);
    console.log('[DEBUG] loginUrl from discovery:', this.oauth.loginUrl);
    try {
      this.oauth.initCodeFlow(returnUrl);
    } catch (err) {
      console.error('[DEBUG] initCodeFlow crashed!', err);
    }
  }

  logout(): void {
    if (!this.isBrowser) return;
    
    // Prevent Keycloak "Missing id_token_hint" error by performing a local logout
    // if the user doesn't actually have an active ID token to send to the server.
    if (!this.oauth.getIdToken()) {
      this.oauth.logOut(true);
      window.location.href = '/';
      return;
    }
    
    this.oauth.logOut();
  }

  async handleCallback(): Promise<boolean> {
    if (!this.isBrowser) return false;
    return this.initializeAuth();
  }

  async refreshToken(): Promise<boolean> {
    if (!this.isBrowser || !this.oauth.getRefreshToken()) {
      return false;
    }

    try {
      await this.oauth.refreshToken();
      return this.oauth.hasValidAccessToken();
    } catch (error) {
      console.error('Token refresh failed', error);
      this.oauth.logOut(true);
      return false;
    }
  }

  consumeReturnUrlFromState(): string | null {
    if (!this.isBrowser) return null;

    const raw = this.oauth.state;
    if (!raw) return null;

    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
}
