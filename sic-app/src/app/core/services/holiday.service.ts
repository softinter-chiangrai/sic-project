import { Injectable, signal } from '@angular/core';
import type { SicCalendarHoliday } from 'sic-ng';
import dayjs from '../dayjs';

export interface UserLeave {
  id: string;
  userId: string;
  userName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  leaveType: 'vacation' | 'sick' | 'personal' | 'other';
  remark?: string;
}

export interface HolidayInfo {
  isHoliday: boolean;
  isWeekend: boolean;
  name?: string;
  type: 'weekend' | 'public' | 'custom' | 'leave' | 'none';
  color?: string;
  userLeave?: UserLeave;
}

export interface CustomHolidayItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  color?: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root',
})
export class HolidayService {
  private readonly LEAVES_STORAGE_KEY = 'sic_user_leaves';
  private readonly COMPANY_HOLIDAYS_KEY = 'sic_company_holidays';

  readonly leavesChanged = signal(0);

  // รายการวันหยุดนักขัตฤกษ์/ประเพณีไทย (2025, 2026, 2027)
  private readonly thaiPublicHolidays: Record<string, string> = {
    // 2025
    '2025-01-01': 'วันขึ้นปีใหม่',
    '2025-02-12': 'วันมาฆบูชา',
    '2025-04-06': 'วันพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช และวันที่ระลึกมหาจักรีบรมราชวงศ์',
    '2025-04-07': 'วันหยุดชดเชยวันจักรี',
    '2025-04-13': 'วันสงกรานต์',
    '2025-04-14': 'วันสงกรานต์',
    '2025-04-15': 'วันสงกรานต์',
    '2025-04-16': 'วันหยุดชดเชยวันสงกรานต์',
    '2025-05-01': 'วันแรงงานแห่งชาติ',
    '2025-05-04': 'วันฉัตรมงคล',
    '2025-05-05': 'วันหยุดชดเชยวันฉัตรมงคล',
    '2025-05-11': 'วันวิสาขบูชา',
    '2025-05-12': 'วันหยุดชดเชยวันวิสาขบูชา',
    '2025-06-03': 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี',
    '2025-07-10': 'วันอาสาฬหบูชา',
    '2025-07-11': 'วันเข้าพรรษา',
    '2025-07-28': 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว',
    '2025-08-12': 'วันเฉลิมพระชนมพรรษาสมเด็จพระบรมราชชนนีพันปีหลวง และวันแม่แห่งชาติ',
    '2025-10-13': 'วันนวมินทรมหาราช',
    '2025-10-23': 'วันปิยมหาราช',
    '2025-12-05': 'วันคล้ายวันพระบรมราชสมภพ รัชกาลที่ 9 และวันพ่อแห่งชาติ',
    '2025-12-10': 'วันรัฐธรรมนูญ',
    '2025-12-31': 'วันสิ้นปี',

    // 2026
    '2026-01-01': 'วันขึ้นปีใหม่',
    '2026-01-02': 'วันหยุดพิเศษเทศกาลปีใหม่',
    '2026-03-03': 'วันมาฆบูชา',
    '2026-04-06': 'วันจักรี',
    '2026-04-13': 'วันสงกรานต์',
    '2026-04-14': 'วันสงกรานต์',
    '2026-04-15': 'วันสงกรานต์',
    '2026-05-01': 'วันแรงงานแห่งชาติ',
    '2026-05-04': 'วันฉัตรมงคล',
    '2026-05-31': 'วันวิสาขบูชา',
    '2026-06-01': 'วันหยุดชดเชยวันวิสาขบูชา',
    '2026-06-03': 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี',
    '2026-07-28': 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว',
    '2026-07-29': 'วันอาสาฬหบูชา',
    '2026-07-30': 'วันเข้าพรรษา',
    '2026-08-12': 'วันเฉลิมพระชนมพรรษาสมเด็จพระบรมราชชนนีพันปีหลวง และวันแม่แห่งชาติ',
    '2026-10-13': 'วันนวมินทรมหาราช',
    '2026-10-23': 'วันปิยมหาราช',
    '2026-12-05': 'วันคล้ายวันพระบรมราชสมภพ รัชกาลที่ 9 และวันพ่อแห่งชาติ',
    '2026-12-07': 'วันหยุดชดเชยวันพ่อแห่งชาติ',
    '2026-12-10': 'วันรัฐธรรมนูญ',
    '2026-12-31': 'วันสิ้นปี',

    // 2027
    '2027-01-01': 'วันขึ้นปีใหม่',
    '2027-02-21': 'วันมาฆบูชา',
    '2027-02-22': 'วันหยุดชดเชยวันมาฆบูชา',
    '2027-04-06': 'วันจักรี',
    '2027-04-13': 'วันสงกรานต์',
    '2027-04-14': 'วันสงกรานต์',
    '2027-04-15': 'วันสงกรานต์',
    '2027-05-01': 'วันแรงงานแห่งชาติ',
    '2027-05-03': 'วันหยุดชดเชยวันแรงงานแห่งชาติ',
    '2027-05-04': 'วันฉัตรมงคล',
    '2027-05-20': 'วันวิสาขบูชา',
    '2027-06-03': 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าฯ พระบรมราชินี',
    '2027-07-18': 'วันอาสาฬหบูชา',
    '2027-07-19': 'วันเข้าพรรษา / วันหยุดชดเชย',
    '2027-07-28': 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว',
    '2027-08-12': 'วันเฉลิมพระชนมพรรษาสมเด็จพระบรมราชชนนีพันปีหลวง และวันแม่แห่งชาติ',
    '2027-10-13': 'วันนวมินทรมหาราช',
    '2027-10-23': 'วันปิยมหาราช',
    '2027-10-25': 'วันหยุดชดเชยวันปิยมหาราช',
    '2027-12-05': 'วันพ่อแห่งชาติ',
    '2027-12-06': 'วันหยุดชดเชยวันพ่อแห่งชาติ',
    '2027-12-10': 'วันรัฐธรรมนูญ',
    '2027-12-31': 'วันสิ้นปี',
  };

