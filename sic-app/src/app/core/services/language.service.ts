import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { firstValueFrom, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'th' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translate = inject(TranslateService);
  private readonly storageKey = 'app-lang';

  constructor() {
    this.translate.onLangChange.subscribe(({ lang }) => {
      this.updateHtmlLang(lang as AppLanguage);
    });
  }

  private readonly defaultTranslations: Record<'th' | 'en', Record<string, string>> = {
    th: {
      CONTEXT_SWITCHER_TITLE: 'ตัวกรองและสลับโปรเจกต์',
      CONTEXT_SWITCHER_POPOVER_TITLE: 'ค้นหา & สลับโปรเจกต์',
      CONTEXT_SWITCHER_POPOVER_SUBTITLE: 'คัดกรองและเลือกโปรเจกต์การทำงาน',
      CONTEXT_SWITCHER_SELECT_PROMPT: 'เลือกโปรเจกต์ / ตัวกรอง...',
      CONTEXT_SWITCHER_CUSTOMER_SELECTED: 'เลือกลูกค้าแล้ว (ยังไม่เลือกโปรเจกต์)',
      CONTEXT_SWITCHER_SELECTED_PROJECT: 'โปรเจกต์ที่เลือก',
      CONTEXT_SWITCHER_PROJECTS_SELECTED: 'โปรเจกต์ที่เลือก',
      CONTEXT_SWITCHER_SEARCH_PLACEHOLDER: 'ค้นหาชื่อโปรเจกต์, รหัสโปรเจกต์...',
      CONTEXT_SWITCHER_CUSTOMER_LABEL: 'ลูกค้า',
      CONTEXT_SWITCHER_CUSTOMER_SEARCH_PLACEHOLDER: 'พิมพ์ค้นหาลูกค้า...',
      CONTEXT_SWITCHER_CUSTOMER_NOT_FOUND: 'ไม่พบรายชื่อลูกค้า',
      CONTEXT_SWITCHER_ALL_CUSTOMERS: 'ทุกลูกค้า (ทั้งหมด)',
      CONTEXT_SWITCHER_STATUS_LABEL: 'สถานะงาน',
      CONTEXT_SWITCHER_PRIORITY_LABEL: 'ระดับความสำคัญ',
      CONTEXT_SWITCHER_MATCHING_PROJECTS: 'โปรเจกต์ที่ตรงเงื่อนไข',
      CONTEXT_SWITCHER_LOADING_PROJECTS: 'กำลังโหลดรายการโปรเจกต์...',
      CONTEXT_SWITCHER_NO_MATCHING_PROJECTS: 'ไม่พบโปรเจกต์ตามเงื่อนไขตัวกรอง',
      CONTEXT_SWITCHER_CURRENT: 'ปัจจุบัน',
      CONTEXT_SWITCHER_SWITCH: 'สลับ',
      CONTEXT_SWITCHER_RESET_FILTERS: 'ล้างตัวกรอง',
      CONTEXT_SWITCHER_CLEAR_CONTEXT: 'ล้างบริบทปัจจุบัน',
      CONTEXT_SWITCHER_CLOSE: 'ปิด',
      CONTEXT_SWITCHER_SELECT_ALL: 'เลือกทั้งหมด',
      CONTEXT_SWITCHER_UNSELECT_ALL: 'ยกเลิกทั้งหมด',
      STATUS_ALL: 'ทั้งหมด',
      STATUS_PLANNING: 'วางแผน',
      STATUS_DEVELOPMENT: 'กำลังพัฒนา',
      STATUS_UAT: 'ทดสอบ',
      STATUS_BUG_FIXING: 'แก้ไขบั๊ก',
      STATUS_DELIVERED: 'ส่งมอบแล้ว',
      STATUS_CLOSED: 'ปิดงาน',
      PRIORITY_ALL: 'ทั้งหมด',
      PRIORITY_CRITICAL: 'ด่วนมาก',
      PRIORITY_HIGH: 'สูง',
      PRIORITY_MEDIUM: 'ปานกลาง',
      PRIORITY_LOW: 'ต่ำ',
      PRIORITY_NORMAL: 'ทั่วไป',
      PROJECT_HEALTH_WIDGET_TITLE: 'สุขภาพโครงการ',
      PROJECT_HEALTH_STATUS_GOOD: 'สุขภาพดี',
      PROJECT_HEALTH_STATUS_WARNING: 'เฝ้าระวัง',
      PROJECT_HEALTH_STATUS_CRITICAL: 'วิกฤต',
      PROJECT_HEALTH_TOTAL_SCORE: 'คะแนนสุขภาพรวม',
      PROJECT_HEALTH_FACTOR_TASKS: 'ความคืบหน้างาน',
      PROJECT_HEALTH_FACTOR_MANDAY: 'การใช้ Manday (จากงบทั้งหมด)',
      PROJECT_HEALTH_FACTOR_QUALITY: 'คุณภาพ & การแก้ไข Bug',
      PROJECT_HEALTH_FACTOR_PHASE: 'ความคืบหน้า Phase',
      PROJECT_HEALTH_FACTOR_TIMELINE: 'สถานะและกำหนดการ',
      PROJECT_HEALTH_DETAIL_NO_TASKS: 'ไม่มีงาน (0/0)',
      PROJECT_HEALTH_DETAIL_TASKS_PROGRESS: 'งานเสร็จ {{completed}}/{{total}} งาน ({{percent}}%)',
      PROJECT_HEALTH_DETAIL_MANDAY_USAGE: '{{used}} / {{budget}} Manday ({{percent}}%)',
      PROJECT_HEALTH_DETAIL_NO_BUGS: 'สมบูรณ์ ไม่มี Bug ในระบบ (0/0)',
      PROJECT_HEALTH_DETAIL_BUGS_PROGRESS: 'แก้ไขแล้ว {{closed}}/{{total}} Bug ({{percent}}%)',
      PROJECT_HEALTH_DETAIL_NO_PHASES: 'ไม่มี Phase (0/0)',
      PROJECT_HEALTH_DETAIL_PHASES_PROGRESS: '{{completed}}/{{total}} Phase ({{percent}}%)',
      PROJECT_HEALTH_DETAIL_ON_SCHEDULE: 'ตามแผนงาน',
      PROJECT_HEALTH_DETAIL_DELAYED: 'ล่าช้ากว่ากำหนด',
      PROJECT_HEALTH_DETAIL_COMPLETED: 'เสร็จสิ้นตามเป้าหมาย',
      PROJECT_HEALTH_DETAIL_OVERDUE: 'เกินกำหนดส่งมอบ',
      PORTFOLIO_GANTT_TITLE: 'ผังระยะเวลาโครงการองค์กร (Enterprise Portfolio Roadmap)',
      PORTFOLIO_GANTT_SUBTITLE: 'แสดงระยะเวลาและสถานะดำเนินงานทุกโครงการ แยกตามลูกค้ารายองค์กร',
      PORTFOLIO_GANTT_TOTAL_CUSTOMERS: 'ลูกค้าทั้งหมด',
      PORTFOLIO_GANTT_TOTAL_PROJECTS: 'โครงการทั้งหมด',
      PORTFOLIO_GANTT_ACTIVE: 'กำลังดำเนินงาน',
      PORTFOLIO_GANTT_DELAYED: 'ล่าช้ากว่าแผน',
      PORTFOLIO_GANTT_COMPLETED: 'เสร็จสิ้นแล้ว',
      PORTFOLIO_GANTT_EXPAND_ALL: 'ขยายทั้งหมด',
      PORTFOLIO_GANTT_COLLAPSE_ALL: 'พับทั้งหมด',
      PORTFOLIO_GANTT_VIEW_MONTH: 'รายเดือน',
      PORTFOLIO_GANTT_VIEW_WEEK: 'รายสัปดาห์',
      PORTFOLIO_GANTT_VIEW_DAY: 'รายวัน',
      PORTFOLIO_GANTT_SEARCH_PLACEHOLDER: 'ค้นหาโครงการ, ลูกค้า, หรือ PM...',
      PORTFOLIO_GANTT_CUSTOMER_ALL: 'ทุกลูกค้า (All Customers)',
      PORTFOLIO_GANTT_STATUS_ALL: 'ทุกสถานะ',
      PORTFOLIO_GANTT_LEGEND_ON_TRACK: 'ตามแผนงาน',
      PORTFOLIO_GANTT_LEGEND_DELAYED: 'ล่าช้ากว่ากำหนด',
      PORTFOLIO_GANTT_LEGEND_PLANNING: 'กำลังวางแผน',
      PORTFOLIO_GANTT_LEGEND_COMPLETED: 'เสร็จสิ้น',
      PORTFOLIO_GANTT_NO_DATA: 'ไม่พบข้อมูลโครงการตามเงื่อนไขตัวกรอง',
      PORTFOLIO_GANTT_VIEW_DETAILS: 'ดูรายละเอียดโครงการ',
      PORTFOLIO_GANTT_VIEW_BOARD: 'เปิด Task Board & Phase Gantt',
      PORTFOLIO_GANTT_PROJECTS_COUNT: '{{count}} โครงการ',
    },
    en: {
      CONTEXT_SWITCHER_TITLE: 'Filter & Switch Project',
      CONTEXT_SWITCHER_POPOVER_TITLE: 'Find & Switch Project',
      CONTEXT_SWITCHER_POPOVER_SUBTITLE: 'Filter and select projects',
      CONTEXT_SWITCHER_SELECT_PROMPT: 'Select project / filter...',
      CONTEXT_SWITCHER_CUSTOMER_SELECTED: 'Customer selected (No project selected)',
      CONTEXT_SWITCHER_SELECTED_PROJECT: 'Selected Project',
      CONTEXT_SWITCHER_PROJECTS_SELECTED: 'projects selected',
      CONTEXT_SWITCHER_SEARCH_PLACEHOLDER: 'Search project name, code...',
      CONTEXT_SWITCHER_CUSTOMER_LABEL: 'Customer',
      CONTEXT_SWITCHER_CUSTOMER_SEARCH_PLACEHOLDER: 'Type to search customer...',
      CONTEXT_SWITCHER_CUSTOMER_NOT_FOUND: 'No customers found',
      CONTEXT_SWITCHER_ALL_CUSTOMERS: 'All Customers',
      CONTEXT_SWITCHER_STATUS_LABEL: 'Status',
      CONTEXT_SWITCHER_PRIORITY_LABEL: 'Priority',
      CONTEXT_SWITCHER_MATCHING_PROJECTS: 'Matching Projects',
      CONTEXT_SWITCHER_LOADING_PROJECTS: 'Loading projects...',
      CONTEXT_SWITCHER_NO_MATCHING_PROJECTS: 'No projects match the filter criteria',
      CONTEXT_SWITCHER_CURRENT: 'Current',
      CONTEXT_SWITCHER_SWITCH: 'Switch',
      CONTEXT_SWITCHER_RESET_FILTERS: 'Reset Filters',
      CONTEXT_SWITCHER_CLEAR_CONTEXT: 'Clear Current Context',
      CONTEXT_SWITCHER_CLOSE: 'Close',
      CONTEXT_SWITCHER_SELECT_ALL: 'Select All',
      CONTEXT_SWITCHER_UNSELECT_ALL: 'Deselect All',
      STATUS_ALL: 'All',
      STATUS_PLANNING: 'Planning',
      STATUS_DEVELOPMENT: 'Development',
      STATUS_UAT: 'UAT',
      STATUS_BUG_FIXING: 'Bug Fixing',
      STATUS_DELIVERED: 'Delivered',
      STATUS_CLOSED: 'Closed',
      PRIORITY_ALL: 'All',
      PRIORITY_CRITICAL: 'Critical',
      PRIORITY_HIGH: 'High',
      PRIORITY_MEDIUM: 'Medium',
      PRIORITY_LOW: 'Low',
      PRIORITY_NORMAL: 'Normal',
      PROJECT_HEALTH_WIDGET_TITLE: 'Project Health',
      PROJECT_HEALTH_STATUS_GOOD: 'Good Health',
      PROJECT_HEALTH_STATUS_WARNING: 'Needs Attention',
      PROJECT_HEALTH_STATUS_CRITICAL: 'Critical',
      PROJECT_HEALTH_TOTAL_SCORE: 'Overall Health Score',
      PROJECT_HEALTH_FACTOR_TASKS: 'Task Progress',
      PROJECT_HEALTH_FACTOR_MANDAY: 'Manday Usage (vs Budget)',
      PROJECT_HEALTH_FACTOR_QUALITY: 'Quality & Bug Fixing',
      PROJECT_HEALTH_FACTOR_PHASE: 'Phase Progress',
      PROJECT_HEALTH_FACTOR_TIMELINE: 'Timeline & Schedule Status',
      PROJECT_HEALTH_DETAIL_NO_TASKS: 'No tasks (0/0)',
      PROJECT_HEALTH_DETAIL_TASKS_PROGRESS: 'Tasks completed {{completed}}/{{total}} ({{percent}}%)',
      PROJECT_HEALTH_DETAIL_MANDAY_USAGE: '{{used}} / {{budget}} Manday ({{percent}}%)',
      PROJECT_HEALTH_DETAIL_NO_BUGS: 'Clean, no open bugs (0/0)',
      PROJECT_HEALTH_DETAIL_BUGS_PROGRESS: 'Fixed {{closed}}/{{total}} bugs ({{percent}}%)',
      PROJECT_HEALTH_DETAIL_NO_PHASES: 'No phases (0/0)',
      PROJECT_HEALTH_DETAIL_PHASES_PROGRESS: '{{completed}}/{{total}} Phases ({{percent}}%)',
      PROJECT_HEALTH_DETAIL_ON_SCHEDULE: 'On Schedule',
      PROJECT_HEALTH_DETAIL_DELAYED: 'Behind Schedule',
      PROJECT_HEALTH_DETAIL_COMPLETED: 'Completed as Planned',
      PROJECT_HEALTH_DETAIL_OVERDUE: 'Overdue / Delivery Passed',
      PORTFOLIO_GANTT_TITLE: 'Enterprise Portfolio Roadmap (Gantt Chart)',
      PORTFOLIO_GANTT_SUBTITLE: 'Project timeline and execution status across all enterprise customers',
      PORTFOLIO_GANTT_TOTAL_CUSTOMERS: 'Total Customers',
      PORTFOLIO_GANTT_TOTAL_PROJECTS: 'Total Projects',
      PORTFOLIO_GANTT_ACTIVE: 'Active',
      PORTFOLIO_GANTT_DELAYED: 'Delayed',
      PORTFOLIO_GANTT_COMPLETED: 'Completed',
      PORTFOLIO_GANTT_EXPAND_ALL: 'Expand All',
      PORTFOLIO_GANTT_COLLAPSE_ALL: 'Collapse All',
      PORTFOLIO_GANTT_VIEW_MONTH: 'Month',
      PORTFOLIO_GANTT_VIEW_WEEK: 'Week',
      PORTFOLIO_GANTT_VIEW_DAY: 'Day',
      PORTFOLIO_GANTT_SEARCH_PLACEHOLDER: 'Search project, customer, or PM...',
      PORTFOLIO_GANTT_CUSTOMER_ALL: 'All Customers',
      PORTFOLIO_GANTT_STATUS_ALL: 'All Statuses',
      PORTFOLIO_GANTT_LEGEND_ON_TRACK: 'On Track',
      PORTFOLIO_GANTT_LEGEND_DELAYED: 'Behind Schedule',
      PORTFOLIO_GANTT_LEGEND_PLANNING: 'Planning',
      PORTFOLIO_GANTT_LEGEND_COMPLETED: 'Completed',
      PORTFOLIO_GANTT_NO_DATA: 'No project data found for current filters',
      PORTFOLIO_GANTT_VIEW_DETAILS: 'View Project Details',
      PORTFOLIO_GANTT_VIEW_BOARD: 'Open Task Board & Phase Gantt',
      PORTFOLIO_GANTT_PROJECTS_COUNT: '{{count}} projects',
    },
  };

  private initPromise: Promise<any> | null = null;

  initLanguage(): Promise<any> {
    if (this.initPromise) {
      return this.initPromise;
    }
    this.translate.setTranslation('th', this.defaultTranslations.th, true);
    this.translate.setTranslation('en', this.defaultTranslations.en, true);
    const lang = this.resolveInitialLanguage();
    this.updateHtmlLang(lang);

    this.initPromise = firstValueFrom(this.translate.use(lang)).catch((err) => {
      console.error('Failed to load translations:', err);
      return null;
    });

    return this.initPromise;
  }

  setLanguage(lang: AppLanguage): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, lang);
    }

    this.translate.use(lang);
    this.updateHtmlLang(lang);

    // Reload page to refresh all components and dynamic labels according to chosen language
    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }

  getCurrentLanguage(): AppLanguage {
    const current = this.translate.getCurrentLang();
    return (current === 'th' || current === 'en') ? current : 'en';
  }

  private resolveInitialLanguage(): AppLanguage {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved === 'th' || saved === 'en') return saved;
      const browserLang = navigator.language || '';
      return browserLang.toLowerCase().startsWith('th') ? 'th' : 'en';
    }
    return 'en';
  }

  private updateHtmlLang(lang: AppLanguage): void {
    const html = this.document.documentElement;
    html.lang = lang;
    html.dir = 'ltr';
  }
}