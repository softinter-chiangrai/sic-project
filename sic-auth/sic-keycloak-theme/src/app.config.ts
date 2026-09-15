import type { ApplicationConfig } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideSicTheme, provideSicConfig } from 'sic-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    // login page ตั้งใจให้เป็นการ์ดขาวเสมอตามดีไซน์ — บังคับ mode: 'light' แทน 'system'
    // ไม่งั้นเครื่องผู้ใช้ที่ตั้ง dark mode ของ OS ไว้จะเห็นการ์ดเป็นสีเข้มแทน
    provideSicTheme({ mode: 'light', theme: 'default' }),
    provideSicConfig({}),
  ],
};
