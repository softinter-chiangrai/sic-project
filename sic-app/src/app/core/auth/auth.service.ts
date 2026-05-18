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
    private oauth: OAuthService,
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

    await this.oauth.loadDiscoveryDocumentAndTryLogin();

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

  login(returnUrl: string) {
    if (!this.isBrowser) return;
    this.oauth.initCodeFlow(returnUrl);
  }

  logout(): void {
    if (!this.isBrowser) return;
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
