import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-auth-callback',
  template: `
    <div style="padding:16px;font-family:system-ui">
      <p>Signing you in...</p>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    void this.handleLogin();
  }

  private async handleLogin(): Promise<void> {
    const ok = await this.auth.handleCallback();
    if (!ok) {
      console.error('[DEBUG] handleCallback failed! User might have received an error from Keycloak.');
      await this.router.navigateByUrl('/');
      return;
    }

    const returnUrl = this.auth.consumeReturnUrlFromState() || '/';

    await this.router.navigateByUrl(returnUrl);
  }
}