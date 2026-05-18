import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const auth = inject(AuthService);

  // SSR: อย่าพยายาม redirect ออกนอกเว็บบนฝั่ง server
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Browser: ถ้า login แล้ว ให้ผ่าน
  if (auth.isLoggedIn()) {
    return true;
  }

  // ยังไม่ login -> เด้งไป Keycloak พร้อม returnUrl เป็น URL ที่พยายามเข้า
  auth.login(state.url || '/feture');

  // cancel navigation (เพราะกำลังจะไป Keycloak)
  return false;
};