  /**
   * ตรวจสอบว่าวันที่ระบุเป็นวันหยุดหรือไม่ (รวมเสาร์-อาทิตย์, วันหยุดนักขัตฤกษ์, วันหยุดบริษัท)
   */
  checkHoliday(dateInput: string | Date | null | undefined, phaseId?: string): HolidayInfo {
    if (!dateInput) {
      return { isHoliday: false, isWeekend: false, type: 'none' };
    }

    const dStr = typeof dateInput === 'string' ? dateInput.split('T')[0] : dayjs(dateInput).format('YYYY-MM-DD');
    const d = dayjs(dStr);
    if (!d.isValid()) {
      return { isHoliday: false, isWeekend: false, type: 'none' };
    }

    // 1. ตรวจสอบเสาร์-อาทิตย์
    const dayOfWeek = d.day(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 2. ตรวจสอบวันหยุดนักขัตฤกษ์
    if (this.thaiPublicHolidays[dStr]) {
      return {
        isHoliday: true,
        isWeekend,
        name: this.thaiPublicHolidays[dStr],
        type: 'public',
        color: '#ef4444',
      };
    }

    // 3. ตรวจสอบวันหยุดที่กำหนดเอง (Company / Phase Custom Holidays)
    const customHolidays = this.getCustomHolidays(phaseId);
    const customMatch = customHolidays.find((h) => h.date === dStr);
    if (customMatch) {
      return {
        isHoliday: true,
        isWeekend,
        name: customMatch.title,
        type: 'custom',
        color: customMatch.color || '#8b5cf6',
      };
    }

    // 4. ถ้าเป็นวันเสาร์หรืออาทิตย์
    if (isWeekend) {
      return {
        isHoliday: true,
        isWeekend: true,
        name: dayOfWeek === 0 ? 'วันอาทิตย์' : 'วันเสาร์',
        type: 'weekend',
        color: '#f97316',
      };
    }

    return { isHoliday: false, isWeekend: false, type: 'none' };
  }

  /**
   * หาวันทำการถัดไป (ข้ามเสาร์-อาทิตย์ และวันหยุดทั้งหมด)
   */
  getNextWorkday(dateInput: string | Date, phaseId?: string): string {
    let curr = dayjs(typeof dateInput === 'string' ? dateInput.split('T')[0] : dateInput).add(1, 'day');
    while (this.checkHoliday(curr.format('YYYY-MM-DD'), phaseId).isHoliday) {
      curr = curr.add(1, 'day');
    }
    return curr.format('YYYY-MM-DD');
  }

  /**
   * คำนวณวันสิ้นสุดจากจำนวนวันทำงาน (Effort / Working Days)
   * โดยจะเริ่มนับจาก startDate และกระโดดข้ามวันหยุดนักขัตฤกษ์และวันเสาร์-อาทิตย์
   */
  addWorkingDays(startDateInput: string | Date, workingDays: number, phaseId?: string): string {
    if (!startDateInput || workingDays <= 0) return '';
    let curr = dayjs(typeof startDateInput === 'string' ? startDateInput.split('T')[0] : startDateInput);

    // หากวันเริ่มต้นตรงกับวันหยุด ให้เลื่อนไปวันทำการแรก
    while (this.checkHoliday(curr.format('YYYY-MM-DD'), phaseId).isHoliday) {
      curr = curr.add(1, 'day');
    }

    let added = 1; // นับวันแรกเป็นวันทำงานวันที่ 1
    while (added < workingDays) {
      curr = curr.add(1, 'day');
      if (!this.checkHoliday(curr.format('YYYY-MM-DD'), phaseId).isHoliday) {
        added++;
      }
    }

    return curr.format('YYYY-MM-DD');
  }

  /**
   * นับจำนวนวันทำงาน (Working Days) ระหว่าง 2 วันที่
   */
  calculateWorkingDays(
    startDateInput: string | Date,
    endDateInput: string | Date,
    phaseId?: string
  ): { workingDays: number; holidayDays: number; weekendDays: number; totalDays: number } {
    if (!startDateInput || !endDateInput) {
      return { workingDays: 0, holidayDays: 0, weekendDays: 0, totalDays: 0 };
    }

    let start = dayjs(typeof startDateInput === 'string' ? startDateInput.split('T')[0] : startDateInput);
    let end = dayjs(typeof endDateInput === 'string' ? endDateInput.split('T')[0] : endDateInput);

    if (end.isBefore(start)) {
      const temp = start;
      start = end;
      end = temp;
    }

    let workingDays = 0;
    let holidayDays = 0;
    let weekendDays = 0;
    let totalDays = 0;

    let curr = start;
    while (!curr.isAfter(end)) {
      totalDays++;
      const check = this.checkHoliday(curr.format('YYYY-MM-DD'), phaseId);
      if (check.isHoliday) {
        if (check.type === 'weekend') {
          weekendDays++;
        } else {
          holidayDays++;
        }
      } else {
        workingDays++;
      }
      curr = curr.add(1, 'day');
    }

    return { workingDays, holidayDays, weekendDays, totalDays };
  }

  // ==========================================
  // ===== CUSTOM HOLIDAYS MANAGEMENT =========
  // ==========================================

  getCustomHolidays(phaseId?: string): CustomHolidayItem[] {
    const list: CustomHolidayItem[] = [];
    try {
      // 1. Company-wide custom holidays
      const compRaw = localStorage.getItem(this.COMPANY_HOLIDAYS_KEY);
      if (compRaw) {
        const parsed = JSON.parse(compRaw);
        if (Array.isArray(parsed)) list.push(...parsed);
      }

      // 2. Phase-specific custom holidays
      if (phaseId) {
        const phaseRaw = localStorage.getItem(`sic_custom_calendar_items_${phaseId}`);
        if (phaseRaw) {
          const parsed = JSON.parse(phaseRaw);
          if (Array.isArray(parsed)) list.push(...parsed);
        }
      }
    } catch (e) {
      console.error('Failed reading custom holidays', e);
    }
    return list;
  }

  saveCompanyHoliday(item: CustomHolidayItem): void {
    const list = this.getCustomHolidays();
    const existingIdx = list.findIndex((h) => h.id === item.id);
    if (existingIdx >= 0) {
      list[existingIdx] = item;
    } else {
      list.push(item);
    }
    localStorage.setItem(this.COMPANY_HOLIDAYS_KEY, JSON.stringify(list));
  }

  // ==========================================
  // ===== USER LEAVES MANAGEMENT (วันลา) =====
  // ==========================================

  getUserLeaves(userId?: string): UserLeave[] {
    try {
      const raw = localStorage.getItem(this.LEAVES_STORAGE_KEY);
      if (!raw) return [];
      const parsed: UserLeave[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      if (userId) {
        return parsed.filter((l) => l.userId === userId);
      }
      return parsed;
    } catch {
      return [];
    }
  }

  saveUserLeave(leave: UserLeave): void {
    const list = this.getUserLeaves();
    const idx = list.findIndex((l) => l.id === leave.id);
    if (idx >= 0) {
      list[idx] = leave;
    } else {
      list.push(leave);
    }
    localStorage.setItem(this.LEAVES_STORAGE_KEY, JSON.stringify(list));
    this.leavesChanged.update((n) => n + 1);
  }

  deleteUserLeave(leaveId: string): void {
    const list = this.getUserLeaves().filter((l) => l.id !== leaveId);
    localStorage.setItem(this.LEAVES_STORAGE_KEY, JSON.stringify(list));
    this.leavesChanged.update((n) => n + 1);
  }

  /**
   * ตรวจสอบว่าผู้รับผิดชอบ (หลายคน) มีวันลาทับซ้อนกับช่วงเวลาของ Task หรือไม่
   */
  checkUserLeaveConflicts(
    userIds: string[],
    startDateStr?: string,
    endDateStr?: string
  ): { hasConflict: boolean; conflictingLeaves: { leave: UserLeave; userName: string }[] } {
    if (!userIds || userIds.length === 0 || !startDateStr) {
      return { hasConflict: false, conflictingLeaves: [] };
    }

    const tStart = startDateStr.split('T')[0];
    const tEnd = (endDateStr ? endDateStr.split('T')[0] : tStart);

    const allLeaves = this.getUserLeaves();
    const conflicts: { leave: UserLeave; userName: string }[] = [];

    for (const uId of userIds) {
      const userLeaves = allLeaves.filter((l) => l.userId === uId);
      for (const leave of userLeaves) {
        const lStart = leave.startDate;
        const lEnd = leave.endDate || leave.startDate;
        // ตรวจสอบช่วงวันที่ทับซ้อนกัน: max(tStart, lStart) <= min(tEnd, lEnd)
        if (tStart <= lEnd && tEnd >= lStart) {
          conflicts.push({
            leave,
            userName: leave.userName || uId,
          });
        }
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflictingLeaves: conflicts,
    };
  }

  // ==========================================
  // ===== FORMAT FOR SIC-CALENDAR ============
  // ==========================================

  /**
   * รวมวันหยุดทั้งหมดให้อยู่ในฟอร์แมต SicCalendarHoliday สำหรับ SicCalendarComponent
   */
  getAllCalendarHolidays(phaseId?: string): SicCalendarHoliday[] {
    const holidays: SicCalendarHoliday[] = [];

    // 1. วันหยุดนักขัตฤกษ์
    for (const [date, name] of Object.entries(this.thaiPublicHolidays)) {
      holidays.push({
        id: `th-pub-${date}`,
        date,
        title: name,
        source: 'office',
        color: '#ef4444',
        icon: '🎉',
      });
    }

    // 2. Custom Holidays
    const customList = this.getCustomHolidays(phaseId);
    for (const item of customList) {
      holidays.push({
        id: item.id,
        date: item.date,
        title: item.title,
        source: 'office',
        color: item.color || '#8b5cf6',
        icon: item.icon || '📌',
      });
    }

    return holidays;
  }
}
