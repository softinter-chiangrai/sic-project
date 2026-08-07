componentGroups = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            description: 'ติดตั้งและตั้งค่าเริ่มต้นก่อนเริ่มใช้ component อื่นๆ',
            components: [
                {
                    id: 'install',
                    selector: 'npm install sic-ng',
                    title: 'การติดตั้ง',
                    category: 'Setup',
                    description: 'ติดตั้ง sic-ng และ peer dependencies (Angular 22 + CDK) แล้ว import theme CSS หนึ่งครั้งใน styles.css — dayjs มาพร้อมกับ sic-ng อยู่แล้ว ไม่ต้องติดตั้งเอง',
                    code: `npm install sic-ng
npm install @angular/cdk@^22`,
                    codeLabel: 'CLI',
                    codeLang: 'bash',
                    hasDemo: false,
                    codeBlocks: [
                        {
                            id: 'cli',
                            label: 'CLI',
                            lang: 'bash',
                            code: `npm install sic-ng
npm install @angular/cdk@^22`,
                        },
                        {
                            id: 'styles',
                            label: 'styles.css',
                            lang: 'css',
                            code: `@import 'sic-ng/theme/all-themes.css'; /* รองรับสลับ theme ทั้ง 6 แบบตอน runtime */
/* หรือถ้าใช้ default theme อย่างเดียว: @import 'sic-ng/theme/default-theme.css'; */`,
                        },
                        {
                            id: 'app-config',
                            label: 'app.config.ts',
                            lang: 'typescript',
                            code: `import { bootstrapApplication } from '@angular/platform-browser';
import { provideSicTheme, provideSicConfig } from 'sic-ng';

bootstrapApplication(AppComponent, {
  providers: [provideSicTheme(), provideSicConfig({})],
});`,
                        },
                    ],
                    attributes: [
                        { name: '@angular/core, @angular/common, @angular/forms, @angular/cdk', type: 'peerDependency', default: '^22.0.0', description: 'ต้องติดตั้งเองในโปรเจกต์ (ปกติมีอยู่แล้วถ้าเป็น Angular app)' },
                        { name: 'dayjs', type: 'dependency', default: '^1.11', description: 'ติดมาพร้อม sic-ng อยู่แล้ว — ใช้ภายใน sic-calendar, sic-datepicker, sic-calendar-timeline ฯลฯ ต้อง import locale เองถ้าใช้ locale อื่นนอกจาก en เช่น import \'dayjs/locale/th\'' },
                        { name: `'sic-ng/theme/all-themes.css'`, type: 'CSS import', description: 'รวมทุก theme (default/sunset/forest/violet/slate/glass) — ใช้เมื่อจะสลับ theme ตอน runtime ผ่าน SicThemeService.setThemeName()' },
                        { name: `'sic-ng/theme/default-theme.css'`, type: 'CSS import', description: 'เฉพาะ default theme (ไฟล์เล็กกว่า) — ใช้เมื่อไม่ต้องการสลับ theme หลายแบบ' },
                    ],
                    events: [],
                },
                {
                    id: 'theme-config',
                    selector: 'provideSicTheme(config)',
                    title: 'ตั้งค่า Theme',
                    category: 'Setup',
                    description: 'ตั้งค่า mode (light/dark/system) และเลือกพาเลตสีสำเร็จรูป (theme) ครั้งเดียวตอน bootstrap ผ่าน provideSicTheme() — mode จะจำค่าล่าสุดใน localStorage และตาม prefers-color-scheme ให้อัตโนมัติเมื่อเป็น system เปลี่ยนระหว่างรันได้ผ่าน SicThemeService (inject ได้ทุกที่ เช่น component นี้เองก็ใช้ toggleTheme() ที่ปุ่มมุมขวาบน)',
                    code: `import { bootstrapApplication } from '@angular/platform-browser';
import { provideSicTheme } from 'sic-ng';

bootstrapApplication(AppComponent, {
  providers: [
    provideSicTheme({ mode: 'system', theme: 'violet' }),
  ],
});`,
                    codeLabel: 'app.config.ts',
                    codeLang: 'typescript',
                    tsCode: `import { Component, inject } from '@angular/core';
import { SicThemeService } from 'sic-ng';

export class MyComponent {
  private readonly themeService = inject(SicThemeService);

  // signals อ่านสถานะปัจจุบันได้ตลอด
  isDark = this.themeService.isDark;
  themeName = this.themeService.themeName;

  toggleDark(): void {
    this.themeService.toggleDark();
  }

  useSunsetTheme(): void {
    this.themeService.setThemeName('sunset');
  }
}`,
                    attributes: [
                        { name: 'mode', type: `'light' | 'dark' | 'system'`, default: `'system'`, description: 'provideSicTheme() config — โหมดเริ่มต้น, จำค่าล่าสุดใน localStorage อัตโนมัติหลังจากนั้น' },
                        { name: 'theme', type: `'default' | 'sunset' | 'forest' | 'violet' | 'slate' | 'glass'`, default: `'default'`, description: 'provideSicTheme() config — พาเลตสีสำเร็จรูปเริ่มต้น (ต้อง import sic-ng/theme/all-themes.css ถ้าจะสลับได้มากกว่า 1 แบบ)' },
                        { name: 'SicThemeService.mode / isDark / themeName', type: 'Signal', description: 'อ่านสถานะปัจจุบัน — isDark ใช้คำนวณจาก mode และ prefers-color-scheme (ถ้าเป็น system) ให้อัตโนมัติ' },
                        { name: 'SicThemeService.setTheme(mode)', type: 'method', description: `เปลี่ยน mode และบันทึกลง localStorage` },
                        { name: 'SicThemeService.toggleDark()', type: 'method', description: `สลับระหว่าง 'light' กับ 'dark' (ปุ่มมุมขวาบนของหน้านี้ใช้ตัวนี้)` },
                        { name: 'SicThemeService.setThemeName(name)', type: 'method', description: 'เปลี่ยนพาเลตสีสำเร็จรูประหว่างรัน และบันทึกลง localStorage' },
                    ],
                    events: [],
                },
                {
                    id: 'custom-color',
                    selector: 'applySicThemeConfig(config, element)',
                    title: 'ปรับสีเอง (Custom Color)',
                    category: 'Setup',
                    description: 'ทุก component อ่านสีจาก CSS custom property (--sic-color-primary ฯลฯ) เท่านั้น ปรับเองได้ 2 ทาง: (1) ตอน bootstrap ผ่าน provideSicTheme({ colorPrimary, ... }) หรือ (2) รันไทม์เรียก applySicThemeConfig() ตรงๆ กับ element ใดก็ได้ (เช่น document.documentElement เพื่อเปลี่ยนทั้งแอปทันที ไม่ต้อง reload) — ลองเปลี่ยนสีด้านล่างดูได้เลย',
                    code: `import { bootstrapApplication } from '@angular/platform-browser';
import { provideSicTheme } from 'sic-ng';

bootstrapApplication(AppComponent, {
  providers: [
    provideSicTheme({
      colorPrimary: '#7c3aed',
      colorSuccess: '#16a34a',
      colorDanger: '#dc2626',
      colorWarning: '#d97706',
      radiusSm: '0.375rem',
      radiusMd: '0.625rem',
      radiusLg: '1rem',
      fontSans: "'Sarabun', system-ui, sans-serif",
    }),
  ],
});`,
                    codeLabel: 'app.config.ts',
                    codeLang: 'typescript',
                    tsCode: `import { applySicThemeConfig } from 'sic-ng';

// เปลี่ยนสีทั้งแอประหว่างรัน (เช่น จาก settings page ของผู้ใช้เอง)
applySicThemeConfig({ colorPrimary: '#7c3aed' }, document.documentElement);`,
                    tsCodeLabel: 'settings.component.ts',
                    attributes: [
                        { name: 'colorPrimary / colorSuccess / colorDanger / colorWarning', type: 'string (CSS color)', description: 'แมปไปที่ --sic-color-primary/success/danger/warning — ทุก component ใช้ token เดียวกันนี้เสมอ ไม่มีสี hardcode' },
                        { name: 'radiusSm / radiusMd / radiusLg', type: 'string (CSS length)', description: 'แมปไปที่ --sic-radius-sm/md/lg' },
                        { name: 'fontSans', type: 'string (CSS font-family)', description: 'แมปไปที่ --sic-font-sans' },
                        { name: 'applySicThemeConfig(config, element)', type: 'function', description: 'ใช้ config เดียวกับ provideSicTheme() แต่เรียกตรงกับ element ไหนก็ได้ ตอนไหนก็ได้ (ไม่ใช่แค่ตอน bootstrap) — ปกติเรียกกับ document.documentElement เพื่อให้มีผลทั้งแอป' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-config',
                    selector: 'provideSicConfig(config)',
                    title: 'Global Config (SicConfig)',
                    category: 'Setup',
                    description: 'ตั้งค่า default กลางของทั้งไลบรารีครั้งเดียวตอน bootstrap แทนที่จะใส่ @Input ซ้ำๆ ทุก instance เช่น จำนวนทศนิยม, format ปฏิทิน, พ.ศ./ค.ศ., รูป loading เริ่มต้น และข้อความ static ต่างๆ เพื่อรองรับ bilingual — @Input ของแต่ละ component ยังชนะค่าจาก config นี้เสมอถ้าใส่ไว้',
                    code: `import { bootstrapApplication } from '@angular/platform-browser';
import { provideSicTheme, provideSicConfig } from 'sic-ng';

bootstrapApplication(AppComponent, {
  providers: [
    provideSicTheme({ mode: 'system' }),
    provideSicConfig({
      decimals: 2,
      dateFormat: 'dd/MM/yyyy',
      era: 'BE', // ผู้ใช้ไทยเห็น พ.ศ. ทุก sic-datepicker/sic-calendar โดยไม่ต้องใส่ era ทีละตัว
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
  ],
});`,
                    hasDemo: false,
                    codeLabel: 'app.config.ts',
                    codeLang: 'typescript',
                    attributes: [
                        { name: 'decimals', type: 'number', default: '2', description: 'จำนวนทศนิยมเริ่มต้นของ sic-input-number และคอลัมน์/summary ชนิด number ใน sic-gridpanel' },
                        { name: 'dateFormat', type: 'string', default: `'dd/MM/yyyy'`, description: 'format วันที่เริ่มต้นของ sic-datepicker และคอลัมน์ date ใน sic-gridpanel' },
                        { name: 'era', type: `'BE' | 'CE'`, default: `'CE'`, description: 'ระบบปีเริ่มต้น (พ.ศ./ค.ศ.) ของ sic-datepicker และ sic-calendar — เก็บ/ส่งค่าเป็น ค.ศ. จริงเสมอ เปลี่ยนแค่ปีที่โชว์ผู้ใช้' },
                        { name: 'locale', type: 'string', default: `'en'`, description: 'dayjs locale code เริ่มต้นของ sic-datepicker/sic-calendar (ต้อง import dayjs/locale/xx เองก่อนใช้)' },
                        { name: 'loadingImage', type: 'string', description: 'URL รูป .png/.gif เริ่มต้นของ SicLoadingService.show() เมื่อไม่ได้ระบุ image ต่อครั้ง — ไม่ใส่จะแสดง sic-spinner' },
                        { name: 'loadingSpinnerSize', type: `'sm' | 'md' | 'lg'`, default: `'lg'`, description: 'ขนาด sic-spinner เริ่มต้นของ SicLoadingService.show() เมื่อไม่มี image และไม่ระบุ spinnerSize' },
                        { name: 'maxUploadSizeMb', type: 'number', default: '10', description: 'ขนาดไฟล์สูงสุด (MB) เริ่มต้นของ sic-upload และ sic-input-comment' },
                        { name: 'pageSize', type: 'number', default: '10', description: 'จำนวนแถว/รายการต่อหน้าเริ่มต้นของ sic-gridpanel และ sic-combobox' },
                        { name: 'pageSizeOptions', type: 'number[]', default: '[10, 30, 50]', description: 'ตัวเลือกจำนวนต่อหน้าเริ่มต้นใน dropdown ของ sic-gridpanel' },
                        { name: 'messages.noOptions', type: 'string', default: `'No options'`, description: 'sic-combobox เมื่อไม่มีตัวเลือก' },
                        { name: 'messages.noMatches', type: 'string', default: `'No matches'`, description: 'sic-input-comment เมื่อค้นหา @mention ไม่เจอ' },
                        { name: 'messages.loading', type: 'string', default: `'Loading…'`, description: 'sic-input-comment ระหว่าง mentionSearch กำลังทำงาน' },
                        { name: 'messages.attachFile', type: 'string', default: `'Attach file'`, description: 'sic-input-comment aria-label ปุ่มแนบไฟล์' },
                        { name: 'messages.removeFile', type: 'string', default: `'Remove file'`, description: 'sic-input-comment aria-label ปุ่มลบไฟล์แนบ' },
                        { name: 'messages.dragDropHint', type: 'string', default: `'Drag & drop files here, or click to browse'`, description: 'sic-upload ข้อความในกล่องลากไฟล์' },
                        { name: 'messages.noNotifications', type: 'string', default: `'No notifications'`, description: 'sic-navbar เมื่อไม่มีการแจ้งเตือน' },
                        { name: 'messages.viewAllNotifications', type: 'string', default: `'View All Notifications'`, description: 'sic-navbar ปุ่มท้าย dropdown แจ้งเตือน' },
                        { name: 'messages.noEvents', type: 'string', default: `'No events'`, description: 'sic-calendar มุมมอง list เมื่อวันนั้นไม่มีกิจกรรม' },
                        { name: 'messages.cancel / confirm / close', type: 'string', default: `'Cancel' / 'Confirm' / 'Close'`, description: 'sic-dialog common dialog — ใช้เมื่อไม่ได้ส่ง cancelText/confirmText/closeText ต่อครั้ง' },
                        { name: 'messages.gridLoading / gridSaving / gridLoadingOverlay', type: 'string', description: 'sic-gridpanel ข้อความระหว่างโหลด/บันทึกข้อมูล' },
                        { name: 'messages.gridNoData / gridNoChangedData', type: 'string', description: 'sic-gridpanel หัวข้อ empty state (โหมดปกติ / โหมด review changes)' },
                        { name: 'messages.gridNoDataHint / gridNoChangedDataHint', type: 'string', description: 'sic-gridpanel คำอธิบายใต้หัวข้อ empty state' },
                        { name: 'messages.gridPageSizeSuffix', type: 'string', default: `''`, description: 'ข้อความต่อท้ายตัวเลขใน dropdown เลือกจำนวนต่อหน้าของ sic-gridpanel เช่น ตั้งเป็น " รายการ" จะได้ "10 รายการ"' },
                        { name: 'messages.noResults', type: 'string', default: `'No results'`, description: 'sic-search เมื่อค้นหาแล้วไม่พบผลลัพธ์' },
                        { name: 'messages.noItems', type: 'string', default: `'No items'`, description: 'empty state ของ sic-masonry, sic-calendar-timeline และ sic-card-stack เมื่อ items ว่าง' },
                        { name: 'messages.masonryLoading', type: 'string', default: `'Loading more...'`, description: 'sic-masonry ข้อความระหว่างโหลดหน้าถัดไปในโหมด isLazy' },
                        { name: 'messages.dragDropEmptyList', type: 'string', default: `'Drop items here'`, description: 'sic-drag-drop ข้อความ placeholder เมื่อ list/column ว่าง' },
                        { name: 'messages.stepperPrevious / stepperNext / stepperSkip / stepperFinish', type: 'string', default: `'Previous' / 'Next' / 'Skip' / 'Finish'`, description: 'sic-stepper ปุ่ม nav ในตัว (Skip แสดงเฉพาะ step ที่เป็น optional)' },
                        { name: 'messages.codeCopy / codeCopied', type: 'string', default: `'Copy' / 'Copied'`, description: 'sic-code ปุ่ม copy — สถานะปกติ และสถานะที่แสดงชั่วครู่หลังคัดลอกสำเร็จ' },
                        { name: 'messages.calendarTimelineViewLabel', type: 'string', default: `'View'`, description: 'sic-calendar-timeline ป้ายกำกับหน้าตัวสลับมุมมอง day/week/month' },
                        { name: 'messages.calendarTimelineDay / calendarTimelineWeek / calendarTimelineMonth', type: 'string', default: `'Day' / 'Week' / 'Month'`, description: 'sic-calendar-timeline ตัวเลือกในตัวสลับมุมมอง day/week/month' },
                        { name: 'messages.playVideo', type: 'string', default: `'Play video'`, description: 'sic-video-player aria-label ปุ่ม play ที่ทับอยู่บน poster ก่อนเริ่มเล่น' },
                        { name: 'messages.unsavedChangesTitle', type: 'string', default: `'Unsaved changes'`, description: 'sicCanDeactivateGuard หัวข้อ dialog ยืนยันเมื่อออกจากหน้าที่มีการเปลี่ยนแปลงยังไม่บันทึก' },
                        { name: 'messages.unsavedChangesMessage', type: 'string', default: `'You have unsaved changes. Leave this page anyway?'`, description: 'sicCanDeactivateGuard ข้อความอธิบายใน dialog เดียวกัน' },
                    ],
                    events: [],
                },
            ],
        },
        {
            id: 'project-structure',
            title: 'Project Structure',
            description: 'มาตรฐานการตั้งชื่อไฟล์ต่อ 1 หน้า (page/feature) ในโปรเจกต์ที่ใช้ sic-ng',
            components: [
                {
                    id: 'standard-search',
                    selector: 'standard search',
                    title: 'Search + Grid Pattern',
                    category: 'Setup',
                    description: 'รูปแบบมาตรฐานของหน้าค้นหา ตั้งชื่อไฟล์แบบเดียวกับ "standard form" ทุกประการ (pageName.model.ts/.form.ts/.service.ts/.resolver.ts/.routes.ts/.component.ts/.html/.css) แค่ pageName เป็น "employee-search" — แบ่งเป็น 2 ส่วนเสมอ: (1) Criteria — card หัวข้อ "เงื่อนไข" มีฟอร์มตัวกรอง (ฟิลด์แบบเลือกจากรายการ เช่น แผนก/ตำแหน่ง ใช้ sic-combobox ไม่ใช้ sic-input) footer เป็นปุ่มค้นหา/ล้างข้อมูล ชิดขวา, (2) Detail — card หัวข้อ "รายละเอียด" เนื้อหาเป็น sic-gridpanel แสดงผลลัพธ์แบบแบ่งหน้า คอลัมน์สุดท้ายเป็นปุ่มแก้ไข (ไอคอนปากกา) ปิด sort ไว้ — resolver โหลด options ของ dropdown (แผนก/ตำแหน่ง) ก่อนเข้าหน้า ไม่ต้องรอผู้ใช้เปิด combobox แล้วค่อยยิง API — กดปุ่มแก้ไขที่แถวในตารางแล้วพาไปหน้า "standard form" เพื่อแก้ไขข้อมูลของแถวนั้น',
                    code: '',
                    codeBlocks: [
                        {
                            id: 'model',
                            label: 'employee-search.model.ts',
                            lang: 'typescript',
                            code: `export interface EmployeeSearchCriteria {
  employeeCodeFrom: string;
  employeeCodeTo: string;
  department: string;
  position: string;
}

export interface EmployeeListItem {
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
}

export interface EmployeeSearchOption {
  label: string;
  value: string;
}

// รูปร่างของ route.snapshot.data ทั้งก้อน — ตัวเลือก dropdown (แผนก/ตำแหน่ง) โหลดจาก resolver
// ก่อนเข้าหน้าเสมอ ไม่ต้องรอผู้ใช้เปิด combobox แล้วค่อยยิง API เอง
export interface EmployeeSearchPageData {
  departmentOptions: EmployeeSearchOption[];
  positionOptions: EmployeeSearchOption[];
}`,
                        },
                        {
                            id: 'form',
                            label: 'employee-search.form.ts',
                            lang: 'typescript',
                            code: `import { FormBuilder, FormGroup } from '@angular/forms';
import { ToForm } from 'sic-ng';
import { EmployeeSearchCriteria } from './employee-search.model';

export class EmployeeSearchForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<EmployeeSearchCriteria>> {
    return fb.group<ToForm<EmployeeSearchCriteria>>({
      employeeCodeFrom: fb.control(''),
      employeeCodeTo: fb.control(''),
      department: fb.control(''),
      position: fb.control(''),
    });
  }
}`,
                        },
                        {
                            id: 'service',
                            label: 'employee-search.service.ts',
                            lang: 'typescript',
                            code: `import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeListItem, EmployeeSearchCriteria, EmployeeSearchOption } from './employee-search.model';

@Injectable({ providedIn: 'root' })
export class EmployeeSearchService {
  private readonly http = inject(HttpClient);

  search(criteria: EmployeeSearchCriteria): Observable<EmployeeListItem[]> {
    return this.http.get<EmployeeListItem[]>('/api/employees/search', { params: { ...criteria } });
  }

  getDepartmentOptions(): Observable<EmployeeSearchOption[]> {
    return this.http.get<EmployeeSearchOption[]>('/api/employees/departments');
  }

  getPositionOptions(): Observable<EmployeeSearchOption[]> {
    return this.http.get<EmployeeSearchOption[]>('/api/employees/positions');
  }
}`,
                        },
                        {
                            id: 'resolver',
                            label: 'employee-search.resolver.ts',
                            lang: 'typescript',
                            code: `import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EmployeeSearchPageData } from './employee-search.model';
import { EmployeeSearchService } from './employee-search.service';

export const employeeSearchResolver: ResolveFn<EmployeeSearchPageData> = () => {
  const service = inject(EmployeeSearchService);

  // โหลด options ของทุก combobox พร้อมกันก่อนเข้าหน้า (forkJoin รอทุกตัวเสร็จ)
  return forkJoin({
    departmentOptions: service.getDepartmentOptions(),
    positionOptions: service.getPositionOptions(),
  });
};`,
                        },
                        {
                            id: 'routes',
                            label: 'employee-search.routes.ts',
                            lang: 'typescript',
                            code: `import { Routes } from '@angular/router';
import { employeeSearchResolver } from './employee-search.resolver';

export const employeeSearchRoutes: Routes = [
  {
    path: '',
    // loadComponent แทน component ตรงๆ — โหลด employee-search.component.ts เป็น lazy chunk แยกจากส่วนอื่นของแอป
    loadComponent: () => import('./employee-search.component').then((m) => m.EmployeeSearchComponent),
    // key 'form' คงที่เหมือน standard form — employee-search.component.ts อ่านผ่าน route.snapshot.data['form']
    resolve: { form: employeeSearchResolver },
  },
];

// app.routes.ts (route ระดับบนสุดของแอป) — โหลด employeeSearchRoutes แบบ lazy ทั้งกลุ่มผ่าน loadChildren
// export const routes: Routes = [
//   { path: 'employees', loadChildren: () => import('./employee-search/employee-search.routes').then((m) => m.employeeSearchRoutes) },
// ];`,
                        },
                        {
                            id: 'component-ts',
                            label: 'employee-search.component.ts',
                            lang: 'typescript',
                            code: `import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SicButtonComponent, SicCardComponent, SicComboboxComponent, SicFlexComponent, SicGridComponent, SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridRowData, SicInputComponent } from 'sic-ng';
import { EmployeeSearchForm } from './employee-search.form';
import { EmployeeSearchPageData } from './employee-search.model';
import { EmployeeSearchService } from './employee-search.service';

@Component({
  selector: 'app-employee-search',
  standalone: true,
  imports: [ReactiveFormsModule, SicCardComponent, SicGridComponent, SicFlexComponent, SicInputComponent, SicComboboxComponent, SicButtonComponent],
  templateUrl: './employee-search.component.html',
  styleUrl: './employee-search.component.css',
})
export class EmployeeSearchComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(EmployeeSearchService);

  readonly searchForm = EmployeeSearchForm.createForm(this.fb);

  // route.snapshot.data เป็น { [key: string]: any } — key 'form' มาจาก resolve: { form: employeeSearchResolver }
  // ใน employee-search.routes.ts ต้องอ่านผ่าน key นั้นก่อนเสมอ อ่าน .data ตรงๆ เฉยๆ จะได้ undefined
  private readonly pageData = this.route.snapshot.data['form'] as EmployeeSearchPageData;
  readonly departmentOptions = this.pageData.departmentOptions;
  readonly positionOptions = this.pageData.positionOptions;

  gridConfig: SicGridPanelConfig = {
    id: 'employeeCode',
    lazy: false,
    selectable: false,
    toolbar: { save: false, add: false, delete: false, review: false },
    column: [
      { label: 'รหัสพนักงาน', name: 'employeeCode', type: 'text' },
      { label: 'ชื่อ', name: 'employeeName', type: 'text' },
      { label: 'แผนก', name: 'department', type: 'text' },
      { label: 'ตำแหน่ง', name: 'position', type: 'text' },
      // คอลัมน์สุดท้าย — ปุ่มแก้ไขต่อแถว แทนด้วยไอคอนปากกา (ไม่ใช้ column.label เพื่อไม่ให้มีหัวคอลัมน์) ปิด sort ไว้
      { label: '', name: 'edit', type: 'button', buttonText: '✏️', align: 'center', width: 60, sortable: false },
    ],
  };

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    this.service.search(this.searchForm.getRawValue() as any).subscribe((rows) => {
      grid.setRows(rows, { totalElements: rows.length }, request.requestId);
    });
  }

  handleGridRowAction(event: { action: string; row?: SicGridRowData | null }): void {
    if (event.action === 'edit' && event.row) {
      // นำทางไปหน้า standard form (pageName.component.ts) พร้อม employeeCode ของแถวนั้น
      // this.router.navigate(['/employees', event.row['employeeCode']]);
    }
  }

  submitSearch(grid: SicGridPanelComponent): void {
    grid.reload(); // (loadData) ยิงใหม่ พร้อมค่าล่าสุดใน searchForm
  }

  clearSearch(): void {
    this.searchForm.reset();
  }
}`,
                        },
                        {
                            id: 'component-html',
                            label: 'employee-search.component.html',
                            lang: 'html',
                            code: `<sic-flex direction="column" gap="1rem">
  <sic-card [bordered]="true" title="เงื่อนไข">
    <form [formGroup]="searchForm">
      <sic-grid [cols]="2" gap="1rem" [colsBreakpoints]="{ sm: 1, md: 2, lg: 2 }">
        <sic-input label="รหัสพนักงาน ตั้งแต่" formControlName="employeeCodeFrom" />
        <sic-input label="ถึง" formControlName="employeeCodeTo" />
        <sic-combobox label="แผนก" [options]="departmentOptions" optionLabel="label" optionValue="value" formControlName="department" />
        <sic-combobox label="ตำแหน่ง" [options]="positionOptions" optionLabel="label" optionValue="value" formControlName="position" />
      </sic-grid>
    </form>

    <sic-flex sicCardFooter direction="row" justify="end" gap="0.5rem">
      <sic-button variant="outline" (click)="clearSearch()">ล้างข้อมูล</sic-button>
      <sic-button (click)="submitSearch(grid)">ค้นหา</sic-button>
    </sic-flex>
  </sic-card>

  <sic-card [bordered]="true" title="รายละเอียด">
    <sic-gridpanel
      #grid
      [config]="gridConfig"
      (loadData)="handleGridLoad($event, grid)"
      (rowAction)="handleGridRowAction($event)"
    />
  </sic-card>
</sic-flex>`,
                        },
                        {
                            id: 'component-css',
                            label: 'employee-search.component.css',
                            lang: 'css',
                            code: `/* ปกติไม่ต้องมี custom CSS เลย — ใช้ sic-card/sic-flex/sic-grid จัด layout
   และ token กลาง (--sic-space-*, --sic-color-*) แทน ใส่เฉพาะกรณีจำเป็นจริงๆ เท่านั้น */`,
                        },
                    ],
                    attributes: [
                        { name: 'pageName.model.ts', type: 'interface', description: 'criteria/list-item/option interface ของหน้านี้ รวมถึง pageNamePageData (รูปร่างของ route.snapshot.data ทั้งก้อน) ก็ประกาศไว้ในไฟล์นี้เหมือน standard form' },
                        { name: 'pageName.form.ts', type: 'class (static factory)', description: 'สร้าง FormGroup ของฟอร์มเงื่อนไข — ไม่มี validator เพราะทุกฟิลด์เป็น optional filter' },
                        { name: 'pageName.service.ts', type: '@Injectable', description: 'เรียก API เท่านั้น — search() สำหรับตาราง, getXxxOptions() สำหรับ options ของแต่ละ sic-combobox' },
                        { name: 'pageName.resolver.ts', type: 'ResolveFn', description: 'โหลด options ของทุก dropdown พร้อมกันด้วย forkJoin ก่อนเข้าหน้า คืนเป็น pageNamePageData' },
                        { name: 'pageName.routes.ts', type: 'Routes', description: 'ผูก resolver เข้ากับ route ผ่าน resolve: { form: pageNameResolver } (key เดียวกับ standard form) และโหลด component แบบ lazy ผ่าน loadComponent' },
                        { name: 'pageName.component.ts/.html/.css', type: 'Component', description: 'Criteria (sic-card title="เงื่อนไข" + sic-combobox ผูกกับ options จาก resolver + footer ปุ่มค้นหา/ล้างข้อมูลชิดขวา) และ Detail (sic-card title="รายละเอียด" + sic-gridpanel คอลัมน์สุดท้ายเป็นปุ่มแก้ไข ปิด sortable)' },
                    ],
                    events: [],
                },
                {
                    id: 'file-naming-convention',
                    selector: 'standard form',
                    title: 'File Naming Convention',
                    category: 'Setup',
                    description: 'ตั้งชื่อไฟล์ต่อ 1 หน้า (แทน pageName ด้วยชื่อหน้าจริง เช่น employee) ให้เดาได้ทันทีว่าแต่ละไฟล์ทำหน้าที่อะไร และเปิดหาไฟล์ที่เกี่ยวข้องกันได้ง่ายเพราะชื่อขึ้นต้นเหมือนกัน: (1) component — pageName.component.ts/.html/.css (+ .spec.ts ถ้ามีเทส), (2) formGroup — pageName.form.ts (static factory สร้าง FormGroup), (3) model — pageName.model.ts (interface ของข้อมูล), (4) resolver — pageName.resolver.ts (โหลดข้อมูลก่อนเข้าหน้า), (5) service — pageName.service.ts (เรียก API), (6) routes — pageName.routes.ts (ผูก resolver/guard เข้ากับ route, lazy-load ด้วย loadComponent) ตัวอย่างด้านล่างใช้หน้า "employee" ประกอบร่างกันครบทั้ง 6 ไฟล์ ตั้งแต่ model → form → service → resolver → routes → component — ด้านบนเป็น demo หน้าตาจริงที่ได้จากโครงสร้างนี้ (ผูกกับ SicFormData เหมือนใน employee.component.ts)',
                    code: '',
                    codeBlocks: [
                        {
                            id: 'model',
                            label: 'employee.model.ts',
                            lang: 'typescript',
                            code: `import { SicFormData } from 'sic-ng';

export interface EmployeeModel {
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  salary: number;
}

// ห่อด้วย EmployeePageData (ไม่คืน SicFormData ตรงๆ) เผื่อหน้านี้ต้องใช้มากกว่า 1 form/grid ในอนาคต —
// เพิ่ม field ใหม่ใน interface นี้ แล้วสร้างเพิ่มในตัว resolver เดียวกันได้เลย โดยไม่ต้องเพิ่ม
// resolve key ใหม่ทุกครั้งที่เพิ่ม form (route ผูกกับ resolver แค่ key เดียวคือ 'form' เสมอ)
export interface EmployeePageData {
  employeeData: SicFormData<EmployeeModel>;
}`,
                        },
                        {
                            id: 'form',
                            label: 'employee.form.ts',
                            lang: 'typescript',
                            code: `import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from 'sic-ng';
import { EmployeeModel } from './employee.model';

export class EmployeeForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<EmployeeModel>> {
    return fb.group<ToForm<EmployeeModel>>({
      employeeCode: fb.control(null, [Validators.required, Validators.maxLength(20)]),
      employeeName: fb.control(null, [Validators.required, Validators.maxLength(100)]),
      department: fb.control(null, [Validators.required]),
      position: fb.control(null, [Validators.required]),
      salary: fb.control(null, [Validators.required, Validators.min(0)]),
    });
  }
}`,
                        },
                        {
                            id: 'service',
                            label: 'employee.service.ts',
                            lang: 'typescript',
                            code: `import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeModel } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);

  getEmployee(employeeCode: string): Observable<EmployeeModel> {
    return this.http.get<EmployeeModel>(\`/api/employees/\${employeeCode}\`);
  }

  saveEmployee(model: EmployeeModel): Observable<void> {
    return this.http.post<void>('/api/employees', model);
  }
}`,
                        },
                        {
                            id: 'resolver',
                            label: 'employee.resolver.ts',
                            lang: 'typescript',
                            code: `import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { SicFormData } from 'sic-ng';
import { catchError, EMPTY, map, tap } from 'rxjs';
import { EmployeeForm } from './employee.form';
import { EmployeeModel, EmployeePageData } from './employee.model';
import { EmployeeService } from './employee.service';

export const employeeResolver: ResolveFn<EmployeePageData> = (route: ActivatedRouteSnapshot) => {
  const fb = inject(FormBuilder);
  const service = inject(EmployeeService);
  const employeeForm = EmployeeForm.createForm(fb);
  const employeeCode = route.paramMap.get('employeeCode');

  // ไม่มี employeeCode ใน route (เช่น /employees/new) — เป็นแถวใหม่ ไม่ต้องเรียก service
  // ไม่ส่ง model (พารามิเตอร์ที่ 2) ให้ SicFormData เพื่อให้เริ่มที่ Added ตามความหมายของแถวใหม่จริงๆ
  if (!employeeCode) {
    return { employeeData: new SicFormData<EmployeeModel>(employeeForm) };
  }

  return service.getEmployee(employeeCode).pipe(
    tap((data: EmployeeModel) => {
      if (!data) {
        // service คืนสำเร็จแต่ไม่มีข้อมูล (เช่น employeeCode ไม่ตรงกับใครเลย) — ถือเป็น error เพื่อให้
        // catchError ด้านล่างจัดการเหมือนกรณี error อื่นๆ ไม่ปล่อยให้หน้าเปิดพร้อม form ว่างเงียบๆ
        throw new Error(\`ไม่พบข้อมูลพนักงานรหัส \${employeeCode}\`);
      }

      employeeForm.patchValue(data);
    }),
    // ส่ง data (พารามิเตอร์ที่ 2) เข้า SicFormData เสมอ — ไม่งั้นจะกลายเป็นแถวใหม่ (Added)
    // ทั้งที่จริงเป็นข้อมูลที่โหลดมาแล้ว (isChanged จะเป็น true ตั้งแต่เริ่มโดยไม่ได้แก้อะไรเลย)
    map((data): EmployeePageData => ({ employeeData: new SicFormData<EmployeeModel>(employeeForm, data) })),
    catchError((err) => {
      console.error('Failed to load employee:', err);
      return EMPTY;
    }),
  );
};`,
                        },
                        {
                            id: 'routes',
                            label: 'employee.routes.ts',
                            lang: 'typescript',
                            code: `import { Routes } from '@angular/router';
import { sicCanDeactivateGuard } from 'sic-ng';
import { employeeResolver } from './employee.resolver';

export const employeeRoutes: Routes = [
  {
    path: ':employeeCode',
    // loadComponent แทน component ตรงๆ — โหลด employee.component.ts เป็น lazy chunk แยกจากส่วนอื่นของแอป
    loadComponent: () => import('./employee.component').then((m) => m.EmployeeComponent),
    // key 'form' คงที่ทุกหน้า ไม่ว่า resolver จะคืนกี่ form/grid ก็ตาม (ทั้งหมดห่อรวมอยู่ใน
    // EmployeePageData ก้อนเดียว) — employee.component.ts อ่านผ่าน route.snapshot.data['form']
    resolve: { form: employeeResolver },
    // เด้ง dialog ยืนยันก่อนออกจากหน้าถ้า EmployeeComponent.pageDirty() คืน true (ดู employee.component.ts)
    canDeactivate: [sicCanDeactivateGuard],
  },
];

// app.routes.ts (route ระดับบนสุดของแอป) — โหลด employeeRoutes แบบ lazy ทั้งกลุ่มผ่าน loadChildren
// export const routes: Routes = [
//   { path: 'employees', loadChildren: () => import('./employee/employee.routes').then((m) => m.employeeRoutes) },
// ];`,
                        },
                        {
                            id: 'component-ts',
                            label: 'employee.component.ts',
                            lang: 'typescript',
                            code: `import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SicButtonComponent, SicCanComponentDeactivate, SicCardComponent, SicFlexComponent, SicFormData, SicGridComponent, SicInputComponent, SicInputNumberComponent } from 'sic-ng';
import { EmployeeModel, EmployeePageData } from './employee.model';
import { EmployeeService } from './employee.service';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [ReactiveFormsModule, SicCardComponent, SicGridComponent, SicFlexComponent, SicInputComponent, SicInputNumberComponent, SicButtonComponent],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
})
export class EmployeeComponent implements SicCanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(EmployeeService);

  // route.snapshot.data เป็น { [key: string]: any } — key 'form' มาจาก resolve: { form: employeeResolver }
  // ใน employee.routes.ts ต้องอ่านผ่าน key นั้นก่อนเสมอ อ่าน .data ตรงๆ (as EmployeePageData) เฉยๆ จะได้ undefined
  readonly employeeData: SicFormData<EmployeeModel> = (this.route.snapshot.data['form'] as EmployeePageData).employeeData;

  // sicCanDeactivateGuard (ผูกไว้ที่ canDeactivate ใน employee.routes.ts) เรียกเมธอดนี้ก่อนออกจากหน้า
  // คืน true = ยังมีข้อมูลที่ยังไม่บันทึก จะเด้ง dialog ถามยืนยันก่อนออก
  pageDirty(): boolean {
    return this.employeeData.isChanged;
  }

  save(): void {
    this.employeeData.markAllAsTouched();
    if (this.employeeData.invalid) {
      return;
    }

    this.service.saveEmployee(this.employeeData.value).subscribe(() => this.employeeData.markAsPristine());
  }
}`,
                        },
                        {
                            id: 'component-html',
                            label: 'employee.component.html',
                            lang: 'html',
                            code: `<sic-card [bordered]="true" title="ข้อมูลพนักงาน">
  <form [formGroup]="employeeData.formGroup">
    <sic-grid [cols]="2" gap="1rem" [colsBreakpoints]="{ sm: 1, md: 2, lg: 2 }">
      <sic-input label="รหัสพนักงาน" formControlName="employeeCode" />
      <sic-input label="ชื่อ" formControlName="employeeName" />
      <sic-input label="แผนก" formControlName="department" />
      <sic-input label="ตำแหน่ง" formControlName="position" />
      <sic-input-number label="เงินเดือน" [decimals]="0" formControlName="salary" />
    </sic-grid>
  </form>

  <sic-flex sicCardFooter direction="row" justify="end">
    <sic-button [disabled]="!employeeData.isChanged" (click)="save()">บันทึก</sic-button>
  </sic-flex>
</sic-card>`,
                        },
                        {
                            id: 'component-css',
                            label: 'employee.component.css',
                            lang: 'css',
                            code: `/* ปกติไม่ต้องมี custom CSS เลย — ใช้ sic-section/sic-flex/sic-grid จัด layout
   และ token กลาง (--sic-space-*, --sic-color-*) แทน ใส่เฉพาะกรณีจำเป็นจริงๆ เท่านั้น */`,
                        },
                    ],
                    attributes: [
                        { name: 'pageName.model.ts', type: 'interface', description: 'รูปร่างข้อมูลของหน้านี้ (plain interface ไม่ผูกกับ Angular ใดๆ) — ใช้ร่วมกันได้ทั้ง form/service/resolver/component รวมถึง pageNamePageData (รูปร่างของ route.snapshot.data ทั้งก้อน) ก็ประกาศไว้ในไฟล์นี้ด้วย เผื่อวันหลังหน้านี้ต้องใช้มากกว่า 1 form/grid ก็แค่เพิ่ม field ใน pageNamePageData ที่นี่ แล้วสร้างเพิ่มใน resolver เดียวกัน' },
                        { name: 'pageName.form.ts', type: 'class (static factory)', description: 'สร้าง FormGroup ของหน้านี้ — รวม validator ไว้ที่เดียว ไม่ปนกับ component เพื่อทดสอบ/reuse ได้ง่าย' },
                        { name: 'pageName.service.ts', type: '@Injectable', description: 'เรียก API เท่านั้น ไม่ยุ่งกับ FormGroup/SicFormData — component เป็นคนต่อ service กับ form เอง' },
                        { name: 'pageName.resolver.ts', type: 'ResolveFn', description: 'โหลดข้อมูลก่อนเข้าหน้า, patchValue เข้า FormGroup ถ้ามีข้อมูล, แล้วห่อด้วย SicFormData ส่ง data ที่โหลดมาเป็นพารามิเตอร์ที่ 2 เสมอ คืนเป็น pageNamePageData (import type จาก pageName.model.ts)' },
                        { name: 'pageName.routes.ts', type: 'Routes', description: 'ผูก resolver เข้ากับ route ผ่าน resolve: { form: pageNameResolver } (key ชื่อ "form" คงที่ทุกหน้า ไม่ว่าจะมีกี่ form/grid ก็ตาม), ผูก canDeactivate: [sicCanDeactivateGuard], และโหลด component แบบ lazy ผ่าน loadComponent — export ไปให้ app.routes.ts เรียกทั้งกลุ่มผ่าน loadChildren' },
                        { name: 'pageName.component.ts/.html/.css', type: 'Component', description: 'อ่านข้อมูลจาก route resolver ผ่าน route.snapshot.data[\'form\'] (ต้องอ่านผ่าน key \'form\' เสมอ อ่าน .data ตรงๆ จะได้ undefined เพราะ resolve ผูกไว้ใต้ key นี้ ไม่ใช่ที่ data root), ผูก formGroup เข้ากับ template, เรียก service ตอน save — .css ควรว่างเปล่าเป็นส่วนใหญ่เพราะจัด layout ด้วย sic-component' },
                        { name: 'SicCanComponentDeactivate', type: 'interface (implements)', description: 'component implement pageDirty(): boolean (ปกติคืน employeeData.isChanged ตรงๆ) แล้วผูก canDeactivate: [sicCanDeactivateGuard] ไว้ที่ route — guard จะเด้ง dialog ถามยืนยันก่อนออกจากหน้าถ้ายังมีข้อมูลที่ยังไม่บันทึก' },
                    ],
                    events: [],
                },
                {
                    id: 'standard-transaction',
                    selector: 'standard transaction',
                    title: 'Form + History Grid Pattern',
                    category: 'Setup',
                    description: 'รูปแบบเดียวกับ "standard form" ทุกไฟล์ (pageName.model.ts/.form.ts/.service.ts/.resolver.ts/.routes.ts/.component.ts/.html/.css) เพิ่มเติมแค่ sic-gridpanel อีก 1 ตัวในหน้าเดียวกัน สำหรับบันทึกประวัติการเลื่อนขั้น/เงินเดือน (แถวละ 1 รายการเปลี่ยนแปลง) — save() รวมทั้งฟอร์มหลักและ grid เป็น payload เดียวด้วย sicFormCombine() (ดู "SicFormData + SicGridPanel Combine" ด้านบน), pageDirty() เช็ค isChanged ของฟอร์ม รวมกับ hasPendingChanges ของ grid',
                    code: '',
                    codeBlocks: [
                        {
                            id: 'model',
                            label: 'employee-transaction.model.ts',
                            lang: 'typescript',
                            code: `import { SicFormData } from 'sic-ng';

export interface EmployeeModel {
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  salary: number;
}

// ประวัติการเลื่อนขั้น/เงินเดือน 1 แถวใน sic-gridpanel
export interface EmployeeSalaryHistoryModel {
  id: number;
  effectiveDate: string;
  position: string;
  salary: number;
  remark: string;
}

// ห่อด้วย EmployeeTransactionPageData เหมือน standard form — เผื่อวันหลังต้องใช้มากกว่า 1 form/grid
// ที่โหลดจาก resolver ก็เพิ่ม field ใน interface นี้ได้เลย (ส่วน historyGrid ในหน้านี้โหลดผ่าน
// (loadData) ของ sic-gridpanel เอง ไม่ได้โหลดจาก resolver — resolver มีไว้สำหรับข้อมูลที่ต้อง
// พร้อมตั้งแต่เปิดหน้า เช่นตัวฟอร์มหลัก)
export interface EmployeeTransactionPageData {
  employeeData: SicFormData<EmployeeModel>;
}`,
                        },
                        {
                            id: 'form',
                            label: 'employee-transaction.form.ts',
                            lang: 'typescript',
                            code: `import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToForm } from 'sic-ng';
import { EmployeeModel } from './employee-transaction.model';

export class EmployeeTransactionForm {
  static createForm(fb: FormBuilder): FormGroup<ToForm<EmployeeModel>> {
    return fb.group<ToForm<EmployeeModel>>({
      employeeCode: fb.control(null, [Validators.required, Validators.maxLength(20)]),
      employeeName: fb.control(null, [Validators.required, Validators.maxLength(100)]),
      department: fb.control(null, [Validators.required]),
      position: fb.control(null, [Validators.required]),
      salary: fb.control(null, [Validators.required, Validators.min(0)]),
    });
  }
}`,
                        },
                        {
                            id: 'service',
                            label: 'employee-transaction.service.ts',
                            lang: 'typescript',
                            code: `import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeModel, EmployeeSalaryHistoryModel } from './employee-transaction.model';

@Injectable({ providedIn: 'root' })
export class EmployeeTransactionService {
  private readonly http = inject(HttpClient);

  getEmployee(employeeCode: string): Observable<EmployeeModel> {
    return this.http.get<EmployeeModel>(\`/api/employees/\${employeeCode}\`);
  }

  getSalaryHistory(employeeCode: string): Observable<EmployeeSalaryHistoryModel[]> {
    return this.http.get<EmployeeSalaryHistoryModel[]>(\`/api/employees/\${employeeCode}/salary-history\`);
  }

  // payload เดียวจาก sicFormCombine() — { employee: {...}, history: [...] }
  saveTransaction(payload: unknown): Observable<void> {
    return this.http.post<void>('/api/employees/transaction', payload);
  }
}`,
                        },
                        {
                            id: 'resolver',
                            label: 'employee-transaction.resolver.ts',
                            lang: 'typescript',
                            code: `import { inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { SicFormData } from 'sic-ng';
import { catchError, EMPTY, map, tap } from 'rxjs';
import { EmployeeTransactionForm } from './employee-transaction.form';
import { EmployeeModel, EmployeeTransactionPageData } from './employee-transaction.model';
import { EmployeeTransactionService } from './employee-transaction.service';

// history ไม่ได้โหลดที่นี่ — sic-gridpanel โหลดของตัวเองผ่าน (loadData) ตอน component แสดงผล
export const employeeTransactionResolver: ResolveFn<EmployeeTransactionPageData> = (route: ActivatedRouteSnapshot) => {
  const fb = inject(FormBuilder);
  const service = inject(EmployeeTransactionService);
  const employeeForm = EmployeeTransactionForm.createForm(fb);
  const employeeCode = route.paramMap.get('employeeCode');

  if (!employeeCode) {
    return { employeeData: new SicFormData<EmployeeModel>(employeeForm) };
  }

  return service.getEmployee(employeeCode).pipe(
    tap((data: EmployeeModel) => {
      if (!data) {
        throw new Error(\`ไม่พบข้อมูลพนักงานรหัส \${employeeCode}\`);
      }

      employeeForm.patchValue(data);
    }),
    map((data): EmployeeTransactionPageData => ({ employeeData: new SicFormData<EmployeeModel>(employeeForm, data) })),
    catchError((err) => {
      console.error('Failed to load employee:', err);
      return EMPTY;
    }),
  );
};`,
                        },
                        {
                            id: 'routes',
                            label: 'employee-transaction.routes.ts',
                            lang: 'typescript',
                            code: `import { Routes } from '@angular/router';
import { sicCanDeactivateGuard } from 'sic-ng';
import { employeeTransactionResolver } from './employee-transaction.resolver';

export const employeeTransactionRoutes: Routes = [
  {
    path: ':employeeCode',
    loadComponent: () => import('./employee-transaction.component').then((m) => m.EmployeeTransactionComponent),
    resolve: { form: employeeTransactionResolver },
    canDeactivate: [sicCanDeactivateGuard],
  },
];`,
                        },
                        {
                            id: 'component-ts',
                            label: 'employee-transaction.component.ts',
                            lang: 'typescript',
                            code: `import { Component, ViewChild, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  SicButtonComponent,
  SicCanComponentDeactivate,
  SicCardComponent,
  SicFlexComponent,
  SicFormData,
  sicFormCombine,
  SicGridComponent,
  SicGridLoadRequest,
  SicGridPanelComponent,
  SicGridPanelConfig,
  SicInputComponent,
  SicInputNumberComponent,
} from 'sic-ng';
import { EmployeeModel, EmployeeTransactionPageData } from './employee-transaction.model';
import { EmployeeTransactionService } from './employee-transaction.service';

@Component({
  selector: 'app-employee-transaction',
  standalone: true,
  imports: [ReactiveFormsModule, SicCardComponent, SicGridComponent, SicFlexComponent, SicInputComponent, SicInputNumberComponent, SicButtonComponent],
  templateUrl: './employee-transaction.component.html',
  styleUrl: './employee-transaction.component.css',
})
export class EmployeeTransactionComponent implements SicCanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(EmployeeTransactionService);

  // ต้องใช้ @ViewChild ตัวนี้ (ต่างจากตัวอย่างอื่นที่ส่ง grid ผ่าน template reference variable ตรงๆ
  // ในปุ่ม) เพราะ pageDirty() ถูกเรียกจาก sicCanDeactivateGuard ตอนออกจากหน้า ไม่ใช่ตอน click
  @ViewChild('historyGrid') private historyGrid?: SicGridPanelComponent;

  readonly employeeData: SicFormData<EmployeeModel> = (this.route.snapshot.data['form'] as EmployeeTransactionPageData).employeeData;

  historyGridConfig: SicGridPanelConfig = {
    id: 'id',
    lazy: false,
    column: [
      { label: 'วันที่มีผล', name: 'effectiveDate', type: 'date', editable: true, validators: [Validators.required] },
      { label: 'ตำแหน่งใหม่', name: 'position', type: 'text', editable: true, validators: [Validators.required] },
      { label: 'เงินเดือนใหม่', name: 'salary', type: 'number', editable: true, decimals: 0, validators: [Validators.required] },
      { label: 'หมายเหตุ', name: 'remark', type: 'text', editable: true },
    ],
  };

  handleHistoryLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    this.service.getSalaryHistory(this.employeeData.value.employeeCode).subscribe((rows) => {
      grid.setRows(rows, { totalElements: rows.length }, request.requestId);
    });
  }

  pageDirty(): boolean {
    return this.employeeData.isChanged || (this.historyGrid?.hasPendingChanges ?? false);
  }

  save(): void {
    if (!this.historyGrid) {
      return;
    }

    const combined = sicFormCombine({
      employee: this.employeeData,
      history: this.historyGrid,
    });

    combined.markAllAsTouched();
    if (combined.invalid) {
      return;
    }

    this.service.saveTransaction(combined.value).subscribe(() => {
      this.employeeData.markAsPristine();
      // reload() ดึงแถวประวัติล่าสุดจาก server กลับมาแสดง หลังบันทึกสำเร็จ
      this.historyGrid?.reload();
    });
  }
}`,
                        },
                        {
                            id: 'component-html',
                            label: 'employee-transaction.component.html',
                            lang: 'html',
                            code: `<sic-flex direction="column" gap="1rem">
  <sic-card [bordered]="true" title="ข้อมูลพนักงาน">
    <form [formGroup]="employeeData.formGroup">
      <sic-grid [cols]="2" gap="1rem" [colsBreakpoints]="{ sm: 1, md: 2, lg: 2 }">
        <sic-input label="รหัสพนักงาน" formControlName="employeeCode" />
        <sic-input label="ชื่อ" formControlName="employeeName" />
        <sic-input label="แผนก" formControlName="department" />
        <sic-input label="ตำแหน่ง" formControlName="position" />
        <sic-input-number label="เงินเดือน" [decimals]="0" formControlName="salary" />
      </sic-grid>
    </form>
  </sic-card>

  <sic-card [bordered]="true" title="ประวัติการเลื่อนขั้น/เงินเดือน">
    <sic-gridpanel
      #historyGrid
      [config]="historyGridConfig"
      (loadData)="handleHistoryLoad($event, historyGrid)"
    />
  </sic-card>

  <sic-flex direction="row" justify="end">
    <sic-button (click)="save()">บันทึก</sic-button>
  </sic-flex>
</sic-flex>`,
                        },
                        {
                            id: 'component-css',
                            label: 'employee-transaction.component.css',
                            lang: 'css',
                            code: `/* ปกติไม่ต้องมี custom CSS เลย — ใช้ sic-card/sic-flex/sic-grid จัด layout
   และ token กลาง (--sic-space-*, --sic-color-*) แทน ใส่เฉพาะกรณีจำเป็นจริงๆ เท่านั้น */`,
                        },
                    ],
                    attributes: [
                        { name: 'pageName.model.ts', type: 'interface', description: 'เหมือน standard form — เพิ่ม interface สำหรับ 1 แถวของ grid ประวัติ (EmployeeSalaryHistoryModel) ต่างหาก ไม่ต้องใส่ใน pageNamePageData เพราะ grid ไม่ได้โหลดจาก resolver' },
                        { name: 'pageName.service.ts', type: '@Injectable', description: 'เพิ่มเมธอดโหลด/บันทึกของ grid ประวัติแยกจากฟอร์มหลัก — saveTransaction() รับ payload เดียวจาก sicFormCombine()' },
                        { name: 'sic-gridpanel ตัวที่ 2', type: 'component', description: 'โหลดข้อมูลผ่าน (loadData) ของตัวเอง (ไม่ผ่าน resolver) — เรียก service.getSalaryHistory() ตอน component แสดงผลครั้งแรก' },
                        { name: 'sicFormCombine()', type: 'function', description: 'save() รวม employeeData (SicFormData) + historyGrid (SicGridPanelComponent) เป็น payload เดียว — markAllAsTouched()/invalid เช็คทั้งสองพร้อมกันในคำสั่งเดียว (ดู "SicFormData + SicGridPanel Combine" ด้านบน)' },
                        { name: '@ViewChild + pageDirty()', type: 'pattern', description: 'ต่างจาก standard form ตรงที่ pageDirty() ต้องเช็ค grid ด้วย (hasPendingChanges) ซึ่งเรียกจาก guard ไม่ใช่ตอน click จึงต้องเก็บ reference ของ grid ไว้ด้วย @ViewChild แทนที่จะส่งผ่าน template reference variable เข้า method ตรงๆ แบบตัวอย่างอื่น' },
                    ],
                    events: [],
                },
            ],
        },
        {
            id: 'navigation',
            title: 'Navigation',
            description: 'เมนูและการนำทาง',
            components: [
                {
                    id: 'sic-navbar',
                    selector: 'sic-navbar',
                    title: 'Navbar',
                    category: 'Navigation',
                    description: 'แถบเมนูบน — header มี UI เริ่มต้นแบบง่ายให้ (โลโก้+ชื่อ จาก logo/brand input) แต่ left (hamburger) และ right (theme toggle+แจ้งเตือน+เมนูโปรไฟล์) ไม่มี UI สำเร็จรูปแล้ว ต้องประกอบเองทั้งหมดผ่าน content-template slots (sicNavbarHeader/sicNavbarLeft/sicNavbarRight) โดย component ยังมี state/method ให้ครบ (darkMode, notifications, user, menuItems, toggleSidebar(), toggleDarkMode(), toggleNotifications(), toggleUserMenu() ฯลฯ) รับ context เป็น instance ของ navbar เอง (let-navbar) เข้าถึงทุกอย่างได้จาก template ของคุณเอง — ไม่มีช่องค้นหาในตัว ถ้าต้องการค้นหาแบบ popover ให้ใช้ sic-search แทน',
                    code: `<sic-navbar
  [sticky]="false"
  [showSidebarToggle]="true"
  [(collapsed)]="navbarCollapsed"
  [darkMode]="navbarDarkMode"
  [notifications]="navbarNotifications"
  [user]="navbarUser"
  [menuItems]="navbarMenuItems"
  (darkModeChange)="navbarDarkMode = $event"
  (notificationClick)="handleNavbarNotification($event)"
  (viewAllNotifications)="handleNavbarViewAll()"
  (menuItemClick)="handleNavbarMenuItem($event)"
>
  <!-- ไม่ใส่ sicNavbarHeader ก็ยังได้ header เริ่มต้นแบบง่าย ถ้ามี logo/brand input -->
  <ng-template sicNavbarHeader let-navbar>
    <div class="my-navbar-brand">🐙 sic-ng</div>
  </ng-template>

  <!-- ไม่มี UI hamburger ให้แล้ว ประกอบเองจาก showSidebarToggle/collapsed -->
  <ng-template sicNavbarLeft let-navbar>
    <div class="my-navbar-left">
      @if (navbar.showSidebarToggle) {
        <button type="button" (click)="navbar.toggleSidebar()">☰</button>
      }
    </div>
  </ng-template>

  <!-- ไม่มี UI theme toggle/แจ้งเตือน/user menu ให้แล้ว ประกอบเองจาก darkMode/notifications/user -->
  <ng-template sicNavbarRight let-navbar>
    <div class="my-navbar-right">
      <button type="button" (click)="navbar.toggleDarkMode()">{{ navbar.darkMode ? '🌙' : '☀️' }}</button>
      <button type="button" (click)="navbar.toggleNotifications($event)">
        🔔
        @if (navbar.hasUnread) { <span class="dot"></span> }
      </button>
      @if (navbar.notificationsOpen) {
        <div class="my-navbar-panel">
          @for (n of navbar.notifications; track n.id) {
            <button type="button" (click)="navbar.selectNotification(n)">{{ n.message }}</button>
          } @empty {
            <span>{{ navbar.noNotificationsText }}</span>
          }
        </div>
      }
      @if (navbar.user) {
        <button type="button" (click)="navbar.toggleUserMenu($event)">{{ navbar.user.name }}</button>
      }
    </div>
  </ng-template>
</sic-navbar>`,
                    tsCode: `navbarCollapsed = false;
navbarDarkMode = false;
navbarUser: SicNavbarUser = { name: 'Musharof', email: 'randomuser@pimjo.com' };
navbarMenuItems: SicNavbarMenuItem[] = [
  { label: 'Edit profile', icon: '👤', action: 'edit-profile' },
  { label: 'Account Settings', icon: '⚙️', action: 'account-settings' },
  { label: 'Support', icon: '💬', action: 'support' },
  { label: 'Sign out', icon: '↩️', action: 'sign-out' },
];
// actor + message + target ประกอบเป็นข้อความเดียว: "Terry Franci requests permission to change Project - Nganter App"
navbarNotifications: SicNavbarNotification[] = [
  {
    id: 1,
    actor: 'Terry Franci',
    message: 'requests permission to change',
    target: 'Project - Nganter App',
    category: 'Project',
    time: '5 min ago',
    status: 'online', // เขียว/แดง/เหลือง/เทา ที่มุมล่างของ avatar
    read: false,
  },
];

handleNavbarMenuItem(item: SicNavbarMenuItem): void {
  this.toasts.show(\`เลือกเมนู \${item.label}\`, 'info');
}

handleNavbarNotification(notification: SicNavbarNotification): void {
  this.toasts.show(\`เปิดแจ้งเตือน: \${notification.actor ?? notification.message}\`, 'info');
}

handleNavbarViewAll(): void {
  this.toasts.show('ดูการแจ้งเตือนทั้งหมด', 'info');
}`,
                    attributes: [
                        { name: 'sticky', type: 'boolean', default: 'false', description: 'กำหนดให้ navbar ติดด้านบนขณะ scroll (position: sticky — ยังกินพื้นที่ใน document flow ตามปกติ)' },
                        { name: 'fixed', type: 'boolean', default: 'false', description: 'ปักหมุด navbar ไว้บนสุดของหน้าจอเสมอด้วย position: fixed (ลอยทับเนื้อหา ไม่กินพื้นที่ document flow — อย่าลืมเผื่อ padding/margin-top ให้เนื้อหาถัดไปเอง) มีผลเหนือกว่า sticky ถ้าตั้งทั้งคู่' },
                        { name: 'logo / brand', type: 'string', description: 'ใช้กับ header เริ่มต้นแบบง่าย (โลโก้+ชื่อ) เป็น UI สำเร็จรูปเดียวที่ยังมีให้ — ถ้าไม่ใส่และไม่ใช้ sicNavbarHeader จะไม่มีอะไรแสดงเลย' },
                        { name: 'collapsed', type: 'boolean', default: 'false', description: 'ใช้ตัวแปรเดียวกับ sic-sidebar เพื่อผูก hamburger ที่คุณสร้างเองใน sicNavbarLeft เข้ากับสถานะย่อ/ขยายของ sidebar โดยตรง' },
                        { name: 'showSidebarToggle', type: 'boolean', default: 'false', description: 'ไม่มี UI ในตัวอ่านค่านี้ — เป็น state เปล่าไว้ให้ sicNavbarLeft ของคุณเช็คเองว่าจะวาดปุ่ม hamburger หรือไม่' },
                        { name: 'showThemeToggle / showNotifications', type: 'boolean', default: 'true', description: 'เช่นเดียวกับ showSidebarToggle — ไม่มี UI ในตัวอ่านค่านี้แล้ว เป็น state ไว้ให้ template ของคุณเองเช็ค' },
                        { name: 'darkMode', type: 'boolean', default: 'false', description: 'state ปุ่มสลับธีม (☀️/🌙) — ไม่มี UI ในตัวแล้ว ต้องประกอบเองผ่าน sicNavbarRight แล้วผูกกับ darkMode/toggleDarkMode() — component ไม่ผูกกับธีมจริง ต้องรับ event ไปตั้งค่าเอง' },
                        { name: 'notifications', type: 'SicNavbarNotification[]', description: 'รายการแจ้งเตือน — ไม่มี UI dropdown ในตัวแล้ว ต้องประกอบเองผ่าน sicNavbarRight แล้วผูกกับ notifications/notificationsOpen/toggleNotifications()/selectNotification()/closeNotifications()/handleViewAllNotifications()/hasUnread/noNotificationsText/viewAllNotificationsText' },
                        { name: 'user', type: 'SicNavbarUser', description: 'ชื่อ/อีเมล/รูป — ไม่มี UI ปุ่มมุมขวาในตัวแล้ว ต้องประกอบเองผ่าน sicNavbarRight' },
                        { name: 'menuItems', type: 'SicNavbarMenuItem[]', description: 'รายการเมนู dropdown โปรไฟล์ — ไม่มี UI ในตัวแล้ว ต้องประกอบเองผ่าน sicNavbarRight แล้วผูกกับ menuItems/userMenuOpen/toggleUserMenu()/selectMenuItem()' },
                        {
                            name: 'sicNavbarHeader / sicNavbarLeft / sicNavbarRight',
                            type: '<ng-template>',
                            description: 'บังคับต้องใส่ sicNavbarLeft/sicNavbarRight เองถ้าต้องการ hamburger/theme toggle/แจ้งเตือน/user menu เพราะไม่มี UI เริ่มต้นแล้ว (sicNavbarHeader ยังมีทางเลือกใช้ logo/brand input แทนได้) — รับ context { $implicit: navbar instance } เช่น <ng-template sicNavbarRight let-navbar>',
                        },
                    ],
                    events: [
                        { name: 'collapsedChange', payload: 'boolean', description: 'เมื่อกด hamburger' },
                        { name: 'darkModeChange', payload: 'boolean', description: 'เมื่อกดปุ่มสลับธีม' },
                        { name: 'notificationClick', payload: 'SicNavbarNotification', description: 'เมื่อเลือกแจ้งเตือนใน dropdown (ปิด dropdown ให้อัตโนมัติ)' },
                        { name: 'viewAllNotifications', payload: '-', description: 'เมื่อกดปุ่ม "View All Notifications" ท้าย panel (ปิด dropdown ให้อัตโนมัติ)' },
                        { name: 'menuItemClick', payload: 'SicNavbarMenuItem', description: 'เมื่อเลือกเมนูใน dropdown โปรไฟล์ (ปิด dropdown ให้อัตโนมัติ)' },
                    ],
                },
                {
                    id: 'sic-breadcrumb',
                    selector: 'sic-breadcrumb',
                    title: 'Breadcrumb',
                    category: 'Navigation',
                    description: 'แสดงลำดับ path ปัจจุบัน เช่น Home / Library',
                    code: `<sic-breadcrumb [items]="breadcrumbItems" separator="/" />`,
                    tsCode: `breadcrumbItems: SicBreadcrumbItem[] = [
  { label: 'Home', link: '/' },
  { label: 'Library' },
];`,
                    attributes: [
                        { name: 'items', type: 'SicBreadcrumbItem[]', description: 'รายการ breadcrumb แต่ละตัว เช่น label และ link' },
                        { name: 'separator', type: 'string', default: '/', description: 'ตัวคั่นระหว่าง breadcrumb' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-sidebar',
                    selector: 'sic-sidebar',
                    title: 'Sidebar',
                    category: 'Navigation',
                    description: 'เมนูด้านข้าง รองรับสถานะย่อ/ขยาย, active link, และ badge แบบ dynamic — ตอนย่ออยู่ เอา cursor ไปวางจะกางออกมาเต็มชั่วคราวแล้วหุบกลับเองเมื่อเมาส์ออก (peek), เมนูรองรับการซ้อน submenu ได้ไม่จำกัดจำนวนชั้น (item.children ใส่ children ต่อกันไปเรื่อยๆ ได้) แต่ละชั้นพับ/กางเองได้อิสระ และเมื่อ activeLink ตรงกับเมนูที่ซ้อนอยู่ลึกแค่ไหนก็ตาม ทุกชั้นที่เป็นบรรพบุรุษของมันจะกางอัตโนมัติให้เห็นเมนูที่ active อยู่เสมอ, header/footer ล็อกตำแหน่งไว้ ส่วนเมนูตรงกลางมี scrollbar เองเมื่อยาวเกิน, บนจอมือถือตอนย่อจะซ่อนทั้งหมดเหลือแค่ปุ่มขยาย — header/menu มี UI เริ่มต้นให้ (โลโก้/รายการเมนู) ส่วน subheader (ช่องค้นหา) และ footer (โปรไฟล์ + ปุ่ม logout) ไม่มี UI สำเร็จรูปแล้ว ต้องประกอบเองผ่าน content-template slots ทั้งหมด (ใช้ state/method ที่ยังมีให้ เช่น search, user, handleSearchInput(), handleUserAction())',
                    code: `<sic-sidebar
  [sections]="sidebarSections"
  [collapsed]="sidebarCollapsed"
  activeLink="/setting/general/language"
  logo="🐙"
  brand="Web Monster"
  [search]="sidebarSearch"
  [user]="sidebarUser"
  accentColor="#ef4444"
  (collapsedChange)="sidebarCollapsed = $event"
  (searchChange)="sidebarSearch = $event"
  (userAction)="handleSidebarUserAction($event)"
>
  <!-- ไม่มี UI ช่องค้นหาให้แล้ว ประกอบเองจาก search/searchChange -->
  <ng-template sicSidebarSubheader let-sidebar let-expanded="expanded">
    <div class="my-sidebar-search">
      🔍
      @if (expanded) {
        <input [value]="sidebar.search" (input)="sidebar.handleSearchInput($any($event.target).value)" placeholder="Search..." />
      }
    </div>
  </ng-template>

  <!-- ไม่มี UI user card / logout ให้แล้ว ประกอบเองจาก user/userAction -->
  <ng-template sicSidebarFooter let-sidebar let-expanded="expanded">
    @if (sidebar.user) {
      <div class="my-sidebar-footer">
        <span>{{ sidebar.user.name.charAt(0) }}</span>
        @if (expanded) { <span>{{ sidebar.user.name }}</span> }
        @if (expanded) {
          <button type="button" title="Logout" (click)="sidebar.handleUserAction()">
            <svg viewBox="0 0 24 24" width="17" height="17"><!-- logout icon --></svg>
          </button>
        }
      </div>
    }
  </ng-template>
</sic-sidebar>`,
                    tsCode: `sidebarSections: SicSidebarSection[] = [
  {
    title: 'Menu',
    items: [
      { label: 'Home', icon: '🏠', link: '/home' },
      { label: 'Task', icon: '📋', link: '/task', badge: 12 },
      { label: 'Notification', icon: '🔔', link: '/notification', badge: 14 },
      {
        // children ซ้อนกันได้ไม่จำกัดชั้น — แต่ละ item ก็มี children ของตัวเองได้อีก
        label: 'Setting',
        icon: '⚙️',
        children: [
          {
            label: 'General',
            children: [
              { label: 'Language', link: '/setting/general/language' },
              { label: 'Region', link: '/setting/general/region' },
            ],
          },
          {
            label: 'Security',
            children: [{ label: 'Two-Factor Auth', link: '/setting/security/2fa' }],
          },
          { label: 'Notifications', link: '/setting/notifications' },
        ],
      },
    ],
  },
  {
    title: 'Group',
    variant: 'list', // dot + chevron แทน icon + badge
    items: [
      { label: 'Figma Files', color: '#22c55e', link: '/group/figma' },
      { label: 'Downloads', color: '#3b82f6', link: '/group/downloads' },
    ],
  },
];
sidebarUser: SicSidebarUser = { name: 'Web Monster', email: 'web@monster.com' };
sidebarCollapsed = false;
sidebarSearch = '';

handleSidebarUserAction(user: SicSidebarUser): void {
  this.toasts.show(\`ออกจากระบบ \${user.name}\`, 'info');
}`,
                    attributes: [
                        { name: 'sections', type: 'SicSidebarSection[]', description: 'กลุ่มเมนู แต่ละกลุ่มมี title และ variant (menu = icon+badge, list = dot สี+chevron)' },
                        { name: 'items', type: 'SicSidebarItem[]', description: '(ทางเลือกแบบเดิม) รายการเมนูแบบไม่มีกลุ่ม ใช้แทน sections ได้เมื่อไม่ต้องการแบ่งกลุ่ม' },
                        { name: 'items[].children', type: 'SicSidebarItem[]', description: 'ซ้อน submenu ในแต่ละ item ได้ — children ของ children ได้เรื่อยๆ ไม่จำกัดจำนวนชั้น แต่ละชั้นพับ/กางเป็นอิสระจากกัน' },
                        { name: 'collapsed', type: 'boolean', default: 'false', description: 'กำหนดสถานะย่อ/ขยาย sidebar' },
                        { name: 'showToggle', type: 'boolean', default: 'true', description: 'ซ่อนปุ่มพับ/กางในตัวได้ (เช่น เมื่อจะใช้ hamburger ของ sic-navbar ควบคุม collapsed แทน — ดูตัวอย่าง "Navbar + Sidebar + Breadcrumb" ด้านล่าง)' },
                        { name: 'collapseMode', type: `'rail' | 'hidden'`, default: `'rail'`, description: `'rail': ตอนพับเหลือแถบไอคอนแคบๆ (ค่าเริ่มต้น). 'hidden': ตอนพับหายไปทั้งหมด (กว้าง 0) ไม่ต้องแสดงแบบย่อเลย เหมือนพฤติกรรมบนมือถือแต่ใช้ได้ทุกขนาดจอ` },
                        { name: 'activeLink', type: 'string', description: 'link ปัจจุบันที่ต้องการ highlight — ถ้าอยู่ในเมนูที่ซ้อนอยู่ลึกกี่ชั้นก็ตาม ทุกชั้นที่เป็นบรรพบุรุษจะกางอัตโนมัติให้เห็นเมนู active นั้น' },
                        { name: 'logo / brand', type: 'string', description: 'โลโก้ (emoji/ตัวอักษร) และชื่อระบบที่ส่วนหัว (มี UI เริ่มต้นให้)' },
                        { name: 'search / searchPlaceholder', type: 'string', description: 'state ช่องค้นหา — ไม่มี UI ในตัวแล้ว ต้องประกอบเองผ่าน sicSidebarSubheader แล้วผูกกับ search/handleSearchInput()' },
                        { name: 'darkMode', type: 'boolean', default: 'false', description: 'state โหมดมืด — ไม่มี UI ในตัวแล้ว ต้องประกอบเองผ่าน sicSidebarFooter แล้วผูกกับ darkMode/setDarkMode()' },
                        { name: 'user', type: 'SicSidebarUser', description: 'ข้อมูลผู้ใช้ (avatar, name, email) — ไม่มี UI การ์ดในตัวแล้ว ต้องประกอบเองผ่าน sicSidebarFooter แล้วผูกกับ user/handleUserAction()' },
                        { name: 'accentColor', type: 'string', description: 'สีเน้นของ active bar และ badge ปรับได้ต่อ instance (ค่าเริ่มต้นคือ --sic-color-danger)' },
                        {
                            name: 'sicSidebarHeader / sicSidebarMenu',
                            type: '<ng-template>',
                            description: 'ถ้าต้องการ แทนที่ header/เมนู ที่มี UI เริ่มต้นให้อยู่แล้ว',
                        },
                        {
                            name: 'sicSidebarSubheader / sicSidebarFooter',
                            type: '<ng-template>',
                            description: 'บังคับต้องใส่เองถ้าต้องการช่องค้นหา/theme toggle/user card เพราะไม่มี UI เริ่มต้นแล้ว — รับ context { collapsed, expanded, $implicit: sidebar instance } เช่น <ng-template sicSidebarFooter let-sidebar>',
                        },
                    ],
                    events: [
                        { name: 'collapsedChange', payload: 'boolean', description: 'ส่งค่าออกมาเมื่อ sidebar ถูกย่อหรือขยาย' },
                        { name: 'itemSelect', payload: 'SicSidebarItem', description: 'เมื่อเลือกเมนูที่ไม่มี children' },
                        { name: 'searchChange', payload: 'string', description: 'ส่งออกมาเมื่อเรียก sidebar.handleSearchInput(value) จาก template ของคุณเอง' },
                        { name: 'darkModeChange', payload: 'boolean', description: 'ส่งออกมาเมื่อเรียก sidebar.setDarkMode(value) จาก template ของคุณเอง' },
                        { name: 'userAction', payload: 'SicSidebarUser', description: 'ส่งออกมาเมื่อเรียก sidebar.handleUserAction() จาก template ของคุณเอง' },
                    ],
                },
                {
                    id: 'sic-navbar-sidebar-breadcrumb-combo-v1',
                    selector: 'sic-navbar + sic-sidebar + sic-breadcrumb',
                    title: 'Navbar + Sidebar + Breadcrumb ร่วมกัน',
                    category: 'Navigation',
                    description: 'ตัวอย่างการวาง layout แบบ admin shell จริง: ปิดปุ่มพับ/กางในตัวของ sic-sidebar ([showToggle]="false") แล้วใช้ hamburger ของ sic-navbar (ประกอบเองใน sicNavbarHeader วางไว้เป็นอันแรกก่อนโลโก้) ควบคุม collapsed ตัวเดียวกันแทน — ตั้ง [collapseMode]="\'hidden\'" ให้ sidebar หายไปทั้งหมดตอนพับแทนที่จะเหลือแถบไอคอนแคบๆ (ไม่ต้องแสดงแบบย่อเลย ตามที่ขอ) และ sic-breadcrumb ด้านบนแสดง path ของเมนูที่เลือกอยู่ ไล่จากเมนูแม่ไปจนถึงเมนูปัจจุบัน คำนวณจาก activeLink โดยไล่ดู children ของ sidebarSections เอง (breadcrumb ไม่ได้ผูกกับ sidebar โดยตรง เพราะ sidebar ไม่มี event ส่ง path ออกมาให้ ต้องประกอบเองฝั่ง host เสมอ) — ฝั่งขวาของ navbar (sicNavbarRight) ประกอบ 3 อย่าง: ปุ่มสลับ dark mode ธรรมดา, กระดิ่งแจ้งเตือนที่ใช้ sic-popover แสดงรายการแจ้งเตือนเป็น list (แทนที่จะ toggle เอง), และรูป+ชื่อโปรไฟล์',
                    code: `<sic-navbar [sticky]="false" [showSidebarToggle]="true">
  <ng-template sicNavbarHeader let-navbar>
    <!-- hamburger วางไว้เป็นอันแรก ก่อนโลโก้/ชื่อ — สลับ shellCollapsed ตัวเดียวกับที่ผูกกับ sidebar ด้านล่าง -->
    <button type="button" (click)="shellCollapsed = !shellCollapsed">☰</button>
    <div class="my-shell-brand">🐙 sic-ng</div>
  </ng-template>

  <ng-template sicNavbarRight let-navbar>
    <div class="my-shell-right">
      <button type="button" (click)="shellDarkMode = !shellDarkMode">{{ shellDarkMode ? '🌙' : '☀️' }}</button>

      <!-- กระดิ่งแจ้งเตือนประกอบจาก sic-popover เอง แทนที่จะใช้ notificationsOpen/toggleNotifications ของ navbar -->
      <sic-popover [items]="navbarNotifications" (itemSelect)="handleNavbarNotification($event)">
        <ng-template sicPopoverButton let-popover>
          <button type="button" (click)="popover.toggle()">
            🔔
            @if (shellHasUnreadNotifications) { <span class="dot"></span> }
          </button>
        </ng-template>
        <ng-template sicPopoverHeader><div>Notifications</div></ng-template>
        <ng-template sicPopoverList let-item>
          @if (item.actor) { <b>{{ item.actor }}</b> }
          {{ item.message }}
          <span>{{ item.time }}</span>
        </ng-template>
      </sic-popover>

      <div class="my-shell-profile">
        <span class="avatar">{{ navbarUser.name.charAt(0) }}</span>
        <span>{{ navbarUser.name }}</span>
      </div>
    </div>
  </ng-template>
</sic-navbar>

<div class="my-shell-body">
  <sic-sidebar
    [sections]="sidebarSections"
    [collapsed]="shellCollapsed"
    [showToggle]="false"
    collapseMode="hidden"
    [activeLink]="shellActiveLink"
    (itemSelect)="handleShellItemSelect($event)"
  />

  <div class="my-shell-content">
    <sic-breadcrumb [items]="shellBreadcrumbItems" separator="/" (itemClick)="handleShellBreadcrumbClick($event)" />
    <!-- ...เนื้อหาหน้าตาม shellActiveLink... -->
  </div>
</div>`,
                    tsCode: `shellCollapsed = false;
shellActiveLink = '/home';
shellDarkMode = false;

// ใช้ navbarUser/navbarNotifications ชุดเดียวกับตัวอย่าง sic-navbar เดี่ยวๆ ด้านบน
get shellHasUnreadNotifications(): boolean {
  return this.navbarNotifications.some((n) => !n.read);
}

// ไล่หา path ของเมนูที่ activeLink ตรงกับ item ไหน จาก sidebarSections เดิม (รองรับ children ซ้อนกี่ชั้นก็ได้)
get shellBreadcrumbItems(): SicBreadcrumbItem[] {
  for (const section of this.sidebarSections) {
    const path = this.findSidebarPath(section.items, this.shellActiveLink, []);
    if (path) {
      return path.map((item, i) => i === path.length - 1 ? { label: item.label } : { label: item.label, link: item.link });
    }
  }
  return [];
}

private findSidebarPath(items: SicSidebarItem[], link: string, trail: SicSidebarItem[]): SicSidebarItem[] | null {
  for (const item of items) {
    const nextTrail = [...trail, item];
    if (item.link === link) return nextTrail;
    if (item.children?.length) {
      const found = this.findSidebarPath(item.children, link, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

// sidebar.itemSelect ยิงเฉพาะ item ที่ไม่มี children (ตัวที่มี children แค่พับ/กางตัวเอง ไม่ยิง event) — ใช้ link ของมันเป็น activeLink ใหม่ได้ตรงๆ
handleShellItemSelect(item: SicSidebarItem): void {
  if (item.link) {
    this.shellActiveLink = item.link;
  }
}

handleShellBreadcrumbClick(item: SicBreadcrumbItem): void {
  if (item.link) {
    this.shellActiveLink = item.link;
  }
}`,
                    attributes: [
                        {
                            name: '[showToggle]="false" (sidebar)',
                            type: 'boolean',
                            description: 'ปิดปุ่มพับ/กางในตัวของ sidebar เพราะจะใช้ hamburger ของ navbar ควบคุม collapsed แทน — ถ้าไม่ปิดจะมีปุ่มพับ/กางซ้อนกันสองที่',
                        },
                        {
                            name: `collapseMode="hidden" (sidebar)`,
                            type: `'rail' | 'hidden'`,
                            description: 'ให้ sidebar หายไปทั้งหมดตอนพับ (กว้าง 0) แทนที่จะเหลือแถบไอคอน — ตรงตามที่ขอ "แสดงเต็มหรือพับออกไปเลย ไม่ต้องแสดงแบบย่อ"',
                        },
                        {
                            name: 'sicNavbarHeader (navbar)',
                            type: '<ng-template>',
                            description: 'ประกอบปุ่ม hamburger รวมกับโลโก้/ชื่อในสล็อตเดียว วางปุ่ม hamburger ไว้เป็นอันแรกสุด แล้วสลับ shellCollapsed ตัวเดียวกับที่ผูกกับ [collapsed] ของ sidebar — navbar กับ sidebar จึงซิงค์กันโดยไม่ต้องมี event พิเศษระหว่างกัน',
                        },
                        {
                            name: 'sicNavbarRight (navbar)',
                            type: '<ng-template>',
                            description: 'ประกอบ dark mode toggle + กระดิ่งแจ้งเตือน (ใช้ sic-popover แสดง navbarNotifications เป็น list พร้อม header/list ของตัวเอง) + รูป/ชื่อโปรไฟล์จาก navbarUser — ทุกส่วนเป็น state/data ที่ host คุมเองทั้งหมด ไม่ผูกกับ input darkMode/notifications/user ของ sic-navbar เลย',
                        },
                        {
                            name: 'sic-popover (ในกระดิ่งแจ้งเตือน)',
                            type: 'component',
                            description: 'ใช้แทนกลไก notificationsOpen/toggleNotifications ในตัวของ sic-navbar — sicPopoverButton คือปุ่มกระดิ่ง, sicPopoverHeader ใส่หัวข้อ, sicPopoverList แสดงแต่ละแจ้งเตือน, itemSelect ยิง handleNavbarNotification เดิม',
                        },
                        {
                            name: 'shellBreadcrumbItems (host)',
                            type: 'SicBreadcrumbItem[]',
                            description: 'getter ที่ host เขียนเอง ไล่หา path จาก sidebarSections ตาม shellActiveLink — sic-breadcrumb เองไม่รู้จัก sidebar เลย จึงต้องคำนวณ path นี้ที่ฝั่ง host เสมอไม่ว่าจะใช้คู่กับ sidebar แบบไหน',
                        },
                    ],
                    events: [
                        { name: 'itemSelect (sidebar)', payload: 'SicSidebarItem', description: 'อัพเดต shellActiveLink เมื่อเลือกเมนูที่ไม่มี children — breadcrumb จะคำนวณ path ใหม่ตามนี้อัตโนมัติ' },
                        { name: 'itemClick (breadcrumb)', payload: 'SicBreadcrumbItem', description: 'คลิกเมนูแม่ใน breadcrumb เพื่อย้อนกลับไปเมนูนั้นได้เลย (ตั้ง shellActiveLink กลับไปที่ link ของ ancestor ที่คลิก)' },
                        { name: 'itemSelect (sic-popover)', payload: 'SicNavbarNotification', description: 'เมื่อคลิกแจ้งเตือนใน popover — ตัวอย่างนี้ส่งต่อไป handleNavbarNotification เดิม (แสดง toast)' },
                    ],
                },
                {
                    id: 'sic-navbar-sidebar-breadcrumb-combo-v2',
                    selector: 'sic-sidebar + sic-navbar + sic-breadcrumb',
                    title: 'Navbar + Sidebar + Breadcrumb ร่วมกัน (v2: sidebar เต็มความสูง)',
                    category: 'Navigation',
                    description: 'เหมือนตัวอย่าง v1 ทุกอย่าง (ปิด [showToggle] ของ sidebar, ใช้ hamburger ของ navbar ควบคุม collapsed, collapseMode="hidden", breadcrumb คำนวณ path เอง, ฝั่งขวาของ navbar มี dark mode + sic-popover แจ้งเตือน + โปรไฟล์) แต่สลับ layout ใหม่: sidebar ขึ้นไปเต็มความสูงของ shell ตั้งแต่บนสุดจนล่างสุด (ไม่ได้อยู่ใต้ navbar เหมือน v1) โดย sidebar กับ navbar วางเรียงกันแบบแถว (row) แทนที่จะเป็นคอลัมน์ — sidebar เป็น sibling อยู่ซ้ายสุด ส่วน navbar+เนื้อหาอยู่ในคอลัมน์ทางขวา โลโก้/แบรนด์จึงย้ายไปอยู่ที่ sidebar เอง (logo/brand input) แทนที่จะอยู่ใน sicNavbarHeader เพราะ navbar ไม่ได้กว้างเต็มจอด้านบนอีกต่อไป',
                    code: `<div class="my-shell-v2">
  <sic-sidebar
    [sections]="sidebarSections"
    [collapsed]="shellCollapsedV2"
    [showToggle]="false"
    collapseMode="hidden"
    logo="🐙"
    brand="sic-ng"
    [activeLink]="shellActiveLinkV2"
    (itemSelect)="handleShellItemSelectV2($event)"
  />

  <div class="my-shell-v2-main">
    <sic-navbar [sticky]="false" [showSidebarToggle]="true">
      <ng-template sicNavbarHeader let-navbar>
        <!-- ไม่มีโลโก้ตรงนี้แล้ว เพราะย้ายไปอยู่ที่ sidebar (เต็มความสูง) แทน -->
        <button type="button" (click)="shellCollapsedV2 = !shellCollapsedV2">☰</button>
      </ng-template>

      <ng-template sicNavbarRight let-navbar>
        <!-- เหมือน v1 ทุกอย่าง: dark mode toggle + sic-popover แจ้งเตือน + โปรไฟล์ -->
        <div class="my-shell-right">
          <button type="button" (click)="shellDarkModeV2 = !shellDarkModeV2">{{ shellDarkModeV2 ? '🌙' : '☀️' }}</button>
          <sic-popover [items]="navbarNotifications" (itemSelect)="handleNavbarNotification($event)">
            <ng-template sicPopoverButton let-popover>
              <button type="button" (click)="popover.toggle()">🔔</button>
            </ng-template>
            <ng-template sicPopoverList let-item>{{ item.message }}</ng-template>
          </sic-popover>
          <div class="my-shell-profile">
            <span class="avatar">{{ navbarUser.name.charAt(0) }}</span>
            <span>{{ navbarUser.name }}</span>
          </div>
        </div>
      </ng-template>
    </sic-navbar>

    <div class="my-shell-content">
      <sic-breadcrumb [items]="shellBreadcrumbItemsV2" separator="/" (itemClick)="handleShellBreadcrumbClickV2($event)" />
    </div>
  </div>
</div>`,
                    tsCode: `// state ชุดของตัวเอง แยกจาก v1 ไม่ให้กระทบกัน แต่ใช้ sidebarSections/navbarUser/navbarNotifications/
// findSidebarPath ร่วมกับ v1 ได้เลยเพราะเป็น data/helper กลางที่ไม่ผูกกับ layout แบบใดแบบหนึ่ง
shellCollapsedV2 = false;
shellActiveLinkV2 = '/home';
shellDarkModeV2 = false;

get shellBreadcrumbItemsV2(): SicBreadcrumbItem[] {
  for (const section of this.sidebarSections) {
    const path = this.findSidebarPath(section.items, this.shellActiveLinkV2, []);
    if (path) {
      return path.map((item, i) => i === path.length - 1 ? { label: item.label } : { label: item.label, link: item.link });
    }
  }
  return [];
}

handleShellItemSelectV2(item: SicSidebarItem): void {
  if (item.link) {
    this.shellActiveLinkV2 = item.link;
  }
}

handleShellBreadcrumbClickV2(item: SicBreadcrumbItem): void {
  if (item.link) {
    this.shellActiveLinkV2 = item.link;
  }
}`,
                    attributes: [
                        {
                            name: '.my-shell-v2 { display: flex }',
                            type: 'CSS',
                            description: 'จุดต่างหลักจาก v1: shell นอกสุดเป็น flex แบบแถว (sidebar เป็น sibling ซ้ายสุด) แทนที่จะเป็นคอลัมน์ (navbar บนสุด แล้วค่อยเป็นแถวของ sidebar+content ข้างล่าง) — sidebar จึงสูงเท่า shell ทั้งก้อนตั้งแต่บนจนล่าง',
                        },
                        {
                            name: 'logo / brand (sidebar)',
                            type: 'string',
                            description: 'ย้ายโลโก้/แบรนด์มาไว้ที่ sidebar แทน navbar เพราะ sidebar อยู่เต็มความสูงแล้ว ที่ว่างด้านบนสุดของ sidebar จึงเหมาะเป็นตำแหน่งโลโก้มากกว่า',
                        },
                        {
                            name: 'sicNavbarHeader (navbar)',
                            type: '<ng-template>',
                            description: 'เหลือแค่ปุ่ม hamburger อย่างเดียว (ไม่มีโลโก้แล้ว) สลับ shellCollapsedV2 ตัวเดียวกับที่ผูกกับ [collapsed] ของ sidebar',
                        },
                        {
                            name: 'sicNavbarRight / sic-popover',
                            type: '<ng-template> / component',
                            description: 'เหมือน v1 ทุกประการ — dark mode toggle, กระดิ่งแจ้งเตือนด้วย sic-popover, รูป/ชื่อโปรไฟล์',
                        },
                    ],
                    events: [
                        { name: 'itemSelect (sidebar)', payload: 'SicSidebarItem', description: 'อัพเดต shellActiveLinkV2 — เหมือน v1 แต่แยก state กัน' },
                        { name: 'itemClick (breadcrumb)', payload: 'SicBreadcrumbItem', description: 'ย้อนกลับไปเมนูแม่ที่คลิกใน breadcrumb' },
                        { name: 'itemSelect (sic-popover)', payload: 'SicNavbarNotification', description: 'ส่งต่อไป handleNavbarNotification เดิม (แสดง toast)' },
                    ],
                },
                {
                    id: 'sic-tabs',
                    selector: 'sic-tabs',
                    title: 'Tabs',
                    category: 'Navigation',
                    description: 'สลับเนื้อหาด้วย tab id',
                    code: `<sic-tabs
  [tabs]="tabs"
  [activeId]="activeTabId"
  (activeIdChange)="activeTabId = $event"
/>`,
                    tsCode: `tabs: SicTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
];
activeTabId = 'overview';`,
                    attributes: [
                        { name: 'tabs', type: 'SicTab[]', description: 'รายการ tab เช่น id และ label' },
                        { name: 'activeId', type: 'string', description: 'id ของ tab ที่ active อยู่' },
                    ],
                    events: [
                        { name: 'activeIdChange', payload: 'string', description: 'ส่ง id ของ tab ใหม่เมื่อผู้ใช้เปลี่ยน tab' },
                    ],
                },
                {
                    id: 'sic-stepper',
                    selector: 'sic-stepper',
                    title: 'Stepper',
                    category: 'Navigation',
                    description: 'ตัวชี้ขั้นตอนแบบ wizard ปรับได้ทั้งแนวนอน (horizontal, ค่าเริ่มต้น) และแนวตั้ง (vertical) ผ่าน [orientation] มีปุ่ม Previous/Skip/Next/Finish ในตัว (Skip โผล่เฉพาะขั้นที่ optional=true, Finish แทนที่ Next เมื่อถึงขั้นสุดท้าย) คลิกที่หัวข้อขั้นตอนเพื่อกระโดดไปตรงๆ ได้เลย (เว้นแต่ตั้ง disabled) — เนื้อหาของแต่ละขั้นไม่มี UI ในตัว (เหมือน sic-tabs) ต้องใส่เองผ่าน ng-content แล้ว @switch (activeIndex) เอง',
                    code: `<sic-stepper
  [steps]="wizardSteps"
  [(activeIndex)]="wizardStep"
  orientation="horizontal"
  (skip)="onWizardSkip($event)"
  (finish)="onWizardFinish()"
>
  @switch (wizardStep) {
    @case (0) { <p>กรอกบัญชีผู้ใช้...</p> }
    @case (1) { <p>กรอกโปรไฟล์ (ข้ามได้)...</p> }
    @case (2) { <p>ยืนยันข้อมูล...</p> }
  }
</sic-stepper>`,
                    tsCode: `wizardSteps: SicStepperStep[] = [
  { label: 'Account' },
  { label: 'Profile', description: 'รูปโปรไฟล์และข้อมูลเพิ่มเติม', optional: true },
  { label: 'Confirm' },
];
wizardStep = 0;

onWizardSkip(skippedIndex: number): void {
  this.toasts.show(\`ข้ามขั้นตอน: \${this.wizardSteps[skippedIndex].label}\`, 'info');
}

onWizardFinish(): void {
  this.toasts.show('เสร็จสิ้น wizard', 'success');
}`,
                    attributes: [
                        { name: 'steps', type: 'SicStepperStep[]', default: '[]', description: 'รายการขั้นตอน — { label, description?, optional?, disabled? }' },
                        { name: 'activeIndex', type: 'number', default: '0', description: 'ขั้นตอนปัจจุบัน (bindable ด้วย [(activeIndex)])' },
                        { name: 'orientation', type: `'horizontal' | 'vertical'`, default: `'horizontal'`, description: 'แนวการวางหัวข้อขั้นตอน — vertical จะวางหัวข้อเป็นคอลัมน์ทางซ้าย เนื้อหาอยู่ทางขวา' },
                        { name: 'showNav', type: 'boolean', default: 'true', description: 'ซ่อนแถบปุ่ม Previous/Skip/Next/Finish ในตัว ถ้าต้องการควบคุมเองผ่าน goTo()/goToPrevious()/goToNext()/skipStep()/finishStepper()' },
                    ],
                    events: [
                        { name: 'activeIndexChange', payload: 'number', description: 'เกิดทุกครั้งที่ขั้นตอนเปลี่ยน ไม่ว่าจะจาก Previous/Next/Skip หรือคลิกหัวข้อขั้นตอนตรงๆ' },
                        { name: 'skip', payload: 'number', description: 'เกิดเฉพาะตอนกดปุ่ม Skip (นอกเหนือจาก activeIndexChange) ส่ง index ของขั้นที่ถูกข้าม' },
                        { name: 'finish', payload: '-', description: 'เกิดตอนกดปุ่ม Finish ที่ขั้นตอนสุดท้าย — ไม่เปลี่ยน activeIndex เอง' },
                    ],
                },
                {
                    id: 'sic-timeline',
                    selector: 'sic-timeline',
                    title: 'Timeline',
                    category: 'Navigation',
                    description: 'เส้นเวลาแบบ vertical (ค่าเริ่มต้น) หรือ horizontal ผ่าน [orientation] — [alternate] (true เป็นค่าเริ่มต้น) สลับข้อความซ้าย/ขวา (หรือบน/ล่างถ้าเป็นแนวนอน) สลับกันไปตามแนวเส้น เหมือนภาพ "ประวัติบริษัท" ทั่วไป ปิด alternate แล้วใช้ [side] เพื่อให้ข้อความอยู่ทางเดียวตลอดแทน (เส้น/วงกลมจะขยับไปติดข้อความฝั่งนั้นให้เอง) แต่ละรายการปรับ template เองได้เต็มที่ผ่าน #itemTemplate ถ้าไม่ใส่จะใช้ default (วันที่/หัวข้อ/รายละเอียด)',
                    code: `<sic-timeline [items]="companyHistory" orientation="vertical" [alternate]="true">
  <ng-template #itemTemplate let-item let-index="index">
    <span class="my-timeline-tag" [style.background]="item.color">{{ item.title }}</span>
    <div class="my-timeline-date">{{ item.date }}</div>
    <p>{{ item.description }}</p>
  </ng-template>
</sic-timeline>

<!-- ทางเดียว: ปิด alternate แล้วเลือกฝั่งด้วย side -->
<sic-timeline [items]="companyHistory" [alternate]="false" side="end" />`,
                    tsCode: `companyHistory: SicTimelineItem[] = [
  { title: 'Foundation', date: '2020', description: 'Foundation of the company by a group of visionary entrepreneurs.', color: '#f59e0b' },
  { title: 'First product', date: '2021', description: 'Launch of its first product, a revolutionary software for project management.', color: '#ec4899' },
  { title: 'Expansion', date: '2022', description: 'International expansion with the opening of eight new branches.', color: '#3b82f6' },
  { title: 'Market leader', date: '2023', description: 'Acquisition of a competing company, consolidating itself as a market leader.', color: '#f59e0b' },
];`,
                    attributes: [
                        { name: 'items', type: 'SicTimelineItem[]', default: '[]', description: 'รายการเหตุการณ์ — { title?, date?, description?, color?, icon? }' },
                        { name: 'orientation', type: `'horizontal' | 'vertical'`, default: `'vertical'`, description: 'แนวเส้นเวลา' },
                        { name: 'alternate', type: 'boolean', default: 'true', description: 'สลับข้อความไปมาคนละฝั่งของเส้นตามลำดับรายการ — ปิดเพื่อให้ทุกรายการอยู่ฝั่งเดียวกันหมด' },
                        { name: 'side', type: `'start' | 'end'`, default: `'start'`, description: 'ฝั่งที่รายการแรก (index 0) เริ่มแสดง — ถ้า alternate=true รายการถัดไปจะสลับฝั่งจากนี้ไปเรื่อยๆ, ถ้า alternate=false ทุกรายการจะอยู่ฝั่งนี้ตลอด (เส้น/วงกลมขยับไปติดข้อความให้เอง)' },
                        {
                            name: '#itemTemplate',
                            type: 'content slot',
                            description: 'ปรับแต่ง UI ของแต่ละรายการเอง รับ let-item, let-index, let-side — ไม่ใส่จะ fallback เป็น date/title/description ให้อัตโนมัติ',
                        },
                    ],
                    events: [],
                },
            ],
        },
        {
            id: 'layout-general',
            title: 'Layout & General',
            description: 'จัดวาง layout และ action พื้นฐาน',
            components: [
                {
                    id: 'sic-grid',
                    selector: 'sic-grid',
                    title: 'Grid',
                    category: 'Layout',
                    description: 'จัด layout แบบ responsive grid',
                    code: `<sic-grid [cols]="12" gap="1rem" [colsBreakpoints]="{ sm: 12, md: 6, lg: 4 }">
  <div>Column A</div>
  <div>Column B</div>
  <div>Column C</div>
</sic-grid>`,
                    attributes: [
                        { name: 'cols', type: 'number', default: '12', description: 'จำนวน column หลักของ grid' },
                        { name: 'gap', type: 'string', default: '1rem', description: 'ระยะห่างระหว่าง item' },
                        { name: 'colsBreakpoints', type: 'Record<string, number>', description: 'จำนวน column ตาม breakpoint เช่น sm, md, lg' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-flex',
                    selector: 'sic-flex',
                    title: 'Flex',
                    category: 'Layout',
                    description: 'จัดวาง item แบบ flex row/column',
                    code: `<sic-flex direction="row" gap="0.75rem" align="center" wrap="wrap">
  <sic-button>Primary</sic-button>
  <sic-button variant="outline">Secondary</sic-button>
</sic-flex>`,
                    attributes: [
                        { name: 'direction', type: `'row' | 'column' | 'row-reverse' | 'column-reverse'`, default: 'row', description: 'ทิศทางการเรียง item' },
                        { name: 'gap', type: 'string', default: '0', description: 'ระยะห่างระหว่าง item' },
                        {
                            name: 'align',
                            type: `'start' | 'center' | 'end' | 'stretch' | 'baseline'`,
                            default: 'stretch',
                            description: 'align-items — รับทั้ง keyword ของ sic-flex เอง (start/end/...) และค่า CSS ตรงตัว (flex-start/flex-end) ก็ได้',
                        },
                        {
                            name: 'justify',
                            type: `'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'`,
                            default: 'start',
                            description: 'justify-content — รับทั้ง keyword ของ sic-flex เอง (between/around/evenly/...) และค่า CSS ตรงตัว (space-between/flex-start/...) ก็ได้',
                        },
                        { name: 'wrap', type: `'nowrap' | 'wrap' | 'wrap-reverse'`, default: 'nowrap', description: 'กำหนดการตัดบรรทัด' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-card',
                    selector: 'sic-card',
                    title: 'Card',
                    category: 'General',
                    description: 'กล่องเนื้อหาแบบมีหัวข้อและ footer slot',
                    code: `<sic-card title="Order #1024" [bordered]="true" [elevated]="true">
  <p>Order body content goes here.</p>
  <div sicCardFooter>
    <sic-button variant="ghost">Cancel</sic-button>
    <sic-button variant="solid" color="primary">Confirm</sic-button>
  </div>
</sic-card>`,
                    attributes: [
                        { name: 'title', type: 'string', description: 'หัวข้อของ card' },
                        { name: 'bordered', type: 'boolean', default: 'false', description: 'แสดงเส้นขอบ card' },
                        { name: 'elevated', type: 'boolean', default: 'false', description: 'เพิ่มเงาให้ card' },
                        { name: 'sicCardFooter', type: 'content slot', description: 'พื้นที่ footer ของ card' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-card-stack',
                    selector: 'sic-card-stack',
                    title: 'Card Stack',
                    category: 'General',
                    description: 'กองการ์ดซ้อนทับกัน — เอา cursor ไปชี้ (hover) การ์ดจะกางออกเป็นแฟน คลิกการ์ดที่อยู่ด้านหลังจะสลับมาเป็นใบหน้าสุดพร้อม animation (การ์ดคงตัวตน DOM เดิมผ่าน trackBy ด้วย id ทำให้ transition ลื่นไม่กระตุก) ปรับ [expanded] เพื่อบังคับกางออกเอง (ไม่ต้องพึ่ง hover) และปรับแต่ง UI การ์ดเองได้เต็มที่ผ่าน #cardTemplate',
                    code: `<sic-card-stack [items]="destinations" (activeIndexChange)="onCardStackActive($event)">
  <ng-template #cardTemplate let-item let-position="position">
    <div class="my-stack-card">
      <img [src]="item.imageUrl" />
      <h4>{{ item.title }}</h4>
      <span>ตำแหน่ง: {{ position }}</span>
    </div>
  </ng-template>
</sic-card-stack>

<!-- ไม่ใส่ #cardTemplate ก็ใช้ card เริ่มต้นได้เลย (title/description/location/label/meta) -->
<sic-card-stack [items]="destinations" />`,
                    tsCode: `import { SicCardStackItem } from 'sic-ng';

destinations: SicCardStackItem[] = [
  { id: 1, label: '01', meta: '6 min read', title: 'Coastal path', description: 'Salt air along the chalk cliffs.', location: 'West shore', imageUrl: 'https://picsum.photos/seed/coast/400/300' },
  { id: 2, label: '02', meta: '4 min read', title: 'Desert wind', description: 'Wide skies over red sand.', location: 'Painted flats', imageUrl: 'https://picsum.photos/seed/desert/400/300' },
  { id: 3, label: '03', meta: '8 min read', title: 'Mountain rest', description: 'Cool air above the tree line.', location: 'North ridge', imageUrl: 'https://picsum.photos/seed/mountain/400/300' },
];

onCardStackActive(index: number): void {
  this.toasts.show(\`Now in front: \${this.destinations[index].title}\`, 'info');
}`,
                    attributes: [
                        { name: 'items', type: 'SicCardStackItem[]', default: '[]', description: '{ id?, title?, description?, imageUrl?, label?, meta?, location?, data? } — array JSON ธรรมดา' },
                        { name: 'expandOnHover', type: 'boolean', default: 'true', description: 'กางการ์ดออกเป็นแฟนเมื่อ hover ที่กอง' },
                        { name: 'expanded', type: 'boolean | null', default: 'null', description: 'บังคับสถานะกางออก (true/false) แทนการพึ่ง hover — null คือให้ตาม hover ตามปกติ' },
                        {
                            name: '#cardTemplate',
                            type: 'content slot',
                            description: 'ปรับแต่ง UI ของแต่ละการ์ดเอง รับ let-item, let-index="index", let-position="position" (0 = การ์ดหน้าสุด) — ไม่ใส่จะ fallback เป็น card เริ่มต้น',
                        },
                    ],
                    events: [
                        { name: 'activeIndexChange', payload: 'number', description: 'เกิดเมื่อคลิกการ์ดด้านหลังแล้วสลับมาเป็นใบหน้าสุด (ไม่เกิดถ้าคลิกใบที่อยู่หน้าสุดอยู่แล้ว)' },
                        { name: 'cardClick', payload: '{ item: SicCardStackItem; index: number }', description: 'เกิดทุกครั้งที่คลิกการ์ด ไม่ว่าจะอยู่ตำแหน่งไหน' },
                    ],
                },
                {
                    id: 'sic-button',
                    selector: 'sic-button',
                    title: 'Button',
                    category: 'General',
                    description: 'ปุ่ม action หลัก รองรับ variant, color, loading และ disabled',
                    code: `<sic-button variant="solid" color="primary" [loading]="false" (click)="save()">
  Save
</sic-button>`,
                    tsCode: `save(): void {
  // persist changes
}`,
                    attributes: [
                        { name: 'variant', type: `'solid' | 'outline' | 'ghost'`, default: 'solid', description: 'รูปแบบปุ่ม' },
                        { name: 'color', type: `'primary' | 'success' | 'danger' | string`, default: 'primary', description: 'สีของปุ่ม' },
                        { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'sm'`, description: 'ความสูง/font-size ของปุ่ม — default เป็น sm ให้ตรงกับ default ของ sic-input/sic-combobox/ฯลฯ (SicFormControlBase) พอดี ปุ่มกับ input แถวเดียวกันจึงสูงเท่ากันโดยไม่ต้องกำหนด size ให้ตรงกันเอง' },
                        { name: 'loading', type: 'boolean', default: 'false', description: 'แสดงสถานะกำลังโหลด' },
                        { name: 'disabled', type: 'boolean', default: 'false', description: 'ปิดการใช้งานปุ่ม' },
                        { name: 'block', type: 'boolean', default: 'false', description: 'ให้ปุ่มกว้างเต็ม container' },
                        { name: 'type', type: `'button' | 'submit' | 'reset'`, default: 'button', description: 'ชนิดของ HTML button' },
                    ],
                    events: [
                        { name: 'click', payload: 'MouseEvent', description: 'เกิดเมื่อผู้ใช้กดปุ่ม' },
                    ],
                },
                {
                    id: 'sic-button-group',
                    selector: 'sic-button-group',
                    title: 'Button Group',
                    category: 'General',
                    description: 'รวมปุ่มหลายปุ่มให้เป็นกลุ่มเดียว',
                    code: `<sic-button-group [attached]="true" direction="row">
  <sic-button variant="outline">Day</sic-button>
  <sic-button variant="outline">Week</sic-button>
  <sic-button variant="outline">Month</sic-button>
</sic-button-group>`,
                    attributes: [
                        { name: 'attached', type: 'boolean', default: 'false', description: 'ทำให้ปุ่มติดกันเป็นชุดเดียว' },
                        { name: 'direction', type: `'row' | 'column'`, default: 'row', description: 'ทิศทางการเรียงปุ่ม' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-a-link',
                    selector: 'sic-a-link',
                    title: 'A Link',
                    category: 'General',
                    description: '<a> จริง (ไม่ใช่ <button>) แต่หน้าตาเหมือน sic-button เป๊ะๆ — ใช้ CSS ชุดเดียวกัน (variant/color/size) ใช้ตอนต้องการ link semantics จริง เช่น เปิดแท็บใหม่, คลิกขวา "เปิดในแท็บใหม่", href ที่ crawlable ได้',
                    code: `<sic-a-link href="/pricing" variant="solid" color="primary">ดูราคา</sic-a-link>

<!-- external link เปิดแท็บใหม่ — rel="noopener noreferrer" ใส่ให้อัตโนมัติ -->
<sic-a-link href="https://example.com" target="_blank" variant="outline">เว็บไซต์ภายนอก</sic-a-link>

<!-- ดาวน์โหลดไฟล์ -->
<sic-a-link href="/report.pdf" [download]="'report.pdf'" variant="ghost">ดาวน์โหลด PDF</sic-a-link>

<!-- ปิดการใช้งาน — ตัด href ออก, ใส่ aria-disabled, กัน click -->
<sic-a-link href="/pricing" [disabled]="true">ดูราคา</sic-a-link>`,
                    attributes: [
                        { name: 'href', type: 'string', description: 'ปกติเหมือน <a href> — ถ้า disabled จะถูกตัดออกจาก DOM ให้อัตโนมัติ' },
                        { name: 'target', type: `'_blank' | '_self' | '_parent' | '_top'`, description: 'เหมือน <a target>' },
                        { name: 'rel', type: 'string', description: 'ทับค่า default noopener noreferrer ที่ใส่ให้อัตโนมัติเมื่อ target="_blank"' },
                        { name: 'download', type: 'string | boolean', description: 'true = ใส่ attribute download เปล่าๆ, string = ใช้เป็นชื่อไฟล์ที่ดาวน์โหลด' },
                        { name: 'variant', type: `'solid' | 'outline' | 'ghost'`, default: 'solid', description: 'เหมือน sic-button' },
                        { name: 'color', type: `'primary' | 'success' | 'danger' | 'warning'`, default: 'primary', description: 'เหมือน sic-button' },
                        { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'sm'`, description: 'เหมือน sic-button' },
                        { name: 'disabled', type: 'boolean', default: 'false', description: '<a> ไม่มี disabled ในตัว — ตัด href ออก, ใส่ aria-disabled="true"/tabindex="-1", และ preventDefault() ตอนคลิก' },
                        { name: 'block', type: 'boolean', default: 'false', description: 'ให้ link กว้างเต็ม container' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-section',
                    selector: 'sic-section',
                    title: 'Section',
                    category: 'Layout',
                    description: 'ตัวห่อ page section: container กว้างสูงสุด + padding + scroll-margin (สำหรับ anchor link) มาให้ในตัว — ใส่ title/lead ได้ตรงๆ, fullBleed ตัด container ออกสำหรับเนื้อหาเต็มความกว้าง (เช่น hero), bordered เพิ่มเส้นขอบบน (เช่น footer), center จัดกึ่งกลาง content ที่เป็น text',
                    code: `<sic-section id="about" title="เกี่ยวกับเรา" lead="รายละเอียดสั้นๆ ใต้หัวข้อ">
  <p>เนื้อหาของ section...</p>
</sic-section>

<!-- เต็มความกว้าง ไม่มี container/padding — ใช้กับเนื้อหาแบบ hero -->
<sic-section [fullBleed]="true">...</sic-section>

<!-- footer: เส้นขอบบน + จัดกึ่งกลาง content -->
<sic-section [bordered]="true" [center]="true">...</sic-section>`,
                    attributes: [
                        { name: 'title', type: 'string', description: 'แสดงเป็น <h2> เหนือเนื้อหา (ไม่ใส่ก็ไม่แสดง)' },
                        { name: 'lead', type: 'string', description: 'ย่อหน้าอธิบายใต้ title จัดกึ่งกลางเสมอ' },
                        { name: 'fullBleed', type: 'boolean', default: 'false', description: 'ตัด max-width/padding ของ container ออก' },
                        { name: 'bordered', type: 'boolean', default: 'false', description: 'เพิ่มเส้นขอบด้านบน' },
                        { name: 'center', type: 'boolean', default: 'false', description: 'จัดกึ่งกลาง text ของ content ที่ ng-content เข้ามา (ไม่รวม title/lead ซึ่งกึ่งกลางอยู่แล้ว)' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-show',
                    selector: 'sic-show',
                    title: 'Show (Responsive)',
                    category: 'Layout',
                    description: 'แสดง/ซ่อน content ตาม breakpoint ผ่าน component จริง (ไม่ใช่ utility class ที่ต้องจำชื่อเอง) — breakpoint ชุดเดียวกับที่ sic-grid/sic-masonry ใช้ (md: 768px, lg: 1024px) ลองย่อ/ขยายหน้าต่างเบราว์เซอร์เพื่อดูผลของ demo ด้านล่าง',
                    code: `<!-- แสดงตั้งแต่ md (768px) ขึ้นไป -->
<sic-show from="md">
  <nav>...menu links...</nav>
</sic-show>

<!-- แสดงเมื่อจอแคบกว่า md — ใช้คู่กันสลับเป็น hamburger menu -->
<sic-show upTo="md">
  <sic-button variant="outline">☰</sic-button>
</sic-show>`,
                    attributes: [
                        { name: 'from', type: `'md' | 'lg'`, description: 'แสดงตั้งแต่ breakpoint นี้ขึ้นไป (ซ่อนเมื่อจอแคบกว่า)' },
                        { name: 'upTo', type: `'md' | 'lg'`, description: 'แสดงเมื่อจอแคบกว่า breakpoint นี้ (ซ่อนตั้งแต่ breakpoint นี้ขึ้นไป)' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-text',
                    selector: 'sic-text',
                    title: 'Text',
                    category: 'General',
                    description: 'ตัวอักษรเล็กๆ ที่ปรับ size/weight/color ผ่าน input แทนการเขียน custom CSS เอง — ครอบคลุมกรณีที่ใช้บ่อยอย่าง label/value/caption/ข้อความสถานะ',
                    code: `<sic-text size="lg" weight="bold" block="true">หัวข้อย่อย</sic-text>
<sic-text color="muted" block="true">คำอธิบายสีจาง</sic-text>
<sic-text size="sm" weight="bold" color="active" block="true">ป้ายกำกับ</sic-text>
<sic-text color="success" size="sm">บันทึกสำเร็จ</sic-text>
<sic-text eyebrow="true" color="muted" size="sm" block="true">หมวดหมู่</sic-text>`,
                    attributes: [
                        { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, description: 'font-size จาก token' },
                        { name: 'weight', type: `'normal' | 'semibold' | 'bold'`, default: `'normal'`, description: 'font-weight' },
                        { name: 'color', type: `'default' | 'muted' | 'active' | 'success'`, default: `'default'`, description: 'สีข้อความจาก token' },
                        { name: 'block', type: 'boolean', default: 'false', description: 'display: block แทน inline (ปกติ)' },
                        { name: 'eyebrow', type: 'boolean', default: 'false', description: 'สไตล์ caption ตัวพิมพ์ใหญ่ + letter-spacing (เช่น label เหนือหัวข้อ footer)' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-icon-badge',
                    selector: 'sic-icon-badge',
                    title: 'Icon Badge',
                    category: 'General',
                    description: 'badge วงกลม พื้นหลังโทนสี primary อ่อนๆ สำหรับใส่ icon/emoji นำหน้า เช่น แถวข้อมูลติดต่อ (ที่อยู่/โทร/อีเมล)',
                    code: `<sic-icon-badge>📍</sic-icon-badge>
<sic-icon-badge>📞</sic-icon-badge>
<sic-icon-badge>✉️</sic-icon-badge>`,
                    attributes: [
                        { name: 'content (ng-content)', type: 'content slot', description: 'icon/emoji ที่จะแสดงตรงกลาง badge' },
                    ],
                    events: [],
                },
            ],
        },
        {
            id: 'forms-inputs',
            title: 'Forms & Inputs',
            description: 'รับข้อมูลจากผู้ใช้',
            components: [
                {
                    id: 'sic-form-data',
                    selector: 'new SicFormData(formGroup, model?)',
                    title: 'SicFormData',
                    category: 'Form Utility',
                    description: 'ห่อ FormGroup ธรรมดาด้วย EF-Core-style change tracking (SicEntityState: Added/Unchanged/Modified/Deleted/Detached) — เดา Added/Unchanged อัตโนมัติจากว่ามีการส่ง model (พารามิเตอร์ที่ 2) เข้ามาหรือไม่ (ส่งมา = แถวที่โหลดมาแล้ว เริ่มที่ Unchanged, ไม่ส่ง = แถวใหม่ เริ่มที่ Added) เติม FormControl ชื่อ state ให้ formGroup อัตโนมัติถ้ายังไม่มี ลองพิมพ์ในช่องด้านล่างแล้วดู state/isChanged เปลี่ยนตาม หรือกดปุ่มต่างๆ ดู',
                    code: `<form [formGroup]="contactData.formGroup">
  <sic-input label="ชื่อ" formControlName="name" />
</form>

<p>state: {{ contactData.state }}</p>
<p>isChanged: {{ contactData.isChanged }}</p>

<sic-button (click)="contactData.delete()">ลบแถวนี้</sic-button>
<sic-button (click)="contactData.restore()">ยกเลิกการแก้ไข (กลับ baseline)</sic-button>
<sic-button (click)="contactData.reset()">ล้างข้อมูล</sic-button>
<sic-button (click)="contactData.markAsPristine()">บันทึกสำเร็จแล้ว (re-baseline)</sic-button>`,
                    tsCode: `import { FormBuilder } from '@angular/forms';
import { SicFormData } from 'sic-ng';

interface ContactModel {
  name: string;
}

export class MyComponent {
  private readonly fb = inject(FormBuilder);

  // ส่ง model (พารามิเตอร์ที่ 2) เข้ามา = แถวที่โหลดมาแล้ว → เริ่มที่ Unchanged
  readonly contactForm = this.fb.group({ name: this.fb.control('Ada', Validators.required) });
  readonly contactData = new SicFormData<ContactModel>(this.contactForm, { name: 'Ada' });

  // ไม่ส่ง model = แถวใหม่ (blank row) → เริ่มที่ Added เสมอ ไม่ว่าจะแก้ค่าอะไรก็ยังเป็น Added
  readonly newRowForm = this.fb.group({ name: this.fb.control('', Validators.required) });
  readonly newRowData = new SicFormData<ContactModel>(this.newRowForm);

  save(): void {
    // บันทึกสำเร็จแล้ว: reset dirty ของ Angular + re-baseline ค่าที่ใช้เทียบ "เปลี่ยนแปลงหรือยัง"
    // เป็นค่าที่เพิ่งบันทึกไป (ไม่ใช่ค่าตอนสร้าง SicFormData ครั้งแรก)
    this.contactData.markAsPristine();
  }
}`,
                    attributes: [
                        { name: 'formGroup', type: 'FormGroup', description: 'พารามิเตอร์ที่ 1 (constructor) — FormGroup ที่จะถูกห่อ เติม FormControl ชื่อ state ให้อัตโนมัติถ้ายังไม่มีอยู่แล้ว' },
                        { name: 'model', type: 'TModel (optional)', description: 'พารามิเตอร์ที่ 2 (constructor) — ส่งมา = ถือว่าเป็นแถวที่โหลดมาแล้ว (เริ่มที่ Unchanged), ไม่ส่ง = แถวใหม่ (เริ่มที่ Added เสมอ ไม่ว่าจะแก้ไขยังไง)' },
                        { name: 'state', type: 'SicEntityState', description: `getter — 'added' | 'unchanged' | 'modified' | 'deleted' | 'detached' ปัจจุบัน` },
                        { name: 'isChanged / isNotChanged', type: 'boolean', description: 'isChanged = added/modified/deleted, isNotChanged = unchanged/detached — ใช้เช็คก่อน save หรือก่อนออกจากหน้า (คู่กับ sicCanDeactivateGuard)' },
                        { name: 'value', type: 'TModel', description: 'ค่าปัจจุบันของ form รวม state เข้าไปด้วย เฉพาะตอนที่ TModel เองมี field state ประกาศไว้เท่านั้น (เช่น แถวใน editable grid ที่ต้องส่ง state ไปกับ payload ตอน bulk-save)' },
                        { name: 'invalid / valid', type: 'boolean', description: 'เหมือน formGroup.invalid/valid แต่แถวที่ Deleted จะไม่ถูกนับว่า invalid (validator ของแถวที่กำลังจะถูกลบไม่ควรบล็อกการ save)' },
                        { name: 'dirty', type: 'boolean', description: 'เหมือน formGroup.dirty ตรงๆ' },
                        { name: 'delete()', type: 'method', description: 'ตั้ง state เป็น Deleted — ไม่ได้ลบ control ออกจาก formGroup จริง แค่ mark ไว้ว่าจะลบตอน save' },
                        { name: 'restore()', type: 'method', description: 'ยกเลิกการแก้ไขที่ยังไม่บันทึก โดย patch ค่า formGroup กลับไปเป็น baseline ล่าสุด (ค่าตอนสร้าง หรือค่าที่ markAsPristine() ไว้ล่าสุด) แล้วคำนวณ state ใหม่ — ใช้ยกเลิก delete() ได้ด้วยในตัว ยกเว้นแถวที่ยังเป็น Added (แถวใหม่ที่ยังไม่เคยบันทึก) จะยังคงเป็น Added ต่อไปแม้ค่าจะถูกล้างกลับไปว่างแล้ว' },
                        { name: 'reset()', type: 'method', description: 'ล้างทุก control กลับเป็นค่า default ของตัวเอง (เหมือน formGroup.reset()) แล้วปล่อยให้ state คำนวณใหม่ตามปกติจากการเปลี่ยนค่านั้น' },
                        { name: 'markAsPristine()', type: 'method', description: 'เรียกหลัง save สำเร็จ — reset dirty ของ Angular และ re-baseline ทั้งค่าที่ใช้เทียบ "เปลี่ยนแปลงหรือยัง" และเป้าหมายของ restore() ให้เป็นค่าที่เพิ่งบันทึกไป' },
                        { name: 'markAllAsTouched()', type: 'method', description: 'proxy ไปที่ formGroup.markAllAsTouched() ตรงๆ' },
                        { name: 'destroy()', type: 'method', description: 'ยกเลิก subscription ภายใน (ที่ sync state จาก formGroup.valueChanges) — เรียกตอน component/row นี้ถูกทำลาย' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-form-combine',
                    selector: 'sicFormCombine(sources)',
                    title: 'SicFormData + SicGridPanel Combine',
                    category: 'Form Utility',
                    description: 'ฟังก์ชันรวมหลาย SicFormData/SicGridPanel เป็นตัวเดียว (ตัวอย่างด้านล่างใช้ 1 form + 2 sic-gridpanel พร้อมกัน — รองรับ gridpanel ได้มากกว่า 1 ตัว ไม่จำกัดแค่ตัวเดียว) เรียก markAllAsTouched()/valid/invalid/restore()/reset() ตัวเดียว แล้วมันจะ proxy ไปทุก source ให้เอง พร้อม .value ที่รวมเป็น object เดียวตาม key ที่ตั้งไว้ ลองแก้ชื่อให้ว่างหรือลบชื่อสินค้าในตารางแล้วกด "รวมข้อมูล" ดู valid จะเป็น false หรือกด restore()/reset() ดูค่าที่กรอกไว้ถูกยกเลิก',
                    code: `<form [formGroup]="contactData.formGroup">
  <sic-input label="ชื่อ" formControlName="name" />
</form>

<sic-gridpanel
  #itemsGrid
  [config]="itemsConfig"
  (loadData)="handleItemsLoad($event, itemsGrid)"
/>

<!-- gridpanel ตัวที่ 2 ในหน้าเดียวกัน — sicFormCombine รองรับหลาย gridpanel พร้อมกันได้ -->
<sic-gridpanel
  #extrasGrid
  [config]="extrasConfig"
  (loadData)="handleExtrasLoad($event, extrasGrid)"
/>

<sic-button (click)="submit(itemsGrid, extrasGrid)">บันทึก</sic-button>
<sic-button (click)="cancel(itemsGrid, extrasGrid)">ยกเลิกการแก้ไข</sic-button>`,
                    tsCode: `import { SicFormData, sicFormCombine, SicGridPanelComponent, SicGridPanelConfig, SicGridLoadRequest, SicGridRowData } from 'sic-ng';

interface ContactModel {
  name: string;
}

export class MyComponent {
  readonly contactForm = this.fb.group({ name: this.fb.control('Ada', Validators.required) });
  readonly contactData = new SicFormData<ContactModel>(this.contactForm, { name: 'Ada' });

  itemsConfig: SicGridPanelConfig = {
    id: 'id',
    lazy: false,
    column: [
      { label: 'สินค้า', name: 'name', type: 'text', editable: true, validators: [Validators.required] },
      { label: 'จำนวน', name: 'qty', type: 'number', editable: true, validators: [Validators.required] },
    ],
  };
  private itemsSourceRows: SicGridRowData[] = [{ id: 1, name: 'เมาส์', qty: 2 }];

  extrasConfig: SicGridPanelConfig = {
    id: 'id',
    lazy: false,
    column: [
      { label: 'บริการเสริม', name: 'name', type: 'text', editable: true, validators: [Validators.required] },
      { label: 'ราคา', name: 'price', type: 'number', editable: true, validators: [Validators.required] },
    ],
  };
  private extrasSourceRows: SicGridRowData[] = [{ id: 1, name: 'ประกันสินค้า', price: 199 }];

  handleItemsLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows(this.itemsSourceRows, { totalElements: this.itemsSourceRows.length }, request.requestId);
  }

  handleExtrasLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    grid.setRows(this.extrasSourceRows, { totalElements: this.extrasSourceRows.length }, request.requestId);
  }

  // #itemsGrid / #extrasGrid ในเทมเพลตคือ instance ของ <sic-gridpanel> เอง — ส่งเข้า sicFormCombine ได้ตรงๆ
  // ใส่ key เพิ่มได้เรื่อยๆ ตามจำนวน gridpanel ที่มีในหน้า ไม่จำกัดแค่ตัวเดียว
  submit(itemsGrid: SicGridPanelComponent, extrasGrid: SicGridPanelComponent): void {
    const combined = sicFormCombine({
      contact: this.contactData, // SicFormData → ได้ .value
      items: itemsGrid,          // SicGridPanelComponent → ได้แถวที่เปลี่ยนแปลง (new/updated/deleted)
      extras: extrasGrid,        // gridpanel ตัวที่ 2 — ใช้ key อะไรก็ได้ตามต้องการ
    });

    combined.markAllAsTouched(); // touch ทุก source ให้ error field/row ที่ invalid แสดงขึ้นมา
    if (combined.invalid) {
      return;
    }

    this.api.submit(combined.value); // { contact: {...}, items: [...], extras: [...] }
  }

  cancel(itemsGrid: SicGridPanelComponent, extrasGrid: SicGridPanelComponent): void {
    // ยกเลิกการแก้ไขทั้ง form และทุกแถวในทุก grid กลับไปเป็นค่าล่าสุดที่บันทึกไว้ ในคำสั่งเดียว
    sicFormCombine({ contact: this.contactData, items: itemsGrid, extras: extrasGrid }).restore();
  }
}`,
                    attributes: [
                        { name: 'sources', type: 'Record<string, SicFormData | SicGridPanelComponent>', description: 'key อะไรก็ได้ที่อยากให้ปรากฏใน JSON ผลลัพธ์ → SicFormData หรือ instance ของ <sic-gridpanel> (ผ่าน template reference variable เช่น #itemsGrid)' },
                        { name: 'valid / invalid', type: 'boolean', description: 'getter อ่านค่าสด — true/false ตาม valid/invalid ของทุก source รวมกัน (SicFormData.invalid, sic-gridpanel.invalid ตัวใหม่ที่เช็คแถวที่เปลี่ยนแปลง)' },
                        { name: 'value', type: 'TValue', description: 'getter อ่านค่าสด — object เดียว 1 key ต่อ 1 source: SicFormData ให้ .value ตรงๆ, sic-gridpanel ให้ array ของแถวที่เปลี่ยนแปลง (new/updated/deleted) รูปแบบเดียวกับ payload ของ (saveData) ผ่าน getChangedRowsPayload()' },
                        { name: 'markAllAsTouched()', type: 'method', description: 'proxy ไปเรียก markAllAsTouched() ของทุก source — เรียกก่อนเช็ค valid/invalid เพื่อให้ error ของ field/แถวที่ invalid ขึ้นแสดงจริง' },
                        { name: 'restore()', type: 'method', description: 'proxy ไปเรียก restore() ของทุก source — ยกเลิกการแก้ไขที่ยังไม่บันทึกกลับไปเป็น baseline ล่าสุด ทั้ง form และทุกแถวใน grid ในคำสั่งเดียว' },
                        { name: 'reset()', type: 'method', description: 'proxy ไปเรียก reset() ของทุก source — ล้างทุกอย่างกลับไปว่าง/pristine (SicFormData เคลียร์ค่ากลับ default, sic-gridpanel ล้างการเปลี่ยนแปลงทั้งหมดรวมถึงแถวใหม่)' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-input',
                    selector: 'sic-input',
                    title: 'Input',
                    category: 'Form',
                    description: 'input text ทั่วไป ใช้กับ ngModel หรือ Reactive Forms ได้',
                    code: `<sic-input
  name="email"
  label="Email"
  placeholder="you@example.com"
  [(ngModel)]="email"
/>`,
                    tsCode: `email = '';`,
                    attributes: [
                        { name: 'name', type: 'string', description: 'ชื่อ control เมื่อใช้กับ template-driven forms' },
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'placeholder', type: 'string', description: 'ข้อความ placeholder' },
                        { name: 'ngModel / formControlName', type: 'string', description: 'ผูกค่ากับ form control' },
                        { name: 'errorMessages', type: 'Record<string, string>', description: 'ข้อความ error แยกตาม validator key' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'string', description: 'ส่งค่าใหม่เมื่อ input เปลี่ยน' },
                    ],
                },
                {
                    id: 'sic-input-password',
                    selector: 'sic-input-password',
                    title: 'Password Input',
                    category: 'Form',
                    description: 'input สำหรับรหัสผ่าน',
                    code: `<sic-input-password
  name="password"
  label="Password"
  [(ngModel)]="password"
/>`,
                    tsCode: `password = '';`,
                    attributes: [
                        { name: 'name', type: 'string', description: 'ชื่อ control' },
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'ngModel / formControlName', type: 'string', description: 'ผูกค่ารหัสผ่านกับ form' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'string', description: 'ส่งค่า password ใหม่' },
                    ],
                },
                {
                    id: 'sic-input-number',
                    selector: 'sic-input-number',
                    title: 'Number Input',
                    category: 'Form',
                    description: 'input สำหรับตัวเลข พร้อม min/max, จัดชิดขวาเป็นค่าเริ่มต้น, ปรับทศนิยมและตัวคั่นหลักพันได้',
                    code: `<sic-input-number name="age" label="Age" [min]="0" [max]="120" [(ngModel)]="age" />

<sic-input-number
  label="Price"
  [decimals]="2"
  thousandSeparator=","
  suffix="THB"
  [(ngModel)]="price"
/>`,
                    tsCode: `age: number | null = 25;
price: number | null = 1234.5;`,
                    attributes: [
                        { name: 'min', type: 'number', description: 'ค่าต่ำสุดที่อนุญาต' },
                        { name: 'max', type: 'number', description: 'ค่าสูงสุดที่อนุญาต' },
                        { name: 'align', type: `'left' | 'center' | 'right'`, default: 'right', description: 'การจัดตำแหน่งข้อความในช่อง' },
                        { name: 'decimals', type: 'number', default: '2', description: 'จำนวนตำแหน่งทศนิยมที่ปัดและแสดงผล' },
                        { name: 'thousandSeparator', type: 'string', default: ',', description: 'ตัวคั่นหลักพัน เปลี่ยนได้ เช่น "." หรือช่องว่าง' },
                        { name: 'decimalSeparator', type: 'string', default: '.', description: 'ตัวคั่นทศนิยม เปลี่ยนได้ เช่น "," สำหรับรูปแบบยุโรป' },
                        { name: 'prefix', type: 'string', description: 'ข้อความนำหน้าค่า เช่น "$"' },
                        { name: 'suffix', type: 'string', description: 'ข้อความต่อท้ายค่า เช่น "THB"' },
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'ngModel / formControlName', type: 'number | null', description: 'ผูกค่าตัวเลขกับ form (ค่าจริง ไม่ใช่ข้อความที่ format แล้ว)' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'number | null', description: 'ส่งค่าตัวเลขใหม่' },
                    ],
                },
                {
                    id: 'sic-input-area',
                    selector: 'sic-input-area',
                    title: 'Textarea',
                    category: 'Form',
                    description: 'textarea สำหรับข้อความหลายบรรทัด',
                    code: `<sic-input-area
  name="bio"
  label="Bio"
  [rows]="4"
  [autoResize]="true"
  [(ngModel)]="bio"
/>`,
                    tsCode: `bio = '';`,
                    attributes: [
                        { name: 'rows', type: 'number', default: '3', description: 'จำนวนแถวเริ่มต้น' },
                        { name: 'autoResize', type: 'boolean', default: 'false', description: 'ปรับความสูงอัตโนมัติเมื่อพิมพ์' },
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'ngModel / formControlName', type: 'string', description: 'ผูกค่าข้อความกับ form' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'string', description: 'ส่งข้อความใหม่' },
                    ],
                },
                {
                    id: 'sic-input-comment',
                    selector: 'sic-input-comment',
                    title: 'Comment Input',
                    category: 'Form',
                    description: 'ทรงเดียวกับ Textarea แต่รองรับ @mention (ยิงไป API ผ่าน mentionSearch เพื่อสร้าง option ให้เลือก, highlight สีเมื่อพิมพ์) และ #hashtag (จบด้วย spacebar, highlight สีเช่นกัน) และแนบไฟล์/รูปพร้อม preview — mention จะถูกเก็บในค่า text เป็น @id หรือ @username (ไม่ใช่ชื่อที่แสดง) ใช้ resolveMentionDisplay() แปลงกลับเป็นชื่อตอนแสดงผลคอมเมนต์ที่โพสต์แล้ว — เปิด/ปิดแต่ละความสามารถแยกกันได้ผ่าน enableMentions / enableHashtags / enableUpload',
                    code: `<sic-input-comment
  label="Comment"
  placeholder="พิมพ์ข้อความ, @ เพื่อกล่าวถึง, # เพื่อแท็กหัวข้อ..."
  [mentionSearch]="searchMentions"
  [maxSizeMb]="5"
  [(ngModel)]="comment"
  (mentionClick)="onMentionClick($event)"
  (hashtagClick)="onHashtagClick($event)"
  (filesChange)="onCommentFilesChange($event)"
/>`,
                    tsCode: `comment = '';

// เรียก API จริงของคุณเองตรงนี้ — คืนค่าเป็น array ตรง ๆ, Promise, หรือ Observable ก็ได้
// ใส่ username (ถ้ามี) ไม่งั้นจะเก็บเป็น @<id> แทน
searchMentions = (query: string): Promise<SicCommentMentionOption[]> => {
  return this.http
    .get<SicCommentMentionOption[]>('/api/users/mentions', { params: { q: query } })
    .toPromise();
};

onMentionClick(option: SicCommentMentionOption): void {
  // option.label คือชื่อที่แสดงตอนเลือก — แต่ค่าที่เก็บใน comment จริง ๆ
  // จะเป็น "@" + (option.username ?? option.id)
  this.toasts.show(\`Mentioned \${option.label}\`, 'info');
}

onHashtagClick(tag: string): void {
  this.toasts.show(\`Tagged #\${tag}\`, 'info');
}

onCommentFilesChange(files: File[]): void {
  console.log('attached files', files);
}

// ตอนแสดงคอมเมนต์ที่โพสต์แล้วที่อื่นในแอป (ไม่ใช่ในกล่องพิมพ์) แปลง @id/@username กลับเป็นชื่อ:
displayComment(raw: string): string {
  return resolveMentionDisplay(raw, (usernameOrId) => this.userDirectory.get(usernameOrId)?.name);
}`,
                    attributes: [
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'rows', type: 'number', default: '4', description: 'จำนวนแถวเริ่มต้น' },
                        { name: 'autoResize', type: 'boolean', default: 'false', description: 'ปรับความสูงอัตโนมัติเมื่อพิมพ์' },
                        { name: 'enableMentions', type: 'boolean', default: 'true', description: 'เปิด/ปิดการกล่าวถึงด้วย @ (highlight สีเมื่อพิมพ์เสมอถ้าเปิดใช้)' },
                        {
                            name: 'mentionSearch',
                            type: '(query: string) => SicCommentMentionOption[] | Promise<SicCommentMentionOption[]> | Observable<SicCommentMentionOption[]>',
                            description: 'ฟังก์ชันที่เรียกทุกครั้งที่พิมพ์ตามหลัง @ — ควรยิง API ของคุณเองแล้วคืน option ให้เลือก แต่ละ option คือ { id, label, username? }',
                        },
                        { name: 'enableHashtags', type: 'boolean', default: 'true', description: 'เปิด/ปิดการแท็กหัวข้อด้วย # (จบด้วยการเว้นวรรค, highlight สีเมื่อพิมพ์)' },
                        { name: 'enableUpload', type: 'boolean', default: 'true', description: 'เปิด/ปิดปุ่มแนบไฟล์/รูปภาพ' },
                        { name: 'accept', type: 'string', default: `'image/*'`, description: 'ชนิดไฟล์ที่เลือกได้จาก picker' },
                        { name: 'multiple', type: 'boolean', default: 'true', description: 'แนบได้หลายไฟล์พร้อมกัน' },
                        { name: 'maxSizeMb', type: 'number', default: '10', description: 'ขนาดไฟล์สูงสุดต่อไฟล์ (MB) เกินจะถูก reject' },
                        { name: 'files', type: 'File[]', default: '[]', description: 'ไฟล์ที่แนบอยู่ (ผูกแบบ [(files)] ได้)' },
                        {
                            name: 'ngModel / formControlName',
                            type: 'string',
                            description: 'ข้อความคอมเมนต์ (ไม่รวมไฟล์แนบ) — mention ที่เลือกจะถูกเก็บเป็น "@" + (option.username ?? option.id) ไม่ใช่ชื่อที่แสดง (option.label)',
                        },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'string', description: 'ส่งข้อความคอมเมนต์ใหม่' },
                        { name: 'mentionClick', payload: 'SicCommentMentionOption', description: 'เกิดเมื่อเลือก mention จากรายการ' },
                        { name: 'hashtagClick', payload: 'string', description: 'เกิดเมื่อพิมพ์ #หัวข้อ จบด้วยการเว้นวรรค (ส่งข้อความหัวข้อไม่รวม #)' },
                        { name: 'filesChange', payload: 'File[]', description: 'เกิดเมื่อรายการไฟล์ที่แนบเปลี่ยน (เพิ่ม/ลบ)' },
                        { name: 'rejected', payload: 'File[]', description: 'เกิดเมื่อมีไฟล์เกิน maxSizeMb ถูกปฏิเสธ' },
                    ],
                },
                {
                    id: 'sic-input-comment-resolve-mention',
                    selector: 'resolveMentionDisplay(text, resolve)',
                    title: 'Comment Input — แสดงชื่อจาก @id/@username',
                    category: 'Form',
                    description: 'sic-input-comment เก็บ mention เป็น @id หรือ @username เท่านั้น (ไม่ใช่ชื่อที่แสดง) เพื่อให้ค่าที่บันทึกไม่พังเมื่อคนเปลี่ยนชื่อภายหลัง — เวลาจะแสดงคอมเมนต์ที่โพสต์แล้ว (เช่น หน้ารายการคอมเมนต์) ใช้ resolveMentionDisplay() แปลงกลับเป็นชื่อจริงผ่าน lookup ของคุณเอง',
                    code: `import { resolveMentionDisplay } from 'sic-ng';

const raw = 'ยินดีด้วย @ada_lovelace กับ @42 เลย!'; // เก็บไว้ตอน submit
const userDirectory = new Map([
  ['ada_lovelace', 'Ada Lovelace'],
  ['42', 'Grace Hopper'],
]);

const displayText = resolveMentionDisplay(raw, (usernameOrId) => userDirectory.get(usernameOrId));
// -> "ยินดีด้วย @Ada Lovelace กับ @Grace Hopper เลย!"
// ถ้า resolver คืน undefined (เช่น user ถูกลบไปแล้ว) token เดิมจะไม่ถูกแตะต้อง`,
                    codeLabel: 'component.ts',
                    codeLang: 'typescript',
                    attributes: [
                        { name: 'text', type: 'string', description: 'ข้อความดิบที่ได้จาก sic-input-comment (มี @id/@username ฝังอยู่)' },
                        {
                            name: 'resolve',
                            type: '(usernameOrId: string) => string | undefined',
                            description: 'lookup ของคุณเอง (เช่น Map หรือเรียก service) คืนชื่อที่จะแสดงแทน หรือ undefined เพื่อคงข้อความเดิมไว้',
                        },
                    ],
                    events: [],
                },
                {
                    id: 'sic-input-phone',
                    selector: 'sic-input-phone',
                    title: 'Phone Input',
                    category: 'Form',
                    description: 'input สำหรับเบอร์โทรศัพท์',
                    code: `<sic-input-phone
  name="phone"
  label="Phone"
  [(ngModel)]="phone"
/>`,
                    tsCode: `phone = '';`,
                    attributes: [
                        { name: 'name', type: 'string', description: 'ชื่อ control' },
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'ngModel / formControlName', type: 'string', description: 'ผูกค่าเบอร์โทรกับ form' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'string', description: 'ส่งเบอร์โทรใหม่' },
                    ],
                },
                {
                    id: 'sic-input-tag',
                    selector: 'sic-input-tag',
                    title: 'Input Tag',
                    category: 'Form',
                    description: 'พิมพ์แล้วกด/พิมพ์เครื่องหมายคั่นที่ระบุ (ค่าเริ่มต้น ",") เพื่อสร้าง tag ใหม่เรื่อย ๆ — ค่าที่ ngModel ได้รับเป็น string เดียวที่รวม tag ทั้งหมดด้วยเครื่องหมายคั่นนั้น เช่น "ขนม,ไทย,นำเข้า" กำหนดความยาวสูงสุดต่อ tag, จำนวน tag สูงสุด, และสีของ tag (tagColor) ได้',
                    code: `<sic-input-tag
  label="Keywords"
  placeholder="พิมพ์แล้วคั่นด้วย ,"
  [maxTagLength]="20"
  [maxTags]="5"
  tagColor="primary"
  [(ngModel)]="keywords"
/>`,
                    tsCode: `keywords = 'ขนม,ไทย,นำเข้า';`,
                    attributes: [
                        { name: 'delimiter', type: 'string', default: `','`, description: 'ตัวคั่นที่จบ tag ขณะพิมพ์ และใช้ join tag ทั้งหมดเป็น string ตอนส่งออก' },
                        { name: 'placeholder', type: 'string', default: `'Add tag...'`, description: 'ข้อความ placeholder เมื่อยังไม่มี tag' },
                        { name: 'maxTagLength', type: 'number', description: 'ความยาวสูงสุดของแต่ละ tag (ตัดข้อความส่วนเกินทิ้ง)' },
                        { name: 'maxTags', type: 'number', description: 'จำนวน tag สูงสุดที่เพิ่มได้ ครบแล้วช่อง input จะถูกปิด' },
                        {
                            name: 'tagColor',
                            type: `'primary' | 'success' | 'danger' | 'warning' | 'neutral'`,
                            default: 'neutral',
                            description: 'สีของ tag ทุกอันที่แสดง (ใช้ค่าสีเดียวกับ sic-tag)',
                        },
                        {
                            name: 'ngModel / formControlName',
                            type: 'string',
                            description: 'string เดียวที่รวม tag ทั้งหมดด้วย delimiter เช่น "ขนม,ไทย,นำเข้า" (ค่าว่างถ้าไม่มี tag)',
                        },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'string', description: 'ส่ง string ของ tag ทั้งหมดใหม่ทุกครั้งที่เพิ่ม/ลบ tag' },
                    ],
                },
                {
                    id: 'sic-combobox',
                    selector: 'sic-combobox',
                    title: 'Combobox',
                    category: 'Form',
                    description: 'เลือกข้อมูลจากรายการ options พิมพ์กรองในช่องเดียวกับที่แสดงผล ใช้ลูกศรขึ้น/ลง และ Enter เลือกได้',
                    code: `<sic-combobox
  label="Assignee"
  [options]="people"
  optionLabel="name"
  placeholder="Select a person…"
  [(ngModel)]="selectedPerson"
/>`,
                    tsCode: `interface Person {
  name: string;
  role: string;
}

selectedPerson: Person | null = null;
people: Person[] = [
  { name: 'Alice', role: 'Engineer' },
  { name: 'Bob', role: 'Designer' },
  { name: 'Carol', role: 'Product Manager' },
];`,
                    attributes: [
                        { name: 'options', type: 'unknown[]', description: 'รายการตัวเลือก (ใช้เฉพาะตอน isPaging = false, กรองฝั่งหน้าบ้าน)' },
                        { name: 'optionLabel', type: 'string', description: 'field ที่ใช้แสดงเป็น label' },
                        { name: 'optionValue', type: 'string', description: 'field ที่ใช้เป็น value ของ formControl (default: ทั้ง object)' },
                        { name: 'placeholder', type: 'string', description: 'ข้อความ placeholder' },
                        { name: 'multi', type: 'boolean', description: 'เลือกได้หลายค่า' },
                        { name: 'searchable', type: 'boolean', description: 'พิมพ์กรองรายการได้ในช่อง input เดียวกับที่แสดงผล' },
                        { name: 'isPaging', type: 'boolean', description: 'เปิดโหมด infinite scroll — โหลดข้อมูลผ่าน event search เท่านั้น ไม่ต้องผูก [options]' },
                        { name: 'pageSize', type: 'number', description: 'จำนวนแถวต่อหน้าเมื่อ isPaging = true (default 10)' },
                        { name: 'clearable', type: 'boolean', default: 'true', description: 'แสดงปุ่ม clear (×) ชิดขวาเมื่อมีค่าที่เลือกอยู่' },
                        { name: 'ngModel / formControlName', type: 'unknown', description: 'ค่าที่เลือกอยู่ (ผลลัพธ์จาก optionValue)' },
                        {
                            name: '#optionTemplate',
                            type: 'ng-template',
                            description: 'ng-template ที่ใส่ไว้ข้างใน <sic-combobox> เพื่อ custom หน้าตาแต่ละ option, context: { $implicit: option, selected, active }',
                        },
                        {
                            name: '#displayTemplate',
                            type: 'ng-template',
                            description: 'ng-template สำหรับ custom หน้าตาตอนปิด dropdown (ค่าที่เลือกไว้), context: { $implicit: selectedOptions[], multi } — ถ้าไม่ใส่จะ fallback เป็น label ธรรมดาในช่อง input',
                        },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'unknown', description: 'ส่งค่าที่เลือกใหม่' },
                        {
                            name: 'search',
                            payload: '{ keyword?, value?, pageNo, pageSize, options: { update(items) } }',
                            description: 'ยิงเมื่อ isPaging = true ในสามกรณี: พิมพ์ค้นหา (keyword, pageNo 1), เลื่อนโหลดหน้าถัดไป (keyword, pageNo เพิ่มขึ้น), หรือ resolve label จากค่าที่ set เข้า formControl (value, pageNo 1, pageSize 1) — เรียก api แล้วเรียก e.options.update(items) ด้วยรายการที่ได้ ไม่ต้องจัดการ append/replace เอง',
                        },
                    ],
                },
                {
                    id: 'sic-checkbox',
                    selector: 'sic-checkbox',
                    title: 'Checkbox',
                    category: 'Form',
                    description: 'ตัวเลือกแบบ true/false',
                    code: `<sic-checkbox
  label="I agree to the terms"
  [(ngModel)]="agree"
/>`,
                    tsCode: `agree = false;`,
                    attributes: [
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'ngModel / formControlName', type: 'boolean', description: 'สถานะ checked' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'boolean', description: 'ส่งค่า checked ใหม่' },
                    ],
                },
                {
                    id: 'sic-radio',
                    selector: 'sic-radio',
                    title: 'Radio',
                    category: 'Form',
                    description: 'ตัวเลือกแบบเลือกได้หนึ่งค่าในกลุ่มเดียวกัน วางทีละตัวเองก็ได้ หรือส่ง [options] เข้าไปให้ loop สร้างทั้งกลุ่มในตัวเดียว พร้อมเลือกจัดวางแนวตั้ง/แนวนอนได้',
                    code: `<!-- วางเองทีละตัว -->
<sic-radio name="notify" label="Email" radioValue="email" [(ngModel)]="notifyBy" />
<sic-radio name="notify" label="SMS" radioValue="sms" [(ngModel)]="notifyBy" />

<!-- ส่ง options เข้าไปให้ loop ทั้งกลุ่ม -->
<sic-radio
  label="Shipping method"
  [options]="shippingOptions"
  direction="row"
  [(ngModel)]="shippingMethod"
/>`,
                    tsCode: `notifyBy: 'email' | 'sms' = 'email';

shippingMethod = 'standard';
shippingOptions: SicRadioOption[] = [
  { value: 'standard', name: 'Standard (3-5 days)' },
  { value: 'express', name: 'Express (1-2 days)' },
  { value: 'pickup', name: 'Store pickup' },
];`,
                    attributes: [
                        { name: 'name', type: 'string', description: 'ชื่อกลุ่ม radio (เมื่อใช้ [options] จะ generate ให้อัตโนมัติ)' },
                        { name: 'label', type: 'string', description: 'ข้อความ label ของ radio ตัวเดียว หรือหัวข้อของกลุ่มเมื่อใช้ [options]' },
                        { name: 'radioValue', type: 'unknown', description: 'ค่าของ radio ตัวนี้ (โหมดวางทีละตัว)' },
                        {
                            name: 'options',
                            type: '{ value: unknown; name: string }[]',
                            description: 'รายการตัวเลือกให้ component loop สร้าง radio ทั้งกลุ่มในตัวเดียว',
                        },
                        { name: 'direction', type: `'row' | 'column'`, default: 'column', description: 'ทิศทางการจัดวางตัวเลือกเมื่อใช้ [options] (row = แนวนอน, column = แนวตั้ง)' },
                        { name: 'ngModel / formControlName', type: 'unknown', description: 'ค่าที่เลือกอยู่' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'unknown', description: 'ส่งค่าที่เลือกใหม่' },
                    ],
                },
                {
                    id: 'sic-switch',
                    selector: 'sic-switch',
                    title: 'Switch',
                    category: 'Form',
                    description: 'toggle เปิด/ปิด',
                    code: `<sic-switch
  label="Dark mode"
  [(ngModel)]="darkMode"
/>`,
                    tsCode: `darkMode = false;`,
                    attributes: [
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'ngModel / formControlName', type: 'boolean', description: 'สถานะเปิด/ปิด' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'boolean', description: 'ส่งสถานะใหม่' },
                    ],
                },
                {
                    id: 'sic-range',
                    selector: 'sic-range',
                    title: 'Range',
                    category: 'Form',
                    description: 'slider สำหรับเลือกค่าหรือช่วงค่า',
                    code: `<sic-range label="Volume" [min]="0" [max]="100" [(ngModel)]="volumeRange" />
<sic-range label="Price range" [min]="0" [max]="100" [dual]="true" [(ngModel)]="priceRange" />`,
                    tsCode: `volumeRange = 50;
priceRange: [number, number] = [20, 80];`,
                    attributes: [
                        { name: 'min', type: 'number', default: '0', description: 'ค่าต่ำสุด' },
                        { name: 'max', type: 'number', default: '100', description: 'ค่าสูงสุด' },
                        { name: 'dual', type: 'boolean', default: 'false', description: 'เปิดโหมดเลือกช่วงค่า 2 ค่า' },
                        { name: 'ngModel / formControlName', type: 'number | [number, number]', description: 'ค่าที่เลือก' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'number | [number, number]', description: 'ส่งค่าใหม่ของ slider' },
                    ],
                },
                {
                    id: 'sic-datepicker',
                    selector: 'sic-datepicker',
                    title: 'Datepicker',
                    category: 'Form',
                    description: 'เลือกวันที่ ใช้ dayjs เป็น core, ปรับ พ.ศ./ค.ศ., locale ของเดือน/วัน, รูปแบบที่แสดงในช่อง และ mode (day/month/year) ได้ พร้อมเลื่อนด้วยลูกศรและกด Enter เพื่อเลือก',
                    code: `<!-- ค่าเริ่มต้น: ค.ศ., อังกฤษ, dd/MM/yyyy -->
<sic-datepicker label="Birthday" outputType="string" [(ngModel)]="birthday" />

<!-- พ.ศ. + ภาษาไทย + กำหนดรูปแบบเอง (ต้อง import 'dayjs/locale/th' เอง) -->
<sic-datepicker
  label="Event date"
  era="BE"
  locale="th"
  format="EEEE d MMMM yyyy"
  [(ngModel)]="eventDate"
/>

<!-- mode="month" ข้าม day grid ไปเลือกแค่เดือน -->
<sic-datepicker label="Billing month" mode="month" format="MMMM yyyy" [(ngModel)]="billingMonth" />`,
                    tsCode: `// ต้อง import ก่อนใช้ locale ที่ไม่ใช่ 'en'
import 'dayjs/locale/th';

birthday = '';
eventDate: string | null = null;
billingMonth: string | null = null;`,
                    attributes: [
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'outputType', type: `'string' | 'date'`, default: 'string', description: 'ชนิดข้อมูลที่ส่งออก (string จะเป็น ISO yyyy-MM-dd เสมอ ไม่ขึ้นกับ format)' },
                        { name: 'format', type: 'string', default: 'dd/MM/yyyy', description: 'รูปแบบที่แสดงในช่อง รองรับ token: yyyy, yy, MMMM, MMM, MM, M, dd, d, EEEE, EEE' },
                        { name: 'era', type: `'BE' | 'CE'`, default: 'CE', description: 'ปีที่แสดงเป็น พ.ศ. (BE) หรือ ค.ศ. (CE) ค่าที่เก็บ/ส่งออกยังเป็นปีจริงเสมอ' },
                        { name: 'locale', type: 'string', default: 'en', description: 'ภาษาไว้แสดงชื่อเดือน/วัน ต้อง import "dayjs/locale/<code>" เองก่อนใช้ ไม่งั้น fallback เป็นอังกฤษ' },
                        { name: 'mode', type: `'day' | 'month' | 'year'`, default: 'day', description: 'ระดับการเลือก month/year จะข้าม grid ที่ละเอียดกว่าไปเลย' },
                        { name: 'weekStartsOn', type: '0 | 1', default: '0', description: 'วันเริ่มต้นของสัปดาห์ 0 = Sunday, 1 = Monday' },
                        { name: 'min', type: 'Date | string', description: 'วันที่ต่ำสุดที่เลือกได้ (Date จริง หรือ ISO string)' },
                        { name: 'max', type: 'Date | string', description: 'วันที่สูงสุดที่เลือกได้ (Date จริง หรือ ISO string)' },
                        { name: 'clearable', type: 'boolean', default: 'true', description: 'แสดงปุ่ม clear (×) ชิดขวาเมื่อมีวันที่เลือกอยู่' },
                        { name: 'ngModel / formControlName', type: 'string | Date | null', description: 'ค่าของวันที่' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'string | Date | null', description: 'ส่งวันที่ใหม่' },
                    ],
                },
                {
                    id: 'sic-timepicker',
                    selector: 'sic-timepicker',
                    title: 'Timepicker',
                    category: 'Form',
                    description: 'เลือกเวลาแบบนาฬิกา 24 ชั่วโมง เป็นกล่องลอยเหมือน datepicker เลื่อนซ้าย/ขวาสลับชั่วโมง/นาที เลื่อนขึ้น/ลงปรับค่า Enter เพื่อเลือก และเปิด/ปิดอัตโนมัติตาม focus ค่าที่เก็บ/ส่งออกเป็น Date เต็ม (เหมือน sic-datepicker) จึงใช้ formcontrol ตัวเดียวกับ sic-datepicker ร่วมกันได้ — ถ้ายังไม่มีค่ามาก่อนจะใส่วันที่ปัจจุบันให้อัตโนมัติ ถ้ามีค่าอยู่แล้วจะอัปเดตแค่เวลา วันที่เดิมไม่เปลี่ยน',
                    code: `<sic-timepicker label="Meeting time" [(ngModel)]="meetingTime" />

<!-- จำกัดช่วงเวลาที่เลือกได้ ด้วย datetime จริง (เทียบเฉพาะเวลา บนวันที่ของค่าปัจจุบัน/วันนี้) -->
<sic-timepicker
  label="Support window"
  [min]="supportWindowStart"
  [max]="supportWindowEnd"
  [(ngModel)]="supportTime"
/>`,
                    tsCode: `meetingTime: Date | null = null;
supportTime: Date | null = null;
supportWindowStart = new Date(new Date().setHours(9, 30, 0, 0));
supportWindowEnd = new Date(new Date().setHours(17, 0, 0, 0));`,
                    attributes: [
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'min', type: 'Date | string', description: 'ขอบล่างของเวลาที่เลือกได้ (Date จริง) เทียบเฉพาะเวลา บนวันที่ของค่าปัจจุบัน/วันนี้' },
                        { name: 'max', type: 'Date | string', description: 'ขอบบนของเวลาที่เลือกได้ (Date จริง) เทียบเฉพาะเวลา บนวันที่ของค่าปัจจุบัน/วันนี้' },
                        { name: 'placeholder', type: 'string', default: 'Select time', description: 'ข้อความเมื่อยังไม่ได้เลือกเวลา' },
                        { name: 'clearable', type: 'boolean', default: 'true', description: 'แสดงปุ่ม clear (×) ชิดขวาเมื่อมีเวลาที่เลือกอยู่' },
                        {
                            name: 'ngModel / formControlName',
                            type: 'Date | null',
                            description: 'ค่าเวลาเป็น Date เต็ม (ไม่ใช่แค่ string "HH:mm" อีกต่อไป) — ถ้าก่อนหน้าเป็น null จะใส่วันที่วันนี้ให้, ถ้ามีอยู่แล้วจะแก้แค่ชั่วโมง/นาที วันที่เดิมไม่เปลี่ยน จึงใช้ formcontrol เดียวกับ sic-datepicker ประกบกันได้ (ดูตัวอย่าง "Datepicker + Timepicker ร่วมกัน")',
                        },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'Date | null', description: 'ส่งเวลาใหม่ (เป็น Date เต็ม)' },
                    ],
                },
                {
                    id: 'sic-datepicker-timepicker-combo',
                    selector: 'sic-datepicker + sic-timepicker',
                    title: 'Datepicker + Timepicker ร่วมกัน',
                    category: 'Form',
                    description: 'ใช้ sic-datepicker คู่กับ sic-timepicker บน FormControl ตัวเดียวกัน (ผูกด้วย [formControl] ทั้งคู่, ต้องตั้ง outputType="date" ที่ datepicker) เพื่อแยกกล่อง "วันที่" กับ "เวลา" ของ datetime เดียวกัน — datepicker แก้ปี/เดือน/วัน, timepicker แก้ชั่วโมง/นาที ของ Date object เดียวกัน แล้วอีกกล่องเห็นการเปลี่ยนแปลงทันที พร้อมตัวอย่าง min ผูกกับเวลาเริ่ม เพื่อกันไม่ให้เลือกวัน/เวลาสิ้นสุดก่อนวัน/เวลาเริ่ม',
                    code: `<sic-grid [cols]="1" gap="1rem" [colsBreakpoints]="{ sm: 1, md: 2, lg: 4 }">
  <sic-datepicker label="วันที่เริ่มดำเนินการ" outputType="date" [formControl]="startDateTime" />
  <sic-timepicker label="เวลาเริ่มดำเนินการ" [formControl]="startDateTime" />

  <!-- min ผูกกับค่าเริ่ม กันไม่ให้เลือกวัน/เวลาสิ้นสุดย้อนก่อนวัน/เวลาเริ่ม -->
  <sic-datepicker label="วันที่สิ้นสุด" outputType="date" [min]="startDateTime.value" [formControl]="endDateTime" />
  <sic-timepicker label="เวลาสิ้นสุด" [min]="startDateTime.value" [formControl]="endDateTime" />
</sic-grid>`,
                    tsCode: `startDateTime = new FormControl<Date | null>(null);
endDateTime = new FormControl<Date | null>(null);`,
                    attributes: [
                        {
                            name: 'formControl',
                            type: 'FormControl<Date | null>',
                            description: 'FormControl เดียวกันผูกทั้ง sic-datepicker และ sic-timepicker — datepicker แก้ไขแค่ปี/เดือน/วัน, timepicker แก้ไขแค่ชั่วโมง/นาที ของ Date object เดียวกัน ทั้งสองกล่อง sync กันอัตโนมัติไม่ว่าจะแก้จากฝั่งไหน',
                        },
                        { name: 'outputType (datepicker)', type: `'date'`, description: 'ต้องกำหนดเป็น "date" ไม่ใช่ "string" ค่าเริ่มต้น เพื่อให้ผลลัพธ์เป็น Date object ที่ timepicker แก้ต่อได้' },
                        { name: 'min (ทั้งคู่)', type: 'Date | string', description: 'ตัวอย่างนี้ผูก min ของกล่องวันที่/เวลาสิ้นสุดไว้กับค่าปัจจุบันของ startDateTime เพื่อบังคับว่าห้ามสิ้นสุดก่อนเริ่ม' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-colorpicker',
                    selector: 'sic-colorpicker',
                    title: 'Colorpicker',
                    category: 'Form',
                    description: 'เลือกสี พร้อมตัวเลือกให้พิมพ์ค่าสีเองได้',
                    code: `<sic-colorpicker
  label="Brand color"
  [allowText]="true"
  [(ngModel)]="brandColor"
/>`,
                    tsCode: `brandColor: string | null = '#2563eb';`,
                    attributes: [
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'allowText', type: 'boolean', default: 'false', description: 'อนุญาตให้พิมพ์ค่าสีเอง' },
                        { name: 'clearable', type: 'boolean', default: 'true', description: 'แสดงปุ่ม clear (×) ชิดขวาเมื่อมีค่าสีอยู่ (เคลียร์แล้วค่าจะเป็น null)' },
                        { name: 'ngModel / formControlName', type: 'string | null', description: 'ค่าสี เช่น #2563eb (null เมื่อยังไม่ได้เลือก/ถูก clear)' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'string', description: 'ส่งค่าสีใหม่' },
                    ],
                },
                {
                    id: 'sic-upload',
                    selector: 'sic-upload',
                    title: 'Upload',
                    category: 'Form',
                    description: 'เลือกไฟล์จากเครื่องผู้ใช้',
                    code: `<sic-upload
  label="Attachments"
  [multiple]="true"
  [maxSizeMb]="10"
  [(ngModel)]="files"
/>`,
                    tsCode: `files: File[] = [];`,
                    attributes: [
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'multiple', type: 'boolean', default: 'false', description: 'เลือกหลายไฟล์ได้' },
                        { name: 'maxSizeMb', type: 'number', description: 'ขนาดไฟล์สูงสุดหน่วย MB' },
                        { name: 'ngModel / formControlName', type: 'File[]', description: 'รายการไฟล์ที่เลือก' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'File[]', description: 'ส่งรายการไฟล์ใหม่' },
                    ],
                },
                {
                    id: 'sic-rating',
                    selector: 'sic-rating',
                    title: 'Rating',
                    category: 'Form',
                    description: 'ให้คะแนนแบบดาว รองรับครึ่งคะแนน',
                    code: `<sic-rating
  label="Rate this"
  [max]="5"
  [allowHalf]="true"
  [(ngModel)]="rating"
/>`,
                    tsCode: `rating = 3;`,
                    attributes: [
                        { name: 'label', type: 'string', description: 'ข้อความ label' },
                        { name: 'max', type: 'number', default: '5', description: 'คะแนนสูงสุด' },
                        { name: 'allowHalf', type: 'boolean', default: 'false', description: 'อนุญาตให้เลือกครึ่งคะแนน' },
                        { name: 'ngModel / formControlName', type: 'number', description: 'คะแนนที่เลือก' },
                    ],
                    events: [
                        { name: 'ngModelChange', payload: 'number', description: 'ส่งคะแนนใหม่' },
                    ],
                },
                {
                    id: 'sic-validator',
                    selector: 'Reactive form + SicValidator',
                    title: 'Reactive Form Validation',
                    category: 'Form',
                    description: 'ตัวอย่างการแสดง error message จาก Angular Validators',
                    code: `<form [formGroup]="form" (ngSubmit)="submit()">
  <sic-input
    label="Email"
    formControlName="email"
    [errorMessages]="{ required: 'กรุณากรอกอีเมล', email: 'รูปแบบอีเมลไม่ถูกต้อง' }"
  />
  <sic-button type="submit" [disabled]="form.invalid">Save</sic-button>
</form>`,
                    tsCode: `form: FormGroup;

constructor(private fb: FormBuilder) {
  this.form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
}

submit(): void {
  if (this.form.valid) {
    // ...
  } else {
    this.form.markAllAsTouched();
  }
}`,
                    attributes: [
                        { name: 'formGroup', type: 'FormGroup', description: 'กลุ่ม form ของ Reactive Forms' },
                        { name: 'formControlName', type: 'string', description: 'ชื่อ control ใน FormGroup' },
                        { name: 'errorMessages', type: 'Record<string, string>', description: 'map validator key เป็นข้อความ error' },
                        { name: 'disabled', type: 'boolean', description: 'ปิดปุ่มเมื่อ form invalid' },
                    ],
                    events: [
                        { name: 'ngSubmit', payload: 'SubmitEvent', description: 'เกิดเมื่อ submit form' },
                    ],
                },
            ],
        },
        {
            id: 'display-media',
            title: 'Data Display & Media',
            description: 'แสดงข้อมูล รูปภาพ วิดีโอ และสถานะ',
            components: [
                {
                    id: 'sic-gridpanel',
                    selector: 'sic-gridpanel',
                    title: 'Grid Panel',
                    category: 'Data Display',
                    description: 'ตารางข้อมูลแบบแก้ไขได้ทั้งแถว รองรับ column หลาย type (text/number/date/time/color/combobox/checkbox/radio/switch/button) รวมถึง column type กำหนดเอง (custom) ผ่าน ng-template, กำหนด minWidth ต่อคอลัมน์ได้, sort, เลือกแถว, review การเปลี่ยนแปลง, แถวสรุปท้ายตาราง และคุมการโหลด/บันทึกข้อมูลผ่าน event ทั้งหมด (ไม่ผูกกับ HttpClient ภายใน)',
                    code: `<sic-gridpanel
  #grid
  [config]="gridConfig"
  (loadData)="handleGridLoad($event, grid)"
  (saveData)="handleGridSave($event, grid)"
  (rowAction)="handleGridRowAction($event)"
>
  <!-- custom column: ng-template sicGridPanelTemplate="<column.type>" (หรือ column.name ถ้า type เป็น built-in) -->
  <ng-template sicGridPanelTemplate="statusBadge" section="cell" let-row>
    <span class="status-badge" [class.status-badge--active]="row.active">
      {{ row.active ? 'Active' : 'Inactive' }}
    </span>
  </ng-template>
</sic-gridpanel>`,
                    tsCode: `gridConfig: SicGridPanelConfig = {
  id: 'id',
  defaultSortField: 'name',
  lazy: false, // fetch the whole dataset once, paginate/sort it locally from there
  pageSize: 2,
  pageSizeOptions: [3, 5, 10], // ตัวเลือกใน dropdown "Rows per page" ที่ footer
  // header แถวที่ 2 — group คอลัมน์ที่เกี่ยวข้องกันไว้ด้วยกัน (columns ต้องเรียงติดกัน)
  columnGroups: [
    { label: 'Employee', columns: ['name', 'role'] },
    { label: 'Schedule', columns: ['joinDate', 'startTime'] },
  ],
  column: [
    { label: 'Name', name: 'name', type: 'text', editable: true, sortable: true, minWidth: 160, validators: [Validators.required] },
    {
      label: 'Role',
      name: 'role',
      type: 'combobox',
      editable: true,
      minWidth: 180,
      options: [
        { label: 'Engineer', value: 'Engineer' },
        { label: 'Designer', value: 'Designer' },
        { label: 'Product Manager', value: 'Product Manager' },
      ],
    },
    {
      label: 'Priority',
      name: 'priority',
      type: 'radio',
      editable: true,
      direction: 'row',
      minWidth: 220, // ป้องกันไม่ให้ radio 3 ตัวถูกบีบจนล้น
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    },
    { label: 'Salary', name: 'salary', type: 'number', editable: true, decimals: 0 },
    { label: 'Join date', name: 'joinDate', type: 'date', editable: true, dateFormat: 'dd/MM/yyyy' },
    { label: 'Start time', name: 'startTime', type: 'time', editable: true },
    { label: 'Tag color', name: 'tagColor', type: 'color', editable: true },
    { label: 'Active', name: 'active', type: 'checkbox', editable: true },
    { label: 'Enabled', name: 'enabled', type: 'switch', editable: true },
    { label: 'Status', name: 'status', type: 'statusBadge', align: 'center' }, // custom column — rendered by the projected ng-template below
    { label: 'Detail', name: 'detail', type: 'button', buttonText: 'View' },
  ],
  summaryPage: [
    { column: 'salary', type: 'sum', label: '', decimals: 0 }, // รวมยอดเฉพาะหน้าที่กำลังแสดง
    // custom: นับจำนวนแถวในหน้านี้ แล้วจัดข้อความเอง — ชิดขวา
    { column: 'priority', type: 'custom', align: 'right', calculate: (rows) => rows.length, formatter: (value) => \`รวมหน้านี้ \${value} รายการ\` },
    // custom: ดึงยอด salary มาแสดงใต้คอลัมน์ joinDate แทน (column แค่กำหนด "ตำแหน่งที่แสดง" ไม่จำเป็นต้องตรงกับ field ที่คำนวณ) — ชิดซ้าย
    {
      column: 'joinDate',
      type: 'custom',
      align: 'left',
      calculate: (rows) => rows.reduce((sum, row) => sum + (Number(row['salary']) || 0), 0),
      formatter: (value) => \`\${new Intl.NumberFormat().format(value)} บาท\`,
    },
  ],
  summary: {
    showOn: 'all', // 'all' (default) ทุกหน้า, 'last' แสดงเฉพาะหน้าสุดท้าย
    columns: [
      { column: 'salary', type: 'sum', label: 'รวมทั้งหมด', decimals: 0 }, // รวมยอดทั้ง dataset
      { column: 'priority', type: 'custom', align: 'right', calculate: (rows) => rows.length, formatter: (value) => \`รวมทั้งหมด \${value} รายการ\` },
      {
        column: 'joinDate',
        type: 'custom',
        align: 'left',
        calculate: (rows) => rows.reduce((sum, row) => sum + (Number(row['salary']) || 0), 0),
        formatter: (value) => \`\${new Intl.NumberFormat().format(value)} บาท\`,
      },
    ],
  },
  toolbar: { save: true, add: true, delete: true, review: true }, // ปิดปุ่ม review ได้อิสระ
  // ห้ามเลือกแถวของ Carol ผ่าน checkbox — เช็คจาก rowData ไม่ใช่ rowIndex
  // เพราะ rowIndex คือตำแหน่งในหน้าที่กำลังแสดง (0..pageSize-1) ไม่ใช่ index รวมทั้ง dataset
  disableSelect: (rowIndex, row) => row['name'] === 'Carol',
  // ล็อกฟิลด์ salary ของแถวที่ role เป็น Product Manager ไม่ให้แก้ไข
  disableEdit: (rowIndex, fieldName, value, row) => fieldName === 'salary' && row['role'] === 'Product Manager',
};

private gridSourceRows: SicGridRowData[] = [
  { id: 1, name: 'Alice', role: 'Engineer', priority: 'high', salary: 45000, joinDate: '2023-01-15', startTime: '09:00', tagColor: '#2563eb', active: true, enabled: true },
  { id: 2, name: 'Bob', role: 'Designer', priority: 'medium', salary: 38000, joinDate: '2022-11-02', startTime: '09:30', tagColor: '#16a34a', active: true, enabled: true },
  { id: 3, name: 'Carol', role: 'Product Manager', priority: 'low', salary: 52000, joinDate: '2021-06-20', startTime: '10:00', tagColor: '#f59e0b', active: false, enabled: false },
  { id: 4, name: 'Dave', role: 'Engineer', priority: 'medium', salary: 41000, joinDate: '2023-08-09', startTime: '08:45', tagColor: '#dc2626', active: true, enabled: true },
  { id: 5, name: 'Eve', role: 'Designer', priority: 'low', salary: 39500, joinDate: '2024-02-14', startTime: '09:15', tagColor: '#7c3aed', active: true, enabled: false },
];

handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
  // in a real app, fetch from the server here instead
  setTimeout(() => {
    grid.setRows(this.gridSourceRows, { totalElements: this.gridSourceRows.length }, request.requestId);
  }, 300);
}

handleGridSave(request: SicGridSaveRequest, grid: SicGridPanelComponent): void {
  // in a real app, persist request.rows to the server here instead
  setTimeout(() => {
    grid.setSaveResult(true, 'บันทึกข้อมูลตัวอย่างสำเร็จ', request.requestId);
  }, 300);
}

handleGridRowAction(event: { action: string; row?: SicGridRowData | null }): void {
  if (event.action === 'detail' && event.row) {
    this.toasts.show(\`ดูรายละเอียดของ \${event.row['name']}\`, 'info');
  }
}`,
                    attributes: [
                        { name: 'config', type: 'SicGridPanelConfig', description: 'กำหนด id ของแถว, รายการคอลัมน์ (column) — column.type รองรับ text/area/number/date/time/color/upload/combobox/checkbox/radio/switch/button หรือกำหนด type เองเพื่อ render ด้วย ng-template ที่ใส่ไว้ใน <sic-gridpanel> (ดูตัวอย่าง statusBadge), column.align จัดตำแหน่งแนวนอนของเนื้อหาในเซลล์ (left/center/right — default: right สำหรับ number, ที่เหลือ left) ใช้ได้กับทุก type รวมถึง custom column, column.minWidth กำหนดความกว้างขั้นต่ำต่อคอลัมน์ (px), การ sort เริ่มต้น และ toolbar เพื่อเปิด/ปิดปุ่มบน toolbar แต่ละปุ่มอิสระ (save/add/delete/review) — ทุกปุ่มแสดงเป็นค่าเริ่มต้น' },
                        { name: 'config.summaryPage', type: 'SicGridSummaryConfig[]', description: 'แถวสรุปท้ายตาราง คำนวณจากแถวในหน้าที่กำลังแสดงเท่านั้น — แต่ละ item ระบุ column, type (sum/avg/count/min/max/custom), label, align, decimals (ถ้าไม่ระบุจะใช้ decimals ของ column นั้นแทนสำหรับ column type number), calculate (จำเป็นเมื่อ type เป็น custom) และ formatter' },
                        { name: 'config.summary', type: '{ showOn?: \'all\' | \'last\'; columns: SicGridSummaryConfig[] }', description: 'แถวสรุปยอดรวม "ทั้ง dataset" แสดงต่อจากแถว summaryPage (ถ้ามี) — showOn กำหนดว่าจะแสดงทุกหน้า (default) หรือเฉพาะหน้าสุดท้าย ("last") หมายเหตุ: ในโหมด lazy (default) grid รู้จักแค่ข้อมูลหน้าที่โหลดมาแล้ว ไม่ใช่ dataset เต็มจากฝั่ง server — ถ้าต้องการยอดรวมที่แม่นยำข้ามหน้าให้ใช้ lazy: false' },
                        { name: 'config.selectable', type: 'boolean', description: 'default true — false เพื่อซ่อนคอลัมน์ checkbox เลือกแถวทั้งหมด (header "select all" และทุกแถว) รวมถึงปุ่ม "Delete selected rows" บน toolbar' },
                        { name: 'config.columnGroups', type: '{ label, columns: string[], align? }[]', description: 'ทางเลือก — เพิ่ม header แถวที่ 2 ด้านบน โดยแต่ละ group ครอบคลุมคอลัมน์ตาม column.name ที่ระบุใน columns (ต้องเรียงติดกันใน visible columns) แสดงเป็น label เดียวคร่อมความกว้างของคอลัมน์เหล่านั้น ส่วนคอลัมน์ที่ไม่ได้อยู่ใน group ใดจะ header สูงเต็ม 2 แถวตามปกติ ไม่ระบุ columnGroups เลย จะแสดง header แถวเดียวแบบเดิม' },
                        { name: 'config.pageSizeOptions', type: 'number[]', description: 'ตัวเลือกใน dropdown เปลี่ยนจำนวนแถวต่อหน้าที่ footer default [10, 30, 50] — ถ้า pageSize ปัจจุบันไม่อยู่ใน list จะถูกเพิ่มเข้าไปให้อัตโนมัติเพื่อให้ dropdown เลือกถูกค่า' },
                        { name: 'config.pageSizeSelector', type: 'boolean', description: 'default true — false เพื่อซ่อน dropdown เปลี่ยนจำนวนแถวต่อหน้า (แสดงเมื่อ pageable เปิดอยู่เท่านั้น)' },
                        { name: 'config.showToolbar', type: 'boolean', description: 'default true — false เพื่อซ่อน toolbar ทั้งแถบ (save/add/delete/review) ทับค่า config.toolbar ของแต่ละปุ่มทั้งหมด' },
                        { name: 'config.showFooterBar', type: 'boolean', description: 'default true — false เพื่อซ่อน footer bar ทั้งแถบ (dropdown เปลี่ยนจำนวนแถวต่อหน้า, "รวม N รายการ", ปุ่มเปลี่ยนหน้า) ไม่เกี่ยวกับแถวสรุป summary/summaryPage ซึ่งควบคุมแยกกัน' },
                        { name: 'config.disableRow', type: '(row) => boolean', description: 'คืนค่า true เพื่อปิดทั้งแถว (แก้ไข/ลบ/เลือกไม่ได้ทั้งหมด)' },
                        { name: 'config.disableSelect', type: '(rowIndex, rowData) => boolean', description: 'คืนค่า true เพื่อปิดเฉพาะ checkbox เลือกแถวนั้น โดยไม่กระทบการแก้ไขฟิลด์อื่น — rowIndex คือตำแหน่งของแถวในหน้าที่กำลังแสดงอยู่ (0..pageSize-1) ไม่ใช่ index รวมทั้ง dataset ถ้าต้องการอ้างอิงแถวแบบคงที่ไม่ขึ้นกับหน้า ให้เช็คจาก rowData แทน (เช่น id)' },
                        { name: 'config.disableEdit', type: '(rowIndex, fieldName, data, rowData) => boolean', description: 'ถูกเรียกทุกคอลัมน์ที่ editable ของทุกแถว — คืนค่า true เพื่อล็อกฟิลด์นั้นเป็น readonly (จะคืน true ทุก fieldName ของแถวเดียวกัน ก็ล็อกทั้งแถวได้เช่นกัน) — rowIndex เป็นตำแหน่งในหน้าปัจจุบันเช่นเดียวกับ disableSelect ให้ใช้ rowData เพื่ออ้างอิงแถวที่แน่นอน' },
                    ],
                    events: [
                        { name: 'loadData', payload: 'SicGridLoadRequest', description: 'ขอให้โหลดข้อมูลหน้าใหม่ (page/sort/keyword) — เมื่อโหลดเสร็จให้เรียก grid.setRows(rows, pageable, requestId) หรือ grid.setLoadError(message, requestId)' },
                        { name: 'saveData', payload: 'SicGridSaveRequest', description: 'ขอให้บันทึกแถวที่เปลี่ยนแปลง — เมื่อบันทึกเสร็จให้เรียก grid.setSaveResult(success, message, requestId)' },
                        { name: 'rowsChange', payload: 'SicGridRowData[]', description: 'ค่าปัจจุบันของทุกแถวที่ถูก track (รวม state) เปลี่ยนแปลง' },
                        { name: 'rowAction', payload: '{ action, row, rows, column }', description: 'เกิดจากปุ่มในคอลัมน์ type: button (action = column.name) หรือการ add/save/reset/soft-delete' },
                        { name: 'softDeleteChange', payload: '{ id, deleted, row }', description: 'แถวถูกทำเครื่องหมายลบ/กู้คืน' },
                    ],
                },
                {
                    id: 'sic-calendar',
                    selector: 'sic-calendar',
                    title: 'Calendar',
                    category: 'Data Display',
                    description: 'ปฏิทินเต็มรูปแบบ (full calendar) แยกข้อมูล 2 ส่วน: วันหยุด (badge วงกลมซ้อนกัน คลิกเปิด sidebar) และ task (บรรทัดไอคอน+ข้อความ ล้นแล้วยุบเป็น "ดูเพิ่มเติม") รองรับ grid/list, คลิกที่ชื่อเดือน/ปี (header) เพื่อเลือกเดือน-ปีโดยตรง และสลับ พ.ศ./ค.ศ. ด้วย dayjs (เปิด/ปิดปุ่มสลับได้ผ่าน eraSwitcher)',
                    code: `<sic-calendar
  [weekStartsOn]="1"
  locale="th"
  [tasks]="calendarTasks"
  [holidays]="calendarHolidays"
  [(era)]="calendarEra"
  [(view)]="calendarView"
  (dateClick)="handleCalendarDateClick($event)"
  (eventClick)="handleCalendarEventClick($event)"
  (holidayClick)="handleCalendarHolidayClick($event)"
  (monthChange)="handleCalendarMonthChange($event)"
/>`,
                    tsCode: `// ต้อง import ก่อนใช้ locale ที่ไม่ใช่ 'en' (เหมือน sic-datepicker)
import 'dayjs/locale/th';
import { SicCalendarEra, SicCalendarEvent, SicCalendarHoliday, SicCalendarView } from 'sic-ng';

calendarEra: SicCalendarEra = 'BE';
calendarView: SicCalendarView = 'grid';
calendarTasks: SicCalendarEvent[] = [
  { id: 1, date: new Date(), title: 'ประชุมทีมประจำสัปดาห์', color: '#22c55e', icon: '👥', description: '10:00 - ห้องประชุม A' },
  { id: 2, date: new Date(), title: 'ส่งมอบงานลูกค้า', color: '#f59e0b', icon: '📦' },
];
calendarHolidays: SicCalendarHoliday[] = [
  { id: 1, date: new Date(), title: 'วันหยุดชดเชยบริษัท', source: 'office' },
  { id: 2, date: new Date(), title: 'วันหยุดราชการ', source: 'government' },
];

handleCalendarDateClick(event: { date: Date; tasks: SicCalendarEvent[]; holidays: SicCalendarHoliday[] }): void {
  console.log('คลิกวันที่', event.date, event.tasks.length, 'task', event.holidays.length, 'วันหยุด');
}

handleCalendarEventClick(event: SicCalendarEvent): void {
  console.log('คลิก task', event.title, event.description);
}

handleCalendarHolidayClick(holiday: SicCalendarHoliday): void {
  console.log('คลิกวันหยุด', holiday.title, holiday.source);
}

handleCalendarMonthChange(date: Date): void {
  console.log('เปลี่ยนเดือนไปที่', date);
}`,
                    attributes: [
                        { name: 'selected', type: 'Date | string | null', description: 'วันที่ที่เลือกอยู่ (คลิกวันในปฏิทินเพื่อเปลี่ยน)' },
                        { name: 'weekStartsOn', type: '0 | 1', default: '0', description: 'วันเริ่มต้นของสัปดาห์ 0 = Sunday, 1 = Monday' },
                        { name: 'tasks', type: 'SicCalendarEvent[]', default: '[]', description: '{ id?, date, title, color?, icon?, description? } — แสดงเป็นบรรทัดไอคอน+ข้อความ (ตัดด้วย … ถ้ายาวเกิน 1 บรรทัด) เรียงลงตาม field date ของแต่ละ task ถ้าเกิน maxVisibleTasks บรรทัดสุดท้ายจะยุบเป็น "ดูเพิ่มเติม" เปิด sidebar แสดงรายการทั้งหมด' },
                        { name: 'holidays', type: 'SicCalendarHoliday[]', default: '[]', description: '{ id?, date, title, source?, color?, icon? } — source: \'office\'|\'government\'|\'bank\'|\'other\' กำหนดไอคอน/สี default ให้อัตโนมัติถ้าไม่ระบุ color/icon เอง แสดงเป็น badge วงกลมซ้อนทับกันในแต่ละวัน คลิกเพื่อเปิด sidebar แสดงรายการวันหยุดของวันนั้น' },
                        { name: 'era', type: "'BE' | 'CE'", default: "'CE'", description: 'ปีที่แสดงบน header — BE = พ.ศ. (ค.ศ. + 543), CE = ค.ศ. ค่าที่เก็บ/ส่งออกยังคงเป็นวันที่จริงเสมอ กดปุ่ม พ.ศ./ค.ศ. เพื่อสลับได้ (รองรับ [(era)] two-way binding)' },
                        { name: 'eraSwitcher', type: 'boolean', default: 'true', description: 'false เพื่อซ่อนปุ่มสลับ พ.ศ./ค.ศ. บน toolbar (ยังคงกำหนดปีที่แสดงได้ผ่าน era input ตามปกติ แค่ผู้ใช้กดสลับเองไม่ได้)' },
                        { name: 'view', type: "'grid' | 'list'", default: "'grid'", description: "'grid' = ปฏิทินรายเดือนแบบตาราง, 'list' = agenda แสดงทุกวันในเดือนเรียงจากบนลงล่างพร้อม task การ์ดสี รองรับ [(view)] two-way binding" },
                        { name: 'locale', type: 'string', default: "'en'", description: "dayjs locale สำหรับชื่อเดือน/วัน — ต้อง import 'dayjs/locale/<code>' เองก่อนใช้ locale อื่นนอกจาก 'en'" },
                        { name: 'maxVisibleTasks', type: 'number', default: '3', description: 'จำนวนบรรทัด task สูงสุดต่อวันในมุมมอง grid ก่อนบรรทัดสุดท้ายจะยุบเป็น "ดูเพิ่มเติม (+N)"' },
                    ],
                    events: [
                        { name: 'selectedChange', payload: 'Date', description: 'วันที่ถูกเลือกเปลี่ยน (คลิกวันในปฏิทิน)' },
                        { name: 'dateClick', payload: '{ date: Date; tasks: SicCalendarEvent[]; holidays: SicCalendarHoliday[] }', description: 'คลิกวันที่ใดก็ตาม (นอกพื้นที่ badge วันหยุด/บรรทัด task) พร้อม task และวันหยุดทั้งหมดของวันนั้น' },
                        { name: 'eventClick', payload: 'SicCalendarEvent', description: 'คลิกที่บรรทัด task โดยตรง (ทั้งใน grid/list และในรายการ sidebar) — ใช้เปิดรายละเอียด/แก้ไข task นั้นได้' },
                        { name: 'holidayClick', payload: 'SicCalendarHoliday', description: 'คลิกรายการวันหยุดใน sidebar (เปิด sidebar ก่อนโดยคลิก badge วงกลมซ้อนในวันนั้น)' },
                        { name: 'eraChange', payload: "'BE' | 'CE'", description: 'ผู้ใช้กดปุ่มสลับ พ.ศ./ค.ศ.' },
                        { name: 'viewChange', payload: "'grid' | 'list'", description: 'ผู้ใช้สลับมุมมอง grid/list' },
                        { name: 'monthChange', payload: 'Date', description: 'เดือนที่แสดงเปลี่ยน (กดปุ่มเดือนก่อนหน้า/ถัดไป/Today) — payload คือวันที่ 1 ของเดือนใหม่ ไม่ยิงซ้ำถ้ายังอยู่เดือนเดิม' },
                    ],
                },
                {
                    id: 'sic-calendar-timeline',
                    selector: 'sic-calendar-timeline',
                    title: 'Calendar Timeline',
                    category: 'Data Display',
                    description: 'Gantt-style timeline: กำหนด [startDate]/[endDate] เป็นช่วงที่มองเห็นได้ แสดงเป็นรายวัน/สัปดาห์/เดือนได้ผ่าน [(viewMode)] — สลับได้เองในตัวจากปุ่มที่เปิดเป็น sic-popover (แสดง/ซ่อนได้ด้วย [showViewModeToggle]) แต่ละแถวมี phases (bar) ได้หลายช่วงในแถวเดียว (ไม่ทับกันก็ได้ ทับกันก็ได้) คอลัมน์แรก (ชื่อรายการ) พับ/กางได้ (ปุ่ม ‹/› มุมซ้ายบนของตาราง) ตารางจำกัดความสูงและมี scrollbar ในตัวเมื่อรายการยาว ([maxHeight], ค่าเริ่มต้น 28rem, เลื่อน label column กับ timeline พร้อมกันเสมอ) ใช้ dayjs ทั้งหมด (locale สำหรับชื่อวัน/เดือน ต้อง import เองเหมือน sic-calendar/sic-datepicker) และรองรับ พ.ศ./ค.ศ. ผ่าน [era] ปรับแต่งทั้งคอลัมน์ชื่อรายการ (#labelTemplate) และแถบ timeline (#phaseTemplate) เองได้เต็มที่',
                    code: `<sic-calendar-timeline
  [items]="ganttRows"
  startDate="2020-08-11"
  endDate="2020-08-22"
  [(viewMode)]="ganttViewMode"
  locale="th"
  era="BE"
  maxHeight="24rem"
  [(showLabelColumn)]="ganttShowLabels"
  (rowClick)="onGanttRowClick($event)"
  (phaseClick)="onGanttPhaseClick($event)"
>
  <ng-template #labelTemplate let-row>
    <div class="my-gantt-label">
      <img [src]="row.avatarUrl" class="my-gantt-avatar" />
      <span>{{ row.label }}</span>
    </div>
    <span>{{ row.progress }}%</span>
  </ng-template>

  <ng-template #phaseTemplate let-phase let-row="row">
    <img [src]="phase.avatarUrl" class="my-gantt-avatar" />
    <div>
      <strong>{{ phase.label }}</strong>
      <div>{{ phase.description }}</div>
    </div>
  </ng-template>
</sic-calendar-timeline>`,
                    tsCode: `// ต้อง import ก่อนใช้ locale ที่ไม่ใช่ 'en' (เหมือน sic-calendar/sic-datepicker)
import 'dayjs/locale/th';
import { SicCalendarTimelineRow, SicCalendarTimelineViewMode } from 'sic-ng';

ganttShowLabels = true;
ganttViewMode: SicCalendarTimelineViewMode = 'day';
ganttRows: SicCalendarTimelineRow[] = [
  {
    id: 1,
    label: 'Lorem ipsum 0',
    avatarUrl: 'https://i.pravatar.cc/40?img=1',
    progress: 72,
    phases: [
      { id: 'p1', label: 'John Doe 7', description: 'Lorem ipsum dolor sit amet', start: '2020-08-13', end: '2020-08-14', color: '#94a3b8' },
    ],
  },
  {
    id: 2,
    label: 'Lorem ipsum 1',
    avatarUrl: 'https://i.pravatar.cc/40?img=2',
    progress: 89,
    phases: [
      // แถวเดียวมีได้หลาย phase — ช่วงเวลาไม่จำเป็นต้องต่อกัน
      { id: 'p2', label: 'Planning', start: '2020-08-13', end: '2020-08-13', color: '#f59e0b' },
      { id: 'p3', label: 'John Doe 9', description: 'Lorem ipsum dolor sit amet', start: '2020-08-14', end: '2020-08-22', color: '#22c55e' },
    ],
  },
];

onGanttRowClick(row: SicCalendarTimelineRow): void {
  this.toasts.show(\`เปิดแถว: \${row.label}\`, 'info');
}

onGanttPhaseClick(event: { row: SicCalendarTimelineRow; phase: { label?: string } }): void {
  this.toasts.show(\`เปิด phase: \${event.phase.label}\`, 'info');
}`,
                    attributes: [
                        { name: 'items', type: 'SicCalendarTimelineRow[]', default: '[]', description: '{ id, label, avatarUrl?, progress?, phases, data? } — array JSON ธรรมดา, phases คือ { id?, label?, description?, start, end, color?, avatarUrl? }[] ต่อแถว' },
                        { name: 'startDate / endDate', type: 'Date | string', description: 'ช่วงวันที่ที่มองเห็นได้บนตาราง (บังคับกำหนดทั้งคู่)' },
                        { name: '[(viewMode)]', type: "'day' | 'week' | 'month'", default: "'day'", description: 'ความละเอียดของคอลัมน์เวลา — สลับได้เองจากปุ่มในตัว (sic-popover) หรือควบคุมจากภายนอกด้วย [(viewMode)]' },
                        { name: 'viewModeOptions', type: "('day' | 'week' | 'month')[]", default: "['day', 'week', 'month']", description: 'ตัวเลือกที่แสดงใน popover สลับมุมมอง (กำหนดลำดับ/ตัดตัวเลือกที่ไม่ต้องการออกได้)' },
                        { name: 'showViewModeToggle', type: 'boolean', default: 'true', description: 'แสดง/ซ่อนแถบสลับมุมมอง (View: ...) เหนือตาราง' },
                        { name: 'era', type: "'BE' | 'CE'", default: "SIC_CONFIG.era ?? 'CE'", description: 'ปีที่แสดงบนหัวตาราง (กลุ่มเดือน/ปี) — BE = พ.ศ., CE = ค.ศ.' },
                        { name: 'locale', type: 'string', default: "SIC_CONFIG.locale ?? 'en'", description: "dayjs locale สำหรับชื่อวัน/เดือน — ต้อง import 'dayjs/locale/<code>' เองก่อนใช้ locale อื่นนอกจาก 'en' (เช่น 'th' เพื่อให้ day of week เป็นภาษาไทย)" },
                        { name: 'showLabelColumn', type: 'boolean', default: 'true', description: 'เปิด/ปิดคอลัมน์ชื่อรายการทางซ้าย — พับได้เองผ่านปุ่ม ‹/› ในตัว หรือควบคุมจากภายนอกด้วย [(showLabelColumn)]' },
                        { name: 'maxHeight', type: 'string | null', default: "'28rem'", description: 'จำกัดความสูงของพื้นที่แถว แล้วเลื่อนดูได้ (label column กับ timeline เลื่อนพร้อมกันเสมอ) — ใส่ null เพื่อไม่จำกัดความสูงเหมือนเดิม' },
                        {
                            name: '#labelTemplate',
                            type: 'content slot',
                            description: 'ปรับแต่ง UI คอลัมน์ชื่อรายการเอง รับ let-row, let-index — ไม่ใส่จะ fallback เป็น avatar+ชื่อ+progress',
                        },
                        {
                            name: '#phaseTemplate',
                            type: 'content slot',
                            description: 'ปรับแต่ง UI ของแต่ละ phase bar เอง รับ let-phase, let-row="row", let-index="index" — ไม่ใส่จะ fallback เป็น avatar+label+description',
                        },
                    ],
                    events: [
                        { name: 'viewModeChange', payload: "'day' | 'week' | 'month'", description: 'เกิดเมื่อเลือกมุมมองใหม่จาก popover ในตัว' },
                        { name: 'showLabelColumnChange', payload: 'boolean', description: 'เกิดเมื่อกดปุ่ม ‹/› พับ/กางคอลัมน์ชื่อรายการ' },
                        { name: 'rowClick', payload: 'SicCalendarTimelineRow', description: 'คลิกที่แถวในคอลัมน์ชื่อรายการ' },
                        { name: 'phaseClick', payload: '{ row: SicCalendarTimelineRow; phase: SicCalendarTimelinePhase }', description: 'คลิกที่ bar ของ phase ใดก็ตาม' },
                    ],
                },
                {
                    id: 'sic-code',
                    selector: 'sic-code',
                    title: 'Code',
                    category: 'Data Display',
                    description: 'แสดง code block พร้อม syntax highlighting ในตัว (ไม่พึ่ง library ภายนอก) รองรับ typescript/javascript/html/css/json/bash — สีโทนใกล้เคียงกับธีม Prettier/VSCode ทั่วไป ทั้งโหมดสว่างและมืด แสดง/ซ่อนเลขบรรทัดได้ผ่าน [showLineNumbers] และมีปุ่ม copy ในตัว (คัดลอกโค้ดดิบ ไม่ใช่ HTML ที่ไฮไลต์)',
                    code: `<sic-code
  language="typescript"
  [showLineNumbers]="true"
  [code]="snippet"
/>

<!-- ปิดเลขบรรทัด / ปิดปุ่ม copy ได้อิสระ -->
<sic-code language="bash" [showLineNumbers]="false" [code]="installCmd" />`,
                    tsCode: `snippet = [
  'function greet(name: string): string {',
  '  // returns a friendly greeting',
  "  return 'Hello, ' + name + '!';",
  '}',
].join('\\n');

installCmd = 'npm install sic-ng';`,
                    attributes: [
                        { name: 'code', type: 'string', default: `''`, description: 'source code ที่จะแสดง (ข้อความดิบ ไม่ใช่ HTML)' },
                        { name: 'language', type: "'typescript' | 'javascript' | 'html' | 'css' | 'json' | 'bash' | 'plaintext'", default: `'plaintext'`, description: 'กำหนดกฎ syntax highlighting — plaintext = ไม่ไฮไลต์เลย (แสดง badge ภาษาที่ toolbar เฉพาะเมื่อไม่ใช่ plaintext)' },
                        { name: 'showLineNumbers', type: 'boolean', default: 'true', description: 'แสดง/ซ่อนเลขบรรทัดทางซ้าย' },
                        { name: 'showCopyButton', type: 'boolean', default: 'true', description: 'แสดง/ซ่อนปุ่ม copy ที่มุมขวาบนของ toolbar' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-image',
                    selector: 'sic-image',
                    title: 'Image',
                    category: 'Media',
                    description: 'แสดงรูปภาพพร้อม fallback, กำหนดขนาด, และเลือกโหมดโหลดแบบ sync/async ได้',
                    code: `<sic-image
  src="https://picsum.photos/id/237/400/300"
  alt="Sample"
  fallback="https://picsum.photos/200"
  rounded="md"
  [width]="320"
  [height]="240"
  mode="async"
  asyncStrategy="progressive"
/>`,
                    attributes: [
                        { name: 'src', type: 'string', description: 'URL รูปภาพหลัก' },
                        { name: 'alt', type: 'string', description: 'ข้อความอธิบายรูปภาพ' },
                        { name: 'fallback', type: 'string', description: 'URL สำรองเมื่อโหลดรูปหลักไม่ได้' },
                        { name: 'rounded', type: `'none' | 'sm' | 'md' | 'lg' | 'full'`, default: 'none', description: 'ระดับความโค้งของรูป' },
                        { name: 'width', type: 'number | string', description: 'กำหนดความกว้าง (ตัวเลข = px)' },
                        { name: 'height', type: 'number | string', description: 'กำหนดความสูง (ตัวเลข = px)' },
                        {
                            name: 'mode',
                            type: `'sync' | 'async'`,
                            default: 'sync',
                            description: `'sync' แสดงรูปทันที, 'async' รอโหลดรูปเต็มก่อนค่อยแสดง`,
                        },
                        {
                            name: 'asyncStrategy',
                            type: `'progressive' | 'skeleton'`,
                            default: 'skeleton',
                            description: `ใช้กับ mode="async" เท่านั้น: 'progressive' แสดงรูปหยาบขนาดเล็กก่อนแล้วค่อยสลับเป็นรูปเต็ม, 'skeleton' แสดง placeholder จนกว่าจะโหลดรูปเต็มเสร็จ`,
                        },
                        { name: 'lowResSrc', type: 'string', description: `URL รูปหยาบสำหรับ asyncStrategy="progressive" (ถ้าไม่ระบุจะสร้างจาก src + lowResWidth)` },
                        { name: 'lowResWidth', type: 'number', default: '24', description: 'ความกว้างที่ขอสำหรับรูปหยาบอัตโนมัติ' },
                        { name: 'appendSizeToUrl', type: 'boolean', default: 'true', description: 'แนบ width/height เป็น query param บน URL รูป (สำหรับ CDN ที่ resize ตาม query)' },
                        { name: 'widthParam', type: 'string', default: `'w'`, description: 'ชื่อ query param สำหรับความกว้าง' },
                        { name: 'heightParam', type: 'string', default: `'h'`, description: 'ชื่อ query param สำหรับความสูง' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-image-slider',
                    selector: 'sic-image-slider',
                    title: 'Image Slider',
                    category: 'Media',
                    description: 'สไลด์รูปภาพแบบวน — มีปุ่มลูกศรเลื่อนซ้าย/ขวา ([showArrows], ซ่อนได้) จุดไข่ปลาด้านล่างบอกจำนวน/ตำแหน่งปัจจุบัน ([showDots]) เลื่อนอัตโนมัติได้พร้อมกำหนดเวลาเอง ([autoSlide]/[autoSlideInterval], หยุดชั่วคราวเมื่อ hover) เลื่อนเกินภาพสุดท้ายจะวนกลับมาภาพแรกเสมอ (ปิดได้ด้วย [loop]) และเพิ่ม HTML ทับบนรูปแต่ละใบเองได้ผ่าน #slideTemplate',
                    code: `<sic-image-slider
  [items]="slides"
  [autoSlide]="true"
  [autoSlideInterval]="4000"
  (slideChange)="onSlideChange($event)"
  (slideEnd)="onSlideEnd()"
>
  <ng-template #slideTemplate let-item let-index="index">
    <div class="my-slide-overlay">
      <span>{{ index + 1 }}. {{ item.caption }}</span>
    </div>
  </ng-template>
</sic-image-slider>

<!-- ไม่ใส่ #slideTemplate ก็ใช้ caption เริ่มต้นได้เลย -->
<sic-image-slider [items]="slides" [showArrows]="false" />`,
                    tsCode: `import { SicImageSliderItem } from 'sic-ng';

slides: SicImageSliderItem[] = [
  { id: 1, imageUrl: 'https://picsum.photos/seed/slide1/800/450', caption: 'Coastal path' },
  { id: 2, imageUrl: 'https://picsum.photos/seed/slide2/800/450', caption: 'Desert wind' },
  { id: 3, imageUrl: 'https://picsum.photos/seed/slide3/800/450', caption: 'Mountain rest' },
];

onSlideChange(event: { index: number; item: SicImageSliderItem }): void {
}

onSlideEnd(): void {
  this.toasts.show('Reached the last slide', 'info');
}`,
                    attributes: [
                        { name: 'items', type: 'SicImageSliderItem[]', default: '[]', description: '{ id?, imageUrl, alt?, caption?, data? } — array JSON ธรรมดา' },
                        { name: '[(activeIndex)]', type: 'number', default: '0', description: 'index ของสไลด์ที่แสดงอยู่' },
                        { name: 'showArrows', type: 'boolean', default: 'true', description: 'แสดง/ซ่อนปุ่มลูกศรเลื่อนซ้าย/ขวา' },
                        { name: 'showDots', type: 'boolean', default: 'true', description: 'แสดง/ซ่อนจุดไข่ปลาบอกตำแหน่งด้านล่าง' },
                        { name: 'loop', type: 'boolean', default: 'true', description: 'เลื่อนเกินภาพสุดท้าย/แรกแล้ววนกลับ — ปิดเพื่อให้หยุดที่ปลายสุดแทน' },
                        { name: 'autoSlide', type: 'boolean', default: 'false', description: 'เลื่อนสไลด์อัตโนมัติ (หยุดชั่วคราวเมื่อ hover ถ้า pauseOnHover เป็น true)' },
                        { name: 'autoSlideInterval', type: 'number', default: '4000', description: 'ระยะเวลา (ms) ระหว่างการเลื่อนอัตโนมัติแต่ละครั้ง' },
                        { name: 'pauseOnHover', type: 'boolean', default: 'true', description: 'หยุด auto-slide ชั่วคราวขณะ cursor อยู่เหนือสไลด์' },
                        {
                            name: '#slideTemplate',
                            type: 'content slot',
                            description: 'เพิ่ม HTML ทับบนรูปของแต่ละสไลด์เอง รับ let-item, let-index="index" — ไม่ใส่จะ fallback เป็น caption ธรรมดา (ถ้ามี item.caption)',
                        },
                    ],
                    events: [
                        { name: 'activeIndexChange', payload: 'number', description: 'เกิดทุกครั้งที่สไลด์เปลี่ยน (ลูกศร, จุดไข่ปลา, หรือ auto-slide)' },
                        { name: 'slideChange', payload: '{ index: number; item: SicImageSliderItem }', description: 'เกิดพร้อม activeIndexChange แต่แนบข้อมูล item มาด้วย' },
                        { name: 'slideEnd', payload: 'void', description: 'เกิดเมื่อเลื่อนไปถึงภาพสุดท้าย' },
                    ],
                },
                {
                    id: 'sic-video-player',
                    selector: 'sic-video-player',
                    title: 'Video Player',
                    category: 'Media',
                    description: 'เล่นวิดีโอจาก URL ความกว้างเต็มพื้นที่เสมอ (width 100%) ส่วนความสูงปรับตามอัตราส่วนที่กำหนดผ่าน [aspectRatio]',
                    code: `<sic-video-player
  src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
  [muted]="true"
  aspectRatio="4 / 3"
/>`,
                    attributes: [
                        { name: 'src', type: 'string', description: 'URL วิดีโอ' },
                        { name: 'poster', type: 'string', description: 'ภาพปกก่อนเล่น' },
                        { name: 'autoplay', type: 'boolean', default: 'false', description: 'เล่นอัตโนมัติเมื่อโหลดเสร็จ' },
                        { name: 'loop', type: 'boolean', default: 'false', description: 'เล่นวนซ้ำ' },
                        { name: 'muted', type: 'boolean', default: 'false', description: 'ปิดเสียงเริ่มต้น' },
                        { name: 'aspectRatio', type: 'string', default: "'16 / 9'", description: 'สัดส่วนกว้าง/สูงของกล่องวิดีโอ (ค่า CSS aspect-ratio เช่น \'4 / 3\', \'1 / 1\') — width เต็มพื้นที่เสมอ ความสูงคำนวณจากอัตราส่วนนี้' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-sound-player',
                    selector: 'sic-sound-player',
                    title: 'Sound Player',
                    category: 'Media',
                    description: 'การ์ดเล่นเพลงสไตล์อัลบั้มขนาดกะทัดรัด — ครอบ `<audio>` จริงไว้ข้างใน มีรูปปก/ไอคอนสำรอง, ป้าย genre และจำนวนการเล่น (plays) ใต้ปกอัลบั้ม, waveform คลิกเพื่อ seek ได้และไล่สีตาม progress อัตโนมัติ, ปุ่มควบคุมเล่น/หยุด/ก่อนหน้า/ถัดไป',
                    code: `<sic-sound-player
  src="https://example.com/my-delorean.mp3"
  title="My Delorean"
  subtitle="A Synthwave Mix"
  coverUrl="https://picsum.photos/seed/delorean/200"
  genre="Synthwave"
  plays="1.2M plays"
  (previousTrack)="onPreviousTrack()"
  (nextTrack)="onNextTrack()"
/>`,
                    tsCode: `onPreviousTrack(): void {
}

onNextTrack(): void {
}`,
                    attributes: [
                        { name: 'src', type: 'string', description: 'URL ไฟล์เสียง (จำเป็น)' },
                        { name: 'title', type: 'string', description: 'ชื่อเพลง' },
                        { name: 'subtitle', type: 'string', description: 'คำอธิบายรอง เช่น ชื่ออัลบั้ม/ศิลปิน' },
                        { name: 'coverUrl', type: 'string', description: 'URL รูปปก — ไม่ใส่จะ fallback เป็นวงกลมไล่สีพร้อมไอคอนโน้ตดนตรี' },
                        { name: 'genre', type: 'string', description: 'ป้ายประเภทเพลงใต้รูปปก' },
                        { name: 'plays', type: 'string', description: 'ข้อความจำนวนการเล่นที่ format มาแล้ว เช่น "1.2M plays"' },
                        { name: 'autoplay', type: 'boolean', default: 'false', description: 'เล่นอัตโนมัติเมื่อโหลดเสร็จ' },
                        { name: 'loop', type: 'boolean', default: 'false', description: 'เล่นวนซ้ำ' },
                        { name: 'muted', type: 'boolean', default: 'false', description: 'ปิดเสียงเริ่มต้น' },
                        { name: 'barsCount', type: 'number', default: '48', description: 'จำนวนแท่งใน waveform' },
                    ],
                    events: [
                        { name: 'play', payload: 'void', description: 'เล่นเพลง' },
                        { name: 'pause', payload: 'void', description: 'หยุดเพลงชั่วคราว' },
                        { name: 'ended', payload: 'void', description: 'เล่นจบเพลง' },
                        { name: 'timeUpdate', payload: '{ currentTime: number; duration: number }', description: 'เกิดระหว่างเล่นเพลงต่อเนื่อง' },
                        { name: 'previousTrack', payload: 'void', description: 'กดปุ่มเพลงก่อนหน้า' },
                        { name: 'nextTrack', payload: 'void', description: 'กดปุ่มเพลงถัดไป' },
                    ],
                },
                {
                    id: 'sic-space-bg',
                    selector: 'sic-space-bg',
                    title: 'Space Background',
                    category: 'Media',
                    description: 'เลเยอร์พื้นหลังตกแต่งแบบ CSS ล้วน เต็มพื้นที่ container เสมอ (width/height 100%) มี 4 แบบ: hexagon/geometric (ทรงเรขาลอยตัว), gradient (ไล่สีเคลื่อนไหว), sparkle (จุดกระพริบ) — กำหนดสี ([colors]), จำนวนทรง ([density]), ความเร็ว ([animationSpeed]) และ seed ของการสุ่มตำแหน่งได้ (เดิมสุ่มแต่ตำแหน่งจะคงที่ทุกครั้งที่ render ถ้า seed เท่าเดิม) — ถ้าไม่ใส่ [colors] จะ fallback เป็นชุดสีเริ่มต้นที่ปรับตาม dark/light mode อัตโนมัติผ่าน [colorMode] (ค่าเริ่มต้น "auto" ตาม SicThemeService.isDark())',
                    code: `<div style="position: relative; height: 220px; border-radius: 0.75rem; overflow: hidden;">
  <sic-space-bg
    variant="hexagon"
    [colors]="['#6366f1', '#8b5cf6', '#06b6d4']"
    [density]="20"
    backgroundColor="#0f172a"
  />
</div>`,
                    attributes: [
                        { name: 'variant', type: "'hexagon' | 'geometric' | 'gradient' | 'sparkle'", default: "'gradient'", description: 'รูปแบบลวดลายที่แสดง' },
                        { name: 'colors', type: 'string[]', default: '[]', description: 'ชุดสีที่ใช้ (จุดไล่สี/สีทรง/สีจุดกระพริบ) — ว่างจะ fallback เป็นชุดสีเริ่มต้นของแต่ละ variant ตาม [colorMode]' },
                        { name: 'colorMode', type: "'auto' | 'light' | 'dark'", default: "'auto'", description: '"auto" เลือกชุดสีเริ่มต้น (เมื่อ [colors] ว่าง) ตาม SicThemeService.isDark() อัตโนมัติ — ระบุ "light"/"dark" เพื่อบังคับชุดสีใดชุดสีหนึ่งไม่ให้ตามธีมของแอป' },
                        { name: 'backgroundColor', type: 'string', default: "'transparent'", description: 'สีพื้นหลังด้านหลังลวดลาย' },
                        { name: 'animated', type: 'boolean', default: 'true', description: 'เล่นแอนิเมชันลอย/กระพริบ/ไล่สี' },
                        { name: 'animationSpeed', type: 'number', default: '20', description: 'ความเร็วแอนิเมชัน หน่วยวินาที — ยิ่งน้อยยิ่งเร็ว' },
                        { name: 'density', type: 'number', default: '24', description: 'จำนวนทรง/จุดที่กระจาย (ไม่มีผลกับ variant "gradient")' },
                        { name: 'size', type: 'string', default: "'2rem'", description: 'ขนาดฐานของแต่ละทรง (CSS length) แต่ละทรงจะสุ่มคูณขนาดเอง' },
                        { name: 'opacity', type: 'number', default: '0.5', description: 'ความโปร่งใสของเลเยอร์ลวดลาย (0-1)' },
                        { name: 'blur', type: 'string', default: "'0px'", description: 'ค่า blur ของเลเยอร์ลวดลาย (CSS length) สำหรับเอฟเฟกต์เรืองแสง' },
                        { name: 'gradientAngle', type: 'number', default: '135', description: 'มุม (องศา) ของ linear-gradient — ใช้กับ variant "gradient" เท่านั้น' },
                        { name: 'seed', type: 'number', default: '1', description: 'seed ของการสุ่มตำแหน่งทรง — seed เดิมจะได้ตำแหน่งเดิมทุกครั้ง ไม่สลับสุ่มใหม่ทุกครั้งที่ change detection ทำงาน' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-masonry',
                    selector: 'sic-masonry',
                    title: 'Masonry',
                    category: 'Data Display',
                    description: 'จัดเรียงการ์ดแบบ Pinterest: แต่ละการ์ด (ตามลำดับเดิมใน items ไล่ซ้ายไปขวา) จะถูกส่งไปคอลัมน์ที่ "เตี้ยที่สุด ณ ตอนนั้น" เสมอ (วัดจากความสูงจริงที่ render แล้ว) ทำให้คอลัมน์ balance กันโดยอัตโนมัติแทนที่จะปล่อยให้คอลัมน์ใดคอลัมน์หนึ่งยาวเกิน — ก่อนที่จะวัดความสูงจริงได้ (เฟรมแรก) จะเรียงแบบ round-robin ซ้ายไปขวาไปพลางก่อน กำหนดจำนวนคอลัมน์แบบ responsive ได้, ปรับแต่ง card แต่ละใบเองผ่าน #itemTemplate, รองรับ lazy load ต่อหน้าด้วย [isLazy] + (loadMore) (โหลดหน้าแรกอัตโนมัติ แล้วโหลดหน้าถัดไปเมื่อ scroll ใกล้ถึงท้ายรายการด้วย IntersectionObserver), และมี (itemClick) แจ้งเมื่อคลิกการ์ดใดการ์ดหนึ่ง',
                    code: `<sic-masonry
  [items]="masonryPhotos"
  [cols]="3"
  [colsBreakpoints]="{ sm: 1, md: 2, lg: 3 }"
  gap="0.75rem"
  (itemClick)="onMasonryItemClick($event)"
>
  <ng-template #itemTemplate let-item let-index="index">
    <sic-card [style.height.px]="item.height">
      {{ index }}: {{ item.title }}
    </sic-card>
  </ng-template>
</sic-masonry>

<!-- โหมด lazy load -->
<sic-masonry [isLazy]="true" [pageSize]="12" (loadMore)="onMasonryLoadMore($event)">
  <ng-template #itemTemplate let-item>{{ item.title }}</ng-template>
</sic-masonry>`,
                    tsCode: `masonryPhotos = [
  { title: 'Photo 1', height: 120 },
  { title: 'Photo 2', height: 200 },
  // ...
];

onMasonryLoadMore(event: SicMasonryLoadEvent<Photo>): void {
  this.api.getPhotos(event.pageNo, event.pageSize).subscribe((page) => {
    event.items.update(page); // component เก็บ/ต่อ array เองภายใน
  });
}

onMasonryItemClick(photo: Photo): void {
  this.toasts.show(\`เปิดรูป: \${photo.title}\`, 'info');
}`,
                    attributes: [
                        { name: 'items', type: 'T[]', default: '[]', description: 'รายการทั้งหมด (โหมดไม่ lazy)' },
                        { name: 'cols', type: 'number', default: '3', description: 'จำนวนคอลัมน์' },
                        { name: 'colsBreakpoints', type: `{ sm?: number; md?: number; lg?: number }`, description: 'จำนวนคอลัมน์ตามขนาดจอ (≥768px = md, ≥1024px = lg)' },
                        { name: 'gap', type: 'string', default: 'var(--sic-space-4)', description: 'ระยะห่างระหว่างคอลัมน์/การ์ด' },
                        { name: 'isLazy', type: 'boolean', default: 'false', description: 'เปิดโหมดโหลดเพิ่มเป็นหน้า ๆ — ตอนเปิดจะเพิกเฉย items แล้วขอหน้าแรกผ่าน (loadMore) อัตโนมัติ' },
                        { name: 'pageSize', type: 'number', description: 'ขนาดหน้าเมื่อ isLazy — ค่าเริ่มต้นจาก SicConfig.pageSize' },
                        { name: 'trackBy', type: '(index: number, item: T) => unknown', description: 'ฟังก์ชัน track เอง ค่าเริ่มต้น track ด้วยตัว item เอง' },
                        { name: '#itemTemplate', type: 'content slot', description: 'ปรับแต่ง UI ของแต่ละการ์ดเอง รับ let-item, let-index' },
                    ],
                    events: [
                        {
                            name: 'loadMore',
                            payload: 'SicMasonryLoadEvent<T>',
                            description: 'เกิดเมื่อ isLazy=true และ scroll ใกล้ท้ายรายการ (รวมครั้งแรกตอนเปิด) — เรียก event.items.update(items) ด้วยหน้าที่โหลดมา',
                        },
                        { name: 'itemClick', payload: 'T', description: 'เกิดเมื่อคลิกการ์ดใดการ์ดหนึ่ง ส่ง item นั้นออกมา' },
                    ],
                },
                {
                    id: 'sic-drag-drop',
                    selector: 'sic-drag-drop',
                    title: 'Drag & Drop',
                    category: 'Data Display',
                    description: 'ลาก-วางเพื่อจัดลำดับใหม่ในลิสต์เดียว หรือย้ายการ์ดข้ามลิสต์แบบ kanban (ต่อยอดจาก @angular/cdk/drag-drop) ส่ง [items] สำหรับลิสต์เดียว หรือ [lists] หลายลิสต์เพื่อย้ายข้ามคอลัมน์ได้ ปรับแต่งการ์ดและหัวคอลัมน์เองได้ผ่าน #itemTemplate / #columnHeaderTemplate',
                    code: `<sic-drag-drop [lists]="kanbanLists" [showDragHandle]="true" (itemMoved)="onCardMoved($event)">
  <ng-template #columnHeaderTemplate let-list>
    <h3>{{ list.title }} ({{ list.items.length }})</h3>
  </ng-template>
  <ng-template #itemTemplate let-item let-listId="listId">
    <sic-card>{{ item.title }}</sic-card>
  </ng-template>
</sic-drag-drop>`,
                    tsCode: `kanbanLists: SicDragDropList<Task>[] = [
  { id: 'todo', title: 'Todo', items: [{ id: 1, title: 'เขียน spec' }] },
  { id: 'doing', title: 'Doing', items: [{ id: 2, title: 'ทำ component' }] },
  { id: 'done', title: 'Done', items: [] },
];

onCardMoved(event: SicDragDropMoveEvent<Task>): void {
  // event.item, previousListId/currentListId, previousIndex/currentIndex
  // component แก้ไข array ใน lists ให้อัตโนมัติแล้ว ใช้ event นี้แค่ sync ไป backend
}`,
                    attributes: [
                        { name: 'items', type: 'T[]', default: '[]', description: '(ทางเลือกแบบเดิม) ลิสต์เดียวแบบไม่มีชื่อ ใช้แทน lists ได้เมื่อจัดลำดับในลิสต์เดียว' },
                        { name: 'lists', type: 'SicDragDropList<T>[]', description: 'หลายลิสต์/คอลัมน์ แต่ละอันมี id (ต้อง unique ทั้งหน้า), title, items — ลากข้ามลิสต์ได้ทั้งหมด' },
                        { name: 'showDragHandle', type: 'boolean', default: 'false', description: 'true = ลากได้เฉพาะจากปุ่ม ⠿ เท่านั้น, false = ลากจากตรงไหนของการ์ดก็ได้' },
                        { name: 'trackBy', type: '(index: number, item: T) => unknown', description: 'ฟังก์ชัน track เอง ค่าเริ่มต้น track ด้วยตัว item เอง' },
                        { name: '#itemTemplate', type: 'content slot', description: 'ปรับแต่ง UI การ์ดเอง รับ let-item, let-index, let-listId' },
                        { name: '#columnHeaderTemplate', type: 'content slot', description: 'ปรับแต่งหัวคอลัมน์เอง รับ let-list (SicDragDropList<T>)' },
                    ],
                    events: [
                        {
                            name: 'itemMoved',
                            payload: 'SicDragDropMoveEvent<T>',
                            description: 'เกิดหลังลาก-วางเสร็จ (ทั้งจัดลำดับในลิสต์เดิม หรือย้ายข้ามลิสต์) — array ใน lists/items ถูกแก้ไขให้แล้วโดยอัตโนมัติ',
                        },
                    ],
                },
                {
                    id: 'sic-badge',
                    selector: 'sic-badge',
                    title: 'Badge',
                    category: 'Data Display',
                    description: 'แสดงจำนวนแจ้งเตือนบน content กำหนดตำแหน่งมุมที่แสดงได้',
                    code: `<sic-badge [count]="5" [max]="99" color="primary">
  <sic-button variant="ghost">Inbox</sic-button>
</sic-badge>

<!-- กำหนดมุมที่แสดง badge -->
<sic-badge [dot]="true" color="danger" position="bottom-left">
  <sic-button variant="ghost">Profile</sic-button>
</sic-badge>`,
                    attributes: [
                        { name: 'count', type: 'number', description: 'จำนวนที่ต้องการแสดง' },
                        { name: 'max', type: 'number', default: '99', description: 'จำนวนสูงสุดก่อนแสดงเป็น 99+' },
                        { name: 'dot', type: 'boolean', default: 'false', description: 'แสดงเป็นจุดกลมแทนตัวเลข' },
                        { name: 'color', type: 'string', default: 'primary', description: 'สีของ badge' },
                        {
                            name: 'position',
                            type: `'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'`,
                            default: 'top-right',
                            description: 'มุมที่แสดง badge เทียบกับ content ข้างใน',
                        },
                    ],
                    events: [],
                },
                {
                    id: 'sic-tag',
                    selector: 'sic-tag',
                    title: 'Tag',
                    category: 'Data Display',
                    description: 'ป้าย label สั้น ๆ และปิดได้ ส่ง [items] เป็น array ของ { text, color } เพื่อแสดงหลายป้ายในกล่องเดียวได้',
                    code: `<sic-tag color="primary" [closable]="true" (closed)="onTagClosed()">
  Beta
</sic-tag>

<!-- แสดงหลายป้ายพร้อมกัน ส่ง [{ text, color }] -->
<sic-tag [items]="skillTags" [closable]="true" (itemClosed)="onSkillTagClosed($event)" />`,
                    tsCode: `onTagClosed(): void {
  this.toasts.show('Tag closed', 'info');
}

skillTags: SicTagItem[] = [
  { text: 'Angular', color: 'danger' },
  { text: 'TypeScript', color: 'primary' },
  { text: 'RxJS', color: 'warning' },
];

onSkillTagClosed(event: { item: SicTagItem; index: number }): void {
  this.skillTags = this.skillTags.filter((_, i) => i !== event.index);
}`,
                    attributes: [
                        { name: 'color', type: 'string', default: 'primary', description: 'สีของ tag (โหมดป้ายเดียว)' },
                        { name: 'closable', type: 'boolean', default: 'false', description: 'แสดงปุ่มปิด tag ค่าเริ่มต้นของทุกป้าย ถ้าใช้ [items] (แต่ละ item.closable override ได้)' },
                        {
                            name: 'items',
                            type: 'SicTagItem[]  // { text: string; color?: SicTagColor; closable?: boolean }',
                            description: 'ถ้ากำหนด จะ render เป็นหลายป้ายแทน content ที่ project เข้ามา หนึ่งป้ายต่อ item',
                        },
                    ],
                    events: [
                        { name: 'closed', payload: 'void', description: 'เกิดเมื่อผู้ใช้กดปิด tag (โหมดป้ายเดียว)' },
                        { name: 'itemClosed', payload: '{ item: SicTagItem; index: number }', description: 'เกิดเมื่อผู้ใช้กดปิดป้ายใดป้ายหนึ่งใน [items]' },
                    ],
                },
                {
                    id: 'sic-avatar',
                    selector: 'sic-avatar',
                    title: 'Avatar',
                    category: 'Data Display',
                    description: 'แสดงรูปหรือชื่อย่อผู้ใช้ กดได้ (avatarClick) และรองรับแสดงเป็นกลุ่มซ้อนกันซ้ายไปขวาผ่าน [items] — เมาส์ชี้รูปไหนในกลุ่ม รูปนั้นจะลอยขึ้นมาแสดงเต็มด้านหน้า',
                    code: `<sic-avatar name="Ada Lovelace" size="md" (avatarClick)="onAvatarClick()" />

<!-- แสดงเป็นกลุ่มซ้อนกัน ส่ง [{ name, src }] -->
<sic-avatar [items]="teamAvatars" (itemClick)="onTeamAvatarClick($event)" />`,
                    tsCode: `onAvatarClick(): void {
  this.toasts.show('Avatar clicked', 'info');
}

teamAvatars: SicAvatarItem[] = [
  { name: 'Ada Lovelace' },
  { name: 'Grace Hopper' },
  { name: 'Alan Turing' },
];

onTeamAvatarClick(event: { item: SicAvatarItem; index: number }): void {
  this.toasts.show(\`Clicked \${event.item.name}\`, 'info');
}`,
                    attributes: [
                        { name: 'name', type: 'string', description: 'ชื่อที่ใช้สร้าง initials (โหมด avatar เดียว)' },
                        { name: 'size', type: `'sm' | 'md' | 'lg'`, default: 'md', description: 'ขนาด avatar' },
                        { name: 'src', type: 'string', description: 'URL รูป avatar ถ้ามี (โหมด avatar เดียว)' },
                        {
                            name: 'items',
                            type: 'SicAvatarItem[]  // { src?: string; name?: string }',
                            description: 'ถ้ากำหนด จะแสดงเป็นกลุ่ม avatar ซ้อนกันจากซ้ายไปขวาแทนโหมด avatar เดียว',
                        },
                    ],
                    events: [
                        { name: 'avatarClick', payload: 'MouseEvent', description: 'เกิดเมื่อคลิก avatar (โหมด avatar เดียว)' },
                        { name: 'itemClick', payload: '{ item: SicAvatarItem; index: number }', description: 'เกิดเมื่อคลิก avatar ตัวใดตัวหนึ่งใน [items]' },
                    ],
                },
                {
                    id: 'sic-accordion',
                    selector: 'sic-accordion / sic-collapse',
                    title: 'Accordion & Collapse',
                    category: 'Data Display',
                    description: 'ซ่อน/แสดงเนื้อหาเป็น section',
                    code: `<sic-accordion [multi]="false">
  <sic-collapse label="Section A">Content A</sic-collapse>
  <sic-collapse label="Section B">Content B</sic-collapse>
</sic-accordion>`,
                    attributes: [
                        { name: 'multi', type: 'boolean', default: 'false', description: 'เปิดหลาย section พร้อมกันได้หรือไม่' },
                        { name: 'label', type: 'string', description: 'หัวข้อของ sic-collapse' },
                    ],
                    events: [],
                },
            ],
        },
        {
            id: 'feedback-overlays',
            title: 'Overlays & Feedback',
            description: 'dialog, toast และ tooltip',
            components: [
                {
                    id: 'sic-dialog',
                    selector: 'sic-dialog',
                    title: 'Dialog',
                    category: 'Overlay',
                    description: 'กล่อง modal สำหรับยืนยันหรือแสดงรายละเอียดเพิ่มเติม',
                    code: `<sic-button (click)="dialogOpen = true">Open dialog</sic-button>

<sic-dialog
  [open]="dialogOpen"
  title="Confirm"
  [disableClose]="false"
  width="28rem"
  (openChange)="dialogOpen = $event"
>
  Are you sure you want to continue?
  <div sicDialogFooter>
    <sic-button variant="ghost" (click)="dialogOpen = false">Cancel</sic-button>
    <sic-button variant="solid" (click)="dialogOpen = false">Confirm</sic-button>
  </div>
</sic-dialog>`,
                    tsCode: `dialogOpen = false;`,
                    attributes: [
                        { name: 'open', type: 'boolean', default: 'false', description: 'สถานะเปิด/ปิด dialog' },
                        { name: 'title', type: 'string', description: 'หัวข้อ dialog' },
                        { name: 'disableClose', type: 'boolean', default: 'false', description: 'ป้องกันการปิดจาก overlay หรือปุ่ม escape' },
                        { name: 'width', type: 'string', description: 'ความกว้างของ dialog เช่น 28rem' },
                        { name: 'sicDialogFooter', type: 'content slot', description: 'พื้นที่ footer ของ dialog' },
                    ],
                    events: [
                        { name: 'openChange', payload: 'boolean', description: 'ส่งสถานะใหม่เมื่อ dialog เปิดหรือปิด' },
                    ],
                },
                {
                    id: 'sic-dialog-service',
                    selector: 'SicDialogService',
                    title: 'Dialog (service)',
                    category: 'Overlay',
                    description: 'เปิด dialog แบบ imperative ด้วย SicDialogService — ส่ง component เข้าไปตรง ๆ พร้อมข้อมูล (data) และ config (width/height/disableClose) แล้ว subscribe รับผลลัพธ์ตอนปิดได้เลย component ที่ถูกเปิดสามารถ inject SIC_DIALOG_DATA เพื่อรับข้อมูล และ inject SicDialogRef เพื่อปิดตัวเองพร้อมส่งผลลัพธ์กลับ',
                    code: `// confirm-dialog.component.ts — component ที่จะถูกเปิดผ่าน service
@Component({
  standalone: true,
  imports: [SicButtonComponent],
  template: \`
    <p>Confirm action for {{ data.name }}?</p>
    <sic-button (click)="dialogRef.close('confirmed')">Confirm</sic-button>
    <sic-button (click)="dialogRef.close()">Cancel</sic-button>
  \`,
})
class ConfirmDialogComponent {
  data = inject(SIC_DIALOG_DATA) as { name: string };
  dialogRef = inject<SicDialogRef<ConfirmDialogComponent, string>>(SicDialogRef);
}

// ที่เรียกใช้งาน
this.sicDialogService
  .open<ConfirmDialogComponent, { name: string }, string>(
    ConfirmDialogComponent,
    { name: 'Ada Lovelace' },
    { width: '90%', height: 'auto' },
  )
  .subscribe((result) => {
    // result เป็นค่าที่ dialogRef.close(result) ส่งมา, undefined ถ้าปิดโดยไม่ระบุผล (คลิก backdrop/Escape)
  });`,
                    codeLabel: 'confirm-dialog.component.ts',
                    codeLang: 'typescript',
                    tsCode: `constructor(private sicDialogService: SicDialogService) {}`,
                    tsCodeLabel: 'my.component.ts',
                    attributes: [
                        { name: 'component', type: 'ComponentType<T>', description: 'component ที่จะเปิดใน dialog — ต้องเป็น standalone component' },
                        { name: 'data', type: 'D (argument ที่ 2, optional)', description: 'ข้อมูลที่ส่งเข้าไป รับได้ใน component ที่เปิดผ่าน inject(SIC_DIALOG_DATA)' },
                        {
                            name: 'config',
                            type: '{ width?: string; height?: string; disableClose?: boolean }  (argument ที่ 3, optional)',
                            description: 'width/height ของ dialog (เช่น "90%", "32rem") และปิดการปิดจาก backdrop/Escape ได้ด้วย disableClose',
                        },
                    ],
                    events: [
                        {
                            name: 'open(...).subscribe(...)',
                            payload: 'R | undefined',
                            description: 'ค่าที่ component ภายในส่งผ่าน dialogRef.close(result) — undefined ถ้าปิดโดยไม่มีผลลัพธ์ (backdrop/Escape) หรือปิดผ่าน handle.close() เอง',
                        },
                    ],
                },
                {
                    id: 'sic-dialog-common',
                    selector: 'SicDialogService.info/success/danger/warning/confirm',
                    title: 'Dialog (common: info/success/danger/warning/confirm)',
                    category: 'Overlay',
                    description: 'dialog สำเร็จรูป ไม่ต้องสร้าง component เอง: ไอคอนด้านบน ตามด้วย title, description, และปุ่ม sic-button — info/success/danger/warning มีปุ่ม "Close" ปุ่มเดียว, confirm มีปุ่ม "Cancel"/"Confirm" ทั้งหมด subscribe รับผลลัพธ์ตอนปิดได้เหมือน open()',
                    code: `this.sicDialogService.info('Title', 'Description').subscribe(() => {
  // ปิดแล้ว (ปุ่ม Close เท่านั้น ไม่มีผลลัพธ์)
});

this.sicDialogService.success('Title', 'Description').subscribe(() => { /* ... */ });
this.sicDialogService.danger('Title', 'Description').subscribe(() => { /* ... */ });
this.sicDialogService.warning('Title', 'Description').subscribe(() => { /* ... */ });

this.sicDialogService.confirm('Delete this item?', 'This action cannot be undone.').subscribe((confirmed) => {
  if (confirmed) {
    // ผู้ใช้กด Confirm
  }
  // confirmed เป็น false ถ้ากด Cancel, คลิก backdrop, หรือกด Escape
});`,
                    codeLabel: 'my.component.ts',
                    codeLang: 'typescript',
                    tsCode: `constructor(private sicDialogService: SicDialogService) {}`,
                    tsCodeLabel: 'component.ts',
                    attributes: [
                        { name: 'title', type: 'string', description: 'หัวข้อ (argument ที่ 1)' },
                        { name: 'description', type: 'string', description: 'ข้อความอธิบาย (argument ที่ 2)' },
                        { name: 'config', type: 'SicDialogConfig (argument ที่ 3, optional)', description: 'width/height/disableClose เหมือน open()' },
                    ],
                    events: [
                        { name: 'info/success/danger/warning(...).subscribe(...)', payload: 'void', description: 'เกิดเมื่อกดปุ่ม Close' },
                        {
                            name: 'confirm(...).subscribe(...)',
                            payload: 'boolean',
                            description: 'true เมื่อกด Confirm, false เมื่อกด Cancel หรือปิดโดยวิธีอื่น (backdrop/Escape)',
                        },
                    ],
                },
                {
                    id: 'sic-search',
                    selector: 'sic-search',
                    title: 'Search (popup overlay)',
                    category: 'Overlay',
                    description: 'popup search แบบ ⌘K: ผูก [open]/(openChange) เพื่อเปิด-ปิด ส่ง [items] เข้าไป ค้นหาแบบ substring case-insensitive ในตัว หรือกำหนด [filterFn] เองก็ได้ (เช่นค้นจาก server) ปิดได้ทั้งกด Escape หรือคลิก backdrop ใช้ลูกศรขึ้น/ลง + Enter เลือกได้ และปรับแต่งแต่ละแถวผลลัพธ์ได้เต็มที่ผ่าน #itemTemplate',
                    code: `<sic-button variant="outline" (click)="searchOpen = true">Open search</sic-button>

<sic-search
  [open]="searchOpen"
  [items]="searchPages"
  [optionLabel]="'label'"
  placeholder="Search pages..."
  (openChange)="searchOpen = $event"
  (itemSelect)="onSearchSelect($event)"
>
  <ng-template #itemTemplate let-item let-active="active">
    <strong>{{ item.label }}</strong>
    <span style="opacity: 0.6; margin-left: 0.5rem;">{{ item.path }}</span>
  </ng-template>
</sic-search>`,
                    tsCode: `searchOpen = false;
searchPages = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Users', path: '/users' },
  { label: 'Settings', path: '/settings' },
];

onSearchSelect(page: { label: string; path: string }): void {
  this.router.navigateByUrl(page.path);
}`,
                    attributes: [
                        { name: 'open', type: 'boolean', default: 'false', description: 'สถานะเปิด/ปิด overlay' },
                        { name: 'items', type: 'T[]', default: '[]', description: 'รายการทั้งหมดที่ค้นหาได้' },
                        { name: 'query', type: 'string', default: `''`, description: 'คำค้นหาปัจจุบัน (bindable)' },
                        { name: 'placeholder', type: 'string', default: 'Search...', description: 'placeholder ของช่องค้นหา' },
                        {
                            name: 'optionLabel',
                            type: 'keyof T | ((item: T) => string)',
                            description: 'ชื่อ property ที่ใช้แสดง/ค้นหา หรือฟังก์ชันคำนวณ label เอง — default คือ String(item)',
                        },
                        {
                            name: 'filterFn',
                            type: '(items: T[], query: string) => T[]',
                            description: 'แทนที่ filter default (substring) ทั้งหมด เช่นกรณี items มาจาก server ที่กรองมาแล้ว',
                        },
                        { name: 'closeOnSelect', type: 'boolean', default: 'true', description: 'ปิด overlay อัตโนมัติหลังเลือกผลลัพธ์หรือไม่' },
                        { name: 'minWidth', type: 'string', description: 'ความกว้างขั้นต่ำของ panel (ค่า CSS length ใด ๆ เช่น \'24rem\')' },
                        { name: '#itemTemplate', type: 'content slot', description: 'ปรับแต่ง UI ของแต่ละแถวผลลัพธ์เอง รับ let-item, let-active, let-query' },
                    ],
                    events: [
                        { name: 'openChange', payload: 'boolean', description: 'ส่งสถานะใหม่เมื่อ overlay เปิดหรือปิด (Escape/backdrop/เลือกผลลัพธ์)' },
                        { name: 'queryChange', payload: 'string', description: 'ส่งคำค้นหาทุกครั้งที่ผู้ใช้พิมพ์' },
                        { name: 'itemSelect', payload: 'T', description: 'เกิดเมื่อผู้ใช้เลือกผลลัพธ์ (คลิกหรือกด Enter)' },
                    ],
                },
                {
                    id: 'sic-popover',
                    selector: 'sic-popover',
                    title: 'Popover',
                    category: 'Overlay',
                    description: 'popover ทั่วไป: ปุ่ม trigger เปิด overlay ที่แสดง [items] เป็น list ต่อกับปุ่มโดยตรง (ไม่ใช่ overlay กลางจอแบบ sic-search) ปิดได้ทั้งกด Escape หรือคลิก backdrop — ทุกส่วนแทนที่ได้อิสระผ่าน content-template slots: sicPopoverButton (ปุ่ม trigger, default เป็น "⋯"), sicPopoverHeader (หัว panel, ไม่มี default), sicPopoverList (แต่ละแถวใน list, default คือ {{ item }}), sicPopoverFooter (ท้าย panel, ไม่มี default)',
                    code: `<sic-popover [items]="menuActions" (itemSelect)="onMenuActionSelect($event)">
  <ng-template sicPopoverButton let-popover>
    <sic-button variant="ghost" (click)="popover.toggle()">⋮</sic-button>
  </ng-template>
  <ng-template sicPopoverHeader>
    <div class="my-popover-header">Actions</div>
  </ng-template>
  <ng-template sicPopoverList let-item>
    <span>{{ item.icon }} {{ item.label }}</span>
  </ng-template>
  <ng-template sicPopoverFooter>
    <div class="my-popover-footer">v1.0</div>
  </ng-template>
</sic-popover>`,
                    tsCode: `menuActions = [
  { label: 'Edit', icon: '✏️' },
  { label: 'Duplicate', icon: '📄' },
  { label: 'Delete', icon: '🗑️' },
];

onMenuActionSelect(action: { label: string; icon: string }): void {
  this.toasts.show(\`เลือก: \${action.label}\`, 'info');
}`,
                    attributes: [
                        { name: 'items', type: 'T[]', default: '[]', description: 'รายการที่แสดงเป็น list ใน panel' },
                        { name: 'open', type: 'boolean', default: 'false', description: 'สถานะเปิด/ปิด (bindable) — ใช้ตอนต้องการควบคุมจากภายนอก เช่น เปิดจากปุ่มอื่น' },
                        { name: 'closeOnSelect', type: 'boolean', default: 'true', description: 'ปิด popover อัตโนมัติหลังเลือกรายการหรือไม่' },
                        {
                            name: 'placement',
                            type: `'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'`,
                            default: `'bottom-start'`,
                            description: 'ตำแหน่ง panel เทียบกับปุ่ม trigger (มีตำแหน่งสำรองอัตโนมัติถ้าพื้นที่ไม่พอ)',
                        },
                        {
                            name: 'sicPopoverButton',
                            type: '<ng-template>',
                            description: 'แทนที่ปุ่ม trigger เริ่มต้น ("⋯") — รับ context { $implicit: popover instance, open } เช่น <ng-template sicPopoverButton let-popover> แล้วเรียก popover.toggle() เอง',
                        },
                        {
                            name: 'sicPopoverHeader / sicPopoverFooter',
                            type: '<ng-template>',
                            description: 'หัว/ท้ายของ panel — ไม่มี UI เริ่มต้นให้ ถ้าไม่ใส่จะไม่มีอะไรแสดง',
                        },
                        {
                            name: 'sicPopoverList',
                            type: '<ng-template>',
                            description: 'แทนที่การแสดงผลแต่ละแถว รับ context { $implicit: item, index } — ไม่ใส่จะ fallback เป็น {{ item }} เฉยๆ (เหมาะกับ items ที่เป็น string/number)',
                        },
                    ],
                    events: [
                        { name: 'openChange', payload: 'boolean', description: 'ส่งสถานะใหม่เมื่อ popover เปิดหรือปิด (toggle/Escape/backdrop/เลือกรายการ)' },
                        { name: 'itemSelect', payload: 'T', description: 'เกิดเมื่อผู้ใช้คลิกเลือกแถวใน list' },
                    ],
                },
                {
                    id: 'sic-toast',
                    selector: 'sic-toast',
                    title: 'Toast',
                    category: 'Feedback',
                    description: 'ข้อความแจ้งเตือนชั่วคราว ใช้งานร่วมกับ SicToastService — การ์ดโทนมืดพร้อมไอคอนวงกลม, หัวข้อ/ข้อความสี, และ badge ทางขวา (เช่น +500) ปรับแต่งได้ทั้งไอคอนและ badge',
                    code: `<sic-button variant="outline" (click)="notify()">Show toast</sic-button>
<sic-toast position="top-right" />`,
                    tsCode: `constructor(private toasts: SicToastService) {}

notify(): void {
  // แบบสั้น (เดิม ยังใช้ได้เหมือนเดิม)
  this.toasts.show('This is a toast message', 'info');

  // แบบเต็ม: title + message + icon/badge ที่กำหนดเอง
  this.toasts.show({
    title: 'Your complaint has been received',
    message: 'You will be notified as soon as it is processed by a moderator',
    type: 'success',
  });

  this.toasts.show({
    title: "Your complaint can't be received",
    message: 'Retry later or contact a moderator',
    type: 'danger',
  });

  this.toasts.show({
    message: 'Reading an article',
    type: 'neutral',
    badge: { text: '+500' },
  });
}`,
                    attributes: [
                        { name: 'position', type: 'string', default: 'top-right', description: 'ตำแหน่ง toast เช่น top-right' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-toast-service',
                    selector: 'SicToastService.show(options)',
                    title: 'Toast (custom icon / badge)',
                    category: 'Feedback',
                    description: 'show() รับได้ทั้งรูปแบบสั้น show(message, type, duration) เดิม หรือรูปแบบเต็มเป็น options object เพื่อกำหนด title, icon (บังคับไอคอนเอง หรือ false เพื่อซ่อน หรือ emoji/ตัวอักษรใด ๆ), และ badge (เช่น +500 พร้อม coin ทางขวา) — type "neutral" ไม่มีไอคอน default',
                    code: `interface SicToastOptions {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'danger' | 'warning' | 'neutral';
  duration?: number;
  icon?: 'success' | 'danger' | 'warning' | 'info' | false | string; // preset, false = ซ่อน, string อื่น = แสดงเป็นข้อความ/emoji
  badge?: { text: string; icon?: string };
}`,
                    codeLabel: 'sic-toast.model.ts',
                    codeLang: 'typescript',
                    tsCode: `// ไอคอน custom เป็น emoji แทน default ของ type
this.toasts.show({ message: 'Level up!', type: 'success', icon: '🎉' });

// ซ่อนไอคอนไปเลย
this.toasts.show({ message: 'Quiet update', type: 'info', icon: false });`,
                    tsCodeLabel: 'component.ts',
                    attributes: [
                        { name: 'title', type: 'string', description: 'หัวข้อตัวหนา สีตาม type (ไม่ใส่ = ไม่มีหัวข้อ)' },
                        { name: 'message', type: 'string', description: 'ข้อความรอง สีเทา' },
                        { name: 'type', type: `'info' | 'success' | 'danger' | 'warning' | 'neutral'`, default: 'info', description: 'กำหนดสีไอคอน/หัวข้อ และไอคอน default (neutral = ไม่มีไอคอน)' },
                        { name: 'icon', type: `'success' | 'danger' | 'warning' | 'info' | false | string`, description: 'บังคับไอคอนเอง: preset ในตัว, false เพื่อซ่อน, หรือ string อื่น (เช่น emoji) แสดงตรง ๆ ในวงกลมไอคอน' },
                        { name: 'badge', type: '{ text: string; icon?: string }', description: 'ป้ายชิดขวา เช่น { text: "+500" } สำหรับ toast แจ้งรางวัล/แต้ม' },
                        { name: 'duration', type: 'number', default: '3500', description: 'มิลลิวินาทีก่อนปิดอัตโนมัติ ใส่ 0 เพื่อไม่ให้ปิดเอง' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-tooltip',
                    selector: 'sicTooltip',
                    title: 'Tooltip Directive',
                    category: 'Feedback',
                    description: 'แสดงข้อความช่วยเหลือเมื่อ hover หรือ focus',
                    code: `<sic-button [sicTooltip]="'Save changes'" sicTooltipPlacement="bottom">
  Hover me
</sic-button>`,
                    attributes: [
                        { name: 'sicTooltip', type: 'string', description: 'ข้อความใน tooltip' },
                        { name: 'sicTooltipPlacement', type: `'top' | 'right' | 'bottom' | 'left'`, default: 'top', description: 'ตำแหน่ง tooltip' },
                    ],
                    events: [],
                },
            ],
        },
        {
            id: 'loading-indicators',
            title: 'Loading & Indicators',
            description: 'สถานะโหลดและความคืบหน้า',
            components: [
                {
                    id: 'sic-spinner',
                    selector: 'sic-spinner',
                    title: 'Spinner',
                    category: 'Loading',
                    description: 'แสดง loading แบบหมุน',
                    code: `<sic-spinner size="md" />`,
                    attributes: [
                        { name: 'size', type: `'sm' | 'md' | 'lg'`, default: 'md', description: 'ขนาด spinner' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-loading-service',
                    selector: 'SicLoadingService',
                    title: 'Loading Overlay (service)',
                    category: 'Loading',
                    description: 'สร้าง loading overlay เต็มจอแบบ imperative ด้วย SicLoadingService — ค่าเริ่มต้นแสดง sic-spinner หมุน หรือจะเปลี่ยนไปแสดงรูปภาพ (png/gif) แทนก็ได้ผ่าน image ตั้งข้อความ (message) ประกอบได้ รองรับ timeout เพื่อปิดอัตโนมัติ หรือปิดเองด้วย handle.hide()',
                    code: `const loading = this.sicLoadingService.show({
  message: 'Loading...',
  timeout: 5000, // ปิดอัตโนมัติหลัง 5 วินาที ถ้ายังไม่ hide() เอง
});

// ทำงานบางอย่าง แล้วปิดเองก่อน timeout
doSomeWork().then(() => loading.hide());

// หรือแสดงรูปภาพของคุณเอง (png/gif) แทน spinner
const loadingWithGif = this.sicLoadingService.show({
  image: '/assets/loading.gif',
  message: 'Uploading...',
});`,
                    codeLabel: 'my.component.ts',
                    codeLang: 'typescript',
                    tsCode: `constructor(private sicLoadingService: SicLoadingService) {}`,
                    tsCodeLabel: 'component.ts',
                    attributes: [
                        { name: 'message', type: 'string', description: 'ข้อความใต้ spinner/รูปภาพ' },
                        { name: 'image', type: 'string', description: 'URL รูป .png/.gif ที่จะแสดงแทน sic-spinner ค่าเริ่มต้น' },
                        { name: 'spinnerSize', type: `'sm' | 'md' | 'lg'`, default: 'lg', description: 'ขนาด sic-spinner เมื่อไม่ได้กำหนด image' },
                        { name: 'timeout', type: 'number', description: 'ปิดอัตโนมัติหลังผ่านไปกี่มิลลิวินาที ไม่ใส่ = ไม่ปิดเอง ต้องเรียก handle.hide()' },
                    ],
                    events: [
                        { name: 'show(...)', payload: 'SicLoadingHandle', description: 'คืน handle: hide(), setMessage(text), setImage(url), isVisible()' },
                    ],
                },
                {
                    id: 'sic-skeleton',
                    selector: 'sic-skeleton',
                    title: 'Skeleton',
                    category: 'Loading',
                    description: 'placeholder ระหว่างรอโหลดข้อมูล',
                    code: `<sic-skeleton variant="text" width="200px" />
<sic-skeleton variant="circle" width="48px" height="48px" />`,
                    attributes: [
                        { name: 'variant', type: `'text' | 'rect' | 'circle'`, default: 'text', description: 'รูปแบบ skeleton' },
                        { name: 'width', type: 'string', description: 'ความกว้าง เช่น 200px' },
                        { name: 'height', type: 'string', description: 'ความสูง เช่น 48px' },
                    ],
                    events: [],
                },
                {
                    id: 'sic-progress-bar',
                    selector: 'sic-progress-bar',
                    title: 'Progress Bar',
                    category: 'Loading',
                    description: 'แสดงเปอร์เซ็นต์ความคืบหน้าหรือโหมด indeterminate',
                    code: `<sic-progress-bar [value]="progressValue" color="primary" />
<sic-progress-bar [indeterminate]="true" color="success" />`,
                    tsCode: `progressValue = 60;`,
                    attributes: [
                        { name: 'value', type: 'number', description: 'ค่า progress 0-100' },
                        { name: 'indeterminate', type: 'boolean', default: 'false', description: 'โหมดไม่ระบุเปอร์เซ็นต์' },
                        { name: 'color', type: 'string', default: 'primary', description: 'สีของ progress bar' },
                    ],
                    events: [],
                },
            ],
        },
    ];