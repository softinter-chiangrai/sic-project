import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { AuthService } from './core/auth/auth.service';
import { LanguageService } from './core/services/language.service';
import { AiModelsService } from './core/services/ai-models.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  APP_TRANSLATE_MODULE_CODE,
  APP_TRANSLATE_PROGRAM_CODE,
  AppTranslateLoader
} from './core/services/app-translate-loader.service';
import { provideSicNumberConfig } from './core/component/sic-number/sic-number.config';
import { authTokenInterceptor } from './core/interceptors/auth-token.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideMarkdown } from 'ngx-markdown';
import { provideAngularQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { provideAteEditor } from '@flogeez/angular-tiptap-editor';
import { provideSicTheme, provideSicConfig } from 'sic-ng';

function getActiveAppLanguage(): 'th' | 'en' {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = localStorage.getItem('app-lang');
    if (saved === 'th' || saved === 'en') return saved;
    const browserLang = navigator.language || '';
    return browserLang.toLowerCase().startsWith('th') ? 'th' : 'en';
  }
  return 'th';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimations(),
    provideAngularQuery(new QueryClient()),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authTokenInterceptor, errorInterceptor])),
    provideEnvironmentNgxMask(),
    provideSicNumberConfig({ decimal: 2 }),
    provideOAuthClient(),
    provideMarkdown(),
    provideAteEditor(),
    provideAppInitializer(() => inject(AuthService).initializeAuth()),
    provideAppInitializer(() => inject(LanguageService).initLanguage()),
    provideAppInitializer(() => inject(AiModelsService).refresh()),
    { provide: APP_TRANSLATE_MODULE_CODE, useValue: 'COMMON' },
    { provide: APP_TRANSLATE_PROGRAM_CODE, useValue: 'ALL' },
    AppTranslateLoader,
    provideTranslateService({
      fallbackLang: 'en',
      extend: true,
      loader: {
        provide: TranslateLoader,
        useExisting: AppTranslateLoader
      }
    }),
    provideSicTheme({ mode: 'system', theme: 'forest' }),
    provideSicConfig({
      decimals: 2,
      dateFormat: 'dd/MM/yyyy',
      get era() {
        return getActiveAppLanguage() === 'th' ? 'BE' : 'CE';
      },
      get locale() {
        return getActiveAppLanguage() === 'th' ? 'th' : 'en';
      },
      loadingImage: '/assets/brand-loader.gif',
      maxUploadSizeMb: 20,
      pageSize: 25,
      messages: {
        // sic-combobox
        get noOptions() {
          return getActiveAppLanguage() === 'th' ? 'ไม่มีตัวเลือก' : 'No options';
        },
        // sic-input-comment @mention
        get noMatches() {
          return getActiveAppLanguage() === 'th' ? 'ไม่พบรายการที่ตรงกัน' : 'No matches';
        },
        get loading() {
          return getActiveAppLanguage() === 'th' ? 'กำลังโหลด…' : 'Loading…';
        },
        get attachFile() {
          return getActiveAppLanguage() === 'th' ? 'แนบไฟล์' : 'Attach file';
        },
        get removeFile() {
          return getActiveAppLanguage() === 'th' ? 'ลบไฟล์แนบ' : 'Remove file';
        },
        // sic-upload
        get dragDropHint() {
          return getActiveAppLanguage() === 'th' ? 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์' : 'Drag & drop files here, or click to browse';
        },
        // sic-navbar
        get noNotifications() {
          return getActiveAppLanguage() === 'th' ? 'ไม่มีการแจ้งเตือน' : 'No notifications';
        },
        get viewAllNotifications() {
          return getActiveAppLanguage() === 'th' ? 'ดูการแจ้งเตือนทั้งหมด' : 'View All Notifications';
        },
        // sic-calendar
        get noEvents() {
          return getActiveAppLanguage() === 'th' ? 'ไม่มีกิจกรรม' : 'No events';
        },
        // sic-dialog common dialog
        get cancel() {
          return getActiveAppLanguage() === 'th' ? 'ยกเลิก' : 'Cancel';
        },
        get confirm() {
          return getActiveAppLanguage() === 'th' ? 'ยืนยัน' : 'Confirm';
        },
        get close() {
          return getActiveAppLanguage() === 'th' ? 'ปิด' : 'Close';
        },
        // sic-gridpanel
        get gridLoading() {
          return getActiveAppLanguage() === 'th' ? 'กำลังโหลด...' : 'Loading...';
        },
        get gridSaving() {
          return getActiveAppLanguage() === 'th' ? 'กำลังบันทึกข้อมูล...' : 'Saving data...';
        },
        get gridLoadingOverlay() {
          return getActiveAppLanguage() === 'th' ? 'กำลังโหลดข้อมูล...' : 'Loading data...';
        },
        get gridNoData() {
          return getActiveAppLanguage() === 'th' ? 'ไม่พบข้อมูล' : 'No data found';
        },
        get gridNoChangedData() {
          return getActiveAppLanguage() === 'th' ? 'ไม่มีข้อมูลที่เปลี่ยนแปลง' : 'No changed data';
        },
        get gridNoDataHint() {
          return getActiveAppLanguage() === 'th' ? 'ลองปรับคำค้นหา หรือเพิ่มแถวใหม่' : 'Try adjusting your search or add a new row.';
        },
        get gridNoChangedDataHint() {
          return getActiveAppLanguage() === 'th' ? 'ลองปิดโหมด review เพื่อดูทุกแถว' : 'Try turning off review mode to see all rows.';
        },
        get gridPageSizeSuffix() {
          return getActiveAppLanguage() === 'th' ? ' รายการ' : ' items';
        },
        // sic-search
        get noResults() {
          return getActiveAppLanguage() === 'th' ? 'ไม่พบผลลัพธ์' : 'No results';
        },
        // sic-masonry / sic-calendar-timeline / sic-card-stack
        get noItems() {
          return getActiveAppLanguage() === 'th' ? 'ไม่มีรายการ' : 'No items';
        },
        get masonryLoading() {
          return getActiveAppLanguage() === 'th' ? 'กำลังโหลดเพิ่มเติม...' : 'Loading more...';
        },
        // sic-drag-drop
        get dragDropEmptyList() {
          return getActiveAppLanguage() === 'th' ? 'วางรายการที่นี่' : 'Drop items here';
        },
        // sic-stepper
        get stepperPrevious() {
          return getActiveAppLanguage() === 'th' ? 'ย้อนกลับ' : 'Previous';
        },
        get stepperNext() {
          return getActiveAppLanguage() === 'th' ? 'ถัดไป' : 'Next';
        },
        get stepperSkip() {
          return getActiveAppLanguage() === 'th' ? 'ข้าม' : 'Skip';
        },
        get stepperFinish() {
          return getActiveAppLanguage() === 'th' ? 'เสร็จสิ้น' : 'Finish';
        },
        // sic-code
        get codeCopy() {
          return getActiveAppLanguage() === 'th' ? 'คัดลอก' : 'Copy';
        },
        get codeCopied() {
          return getActiveAppLanguage() === 'th' ? 'คัดลอกแล้ว' : 'Copied';
        },
        // sic-calendar-timeline view switcher
        get calendarTimelineViewLabel() {
          return getActiveAppLanguage() === 'th' ? 'มุมมอง' : 'View';
        },
        get calendarTimelineDay() {
          return getActiveAppLanguage() === 'th' ? 'วัน' : 'Day';
        },
        get calendarTimelineWeek() {
          return getActiveAppLanguage() === 'th' ? 'สัปดาห์' : 'Week';
        },
        get calendarTimelineMonth() {
          return getActiveAppLanguage() === 'th' ? 'เดือน' : 'Month';
        },
        // sic-video-player
        get playVideo() {
          return getActiveAppLanguage() === 'th' ? 'เล่นวิดีโอ' : 'Play video';
        },
        // sicCanDeactivateGuard
        get unsavedChangesTitle() {
          return getActiveAppLanguage() === 'th' ? 'มีการเปลี่ยนแปลงที่ยังไม่บันทึก' : 'Unsaved changes';
        },
        get unsavedChangesMessage() {
          return getActiveAppLanguage() === 'th' ? 'คุณมีการเปลี่ยนแปลงที่ยังไม่บันทึก ต้องการออกจากหน้านี้หรือไม่?' : 'You have unsaved changes. Leave this page anyway?';
        },
      },
    }),
  ]
};