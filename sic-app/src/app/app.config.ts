import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AuthService } from './core/auth/auth.service';
import { LanguageService } from './core/services/language.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  APP_TRANSLATE_MODULE_CODE,
  APP_TRANSLATE_PROGRAM_CODE,
  AppTranslateLoader
} from './core/services/app-translate-loader.service';
import { provideSicNumberConfig } from './core/component/sic-number/sic-number.config';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { provideMarkdown } from 'ngx-markdown';
import { provideAngularQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { provideAteEditor } from '@flogeez/angular-tiptap-editor';
import { provideSicTheme, provideSicConfig } from 'sic-ng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    provideAngularQuery(new QueryClient()),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authTokenInterceptor])),
    provideEnvironmentNgxMask(),
    provideSicNumberConfig({ decimal: 2 }),
    provideOAuthClient(),
    provideMarkdown(),
    provideAteEditor(),
    provideAngularQuery(new QueryClient()),
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
    }),
    provideSicTheme({ mode: 'system' }),
    provideSicConfig({
      decimals: 2,
      dateFormat: 'dd/MM/yyyy',
      era: 'BE',
      locale: 'th',
      loadingImage: '/assets/brand-loader.gif',
      maxUploadSizeMb: 20,
      pageSize: 25,
      messages: {
        // sic-combobox
        noOptions: 'ไม่มีตัวเลือก',
        // sic-input-comment @mention
        noMatches: 'ไม่พบรายการที่ตรงกัน',
        loading: 'กำลังโหลด…',
        attachFile: 'แนบไฟล์',
        removeFile: 'ลบไฟล์แนบ',
        // sic-upload
        dragDropHint: 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์',
        // sic-navbar
        noNotifications: 'ไม่มีการแจ้งเตือน',
        viewAllNotifications: 'ดูการแจ้งเตือนทั้งหมด',
        // sic-calendar
        noEvents: 'ไม่มีกิจกรรม',
        // sic-dialog common dialog
        cancel: 'ยกเลิก',
        confirm: 'ยืนยัน',
        close: 'ปิด',
        // sic-gridpanel
        gridLoading: 'กำลังโหลด...',
        gridSaving: 'กำลังบันทึกข้อมูล...',
        gridLoadingOverlay: 'กำลังโหลดข้อมูล...',
        gridNoData: 'ไม่พบข้อมูล',
        gridNoChangedData: 'ไม่มีข้อมูลที่เปลี่ยนแปลง',
        gridNoDataHint: 'ลองปรับคำค้นหา หรือเพิ่มแถวใหม่',
        gridNoChangedDataHint: 'ลองปิดโหมด review เพื่อดูทุกแถว',
        gridPageSizeSuffix: ' รายการ',
        // sic-search
        noResults: 'ไม่พบผลลัพธ์',
        // sic-masonry / sic-calendar-timeline / sic-card-stack
        noItems: 'ไม่มีรายการ',
        masonryLoading: 'กำลังโหลดเพิ่มเติม...',
        // sic-drag-drop
        dragDropEmptyList: 'วางรายการที่นี่',
        // sic-stepper
        stepperPrevious: 'ย้อนกลับ',
        stepperNext: 'ถัดไป',
        stepperSkip: 'ข้าม',
        stepperFinish: 'เสร็จสิ้น',
        // sic-code
        codeCopy: 'คัดลอก',
        codeCopied: 'คัดลอกแล้ว',
        // sic-calendar-timeline view switcher
        calendarTimelineViewLabel: 'มุมมอง',
        calendarTimelineDay: 'วัน',
        calendarTimelineWeek: 'สัปดาห์',
        calendarTimelineMonth: 'เดือน',
        // sic-video-player
        playVideo: 'เล่นวิดีโอ',
        // sicCanDeactivateGuard
        unsavedChangesTitle: 'มีการเปลี่ยนแปลงที่ยังไม่บันทึก',
        unsavedChangesMessage: 'คุณมีการเปลี่ยนแปลงที่ยังไม่บันทึก ต้องการออกจากหน้านี้หรือไม่?',
      },
    }),
  ]
};