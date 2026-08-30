import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-auth-callback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:system-ui">
      <div style="text-align:center">
        <p style="font-size:1.125rem;color:#4b5563">กำลังเข้าสู่ระบบ...</p>
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly ngZone: NgZone,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    void this.handleLogin();
  }

  private async handleLogin(): Promise<void> {
    try {
      const ok = await this.auth.handleCallback();
      const returnUrl = this.auth.consumeReturnUrlFromState() || '/';

      this.ngZone.run(() => {
        if (!ok) {
          console.warn('[AuthCallback] Token validation failed, redirecting to home');
          void this.router.navigateByUrl('/', { replaceUrl: true });
          return;
        }

        void this.router.navigateByUrl(returnUrl, { replaceUrl: true });
      });
    } catch (error) {
      console.error('[AuthCallback] Error during callback handling:', error);
      this.ngZone.run(() => {
        void this.router.navigateByUrl('/', { replaceUrl: true });
      });
    }
  }
}