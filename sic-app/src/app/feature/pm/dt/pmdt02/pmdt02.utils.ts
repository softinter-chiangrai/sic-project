// src/app/feature/pm/dt/pmdt02/pmdt02.utils.ts

import type {
  PhaseResponse,
  MilestoneResponse,
  WorkPackageResponse,
  TaskResponse,
} from '../../../../core/model/phase.model';
import type { DhtmlxGanttTask } from '../../../../core/component/sic-ganttchart/dhtmlx-gantt.component';
import type { SicCalendarTimelineRow, SicCalendarEvent, SicCalendarHoliday } from 'sic-ng';
import dayjs from '../../../../core/dayjs';

// ===== Helper: คำนวณ progress ของ Task จาก status (ไม่มี progress หรือ percent) =====
function calculateTaskProgress(task: TaskResponse): number {
  // ใช้ status เท่านั้น เพราะ TaskResponse ไม่มี progress หรือ percent
  const status = task.status || '';
  if (status === 'Done' || status === 'Closed') return 1;
  if (status === 'In Progress' || status === 'Waiting Review' || status === 'Waiting Fix' || status === 'Review') return 0.5;
  return 0;
}

// ===== Helper: คำนวณ progress ของ Work Package จาก Tasks ข้างใน =====
function calculateWpProgress(wp: WorkPackageResponse): number {
  if (!wp.tasks || wp.tasks.length === 0) return 0;
  const total = wp.tasks.reduce((sum, t) => sum + calculateTaskProgress(t), 0);
  return total / wp.tasks.length; // ค่า 0-1
}

// ===== ฟังก์ชันเก่า (ยังคงไว้เผื่อใช้ที่อื่น) =====
export function buildGanttTasks(phase: PhaseResponse): DhtmlxGanttTask[] {
  const result: DhtmlxGanttTask[] = [];

  // Phase
  const phaseProgress = isNaN(phase.progress) ? 0 : phase.progress / 100;
  result.push({
    id: `phase-${phase.id}`,
    text: `📍 ${phase.phaseName}`,
    start_date: formatDateForDhtmlx(phase.startDate),
    end_date: formatDateForDhtmlx(phase.endDate),
    progress: phaseProgress,
    assignedTo: phase.owner || '-',
    assignees: phase.owner || '-',
    open: true,
    color: phase.color || undefined,
  });

  // Milestones
  phase.milestones?.forEach((ms) => {
    const msId = `ms-${ms.id}`;
    result.push({
      id: msId,
      text: `📌 ${ms.milestoneName}`,
      start_date: formatDateForDhtmlx(ms.dueDate),
      end_date: formatDateForDhtmlx(ms.dueDate),
      progress: ms.status === 'Done' ? 1 : 0.5,
      parent: `phase-${phase.id}`,
      color: ms.color || undefined,
    });

    // Work Packages
    ms.workPackages?.forEach((wp) => {
      const wpId = `wp-${wp.id}`;
      if (wp.startDate && wp.endDate) {
        const wpProgress = calculateWpProgress(wp);
        result.push({
          id: wpId,
          text: `📦 ${wp.packageName}`,
          start_date: formatDateForDhtmlx(wp.startDate),
          end_date: formatDateForDhtmlx(wp.endDate),
          progress: isNaN(wpProgress) ? 0 : wpProgress,
          parent: msId,
          color: wp.color || undefined,
        });
      }

      // Tasks
      wp.tasks?.forEach((task) => {
        if (task.startDate) {
          const taskProgress = calculateTaskProgress(task);
          let assigneesText = '';
          if (task.assigneeNames) {
            if (Array.isArray(task.assigneeNames)) {
              assigneesText = task.assigneeNames.filter(Boolean).join(', ');
            } else if (typeof task.assigneeNames === 'object') {
              assigneesText = Object.values(task.assigneeNames).filter(Boolean).join(', ');
            }
          }
          if (!assigneesText) {
            assigneesText = task.assignedTo || '-';
          }
          result.push({
            id: task.id,
            text: `🔹 ${task.taskName}`,
            start_date: formatDateForDhtmlx(task.startDate),
            end_date: task.endDate ? formatDateForDhtmlx(task.endDate) : formatDateForDhtmlx(task.startDate),
            progress: taskProgress,
            parent: `wp-${wp.id}`,
            assignedTo: task.assignedTo || '-',
            assignees: assigneesText,
            color: task.color || undefined,
          });
        }
      });
    });
  });

  return result;
}

// ===== ฟังก์ชันใหม่สำหรับ SicCalendarTimeline =====
export function buildTimelineItems(phase: PhaseResponse): SicCalendarTimelineRow[] {
  const rows: SicCalendarTimelineRow[] = [];

  // 1. Phase row
  rows.push({
    id: `phase-${phase.id}`,
    label: `📌 ${phase.phaseName}`,
    progress: phase.progress, // Phase มี progress โดยตรง
    phases: [{
      id: phase.id,
      label: phase.phaseName,
      start: phase.startDate,
      end: phase.endDate,
      color: phase.color || '#4A90D9'
    }],
    data: { type: 'phase', id: phase.id }
  });

  // 2. Milestones, Work Packages, Tasks
  phase.milestones?.forEach((ms) => {
    rows.push({
      id: `ms-${ms.id}`,
      label: `  📍 ${ms.milestoneName}`,
      progress: ms.status === 'Done' ? 100 : 0,
      phases: [{
        id: ms.id,
        label: ms.milestoneName,
        start: ms.dueDate,
        end: ms.dueDate,
        color: ms.color || '#E67E22'
      }],
      data: { type: 'milestone', id: ms.id, phaseId: phase.id }
    });

    ms.workPackages?.forEach((wp) => {
      const wpProgress = calculateWpProgress(wp) * 100; // แปลงเป็นเปอร์เซ็นต์
      rows.push({
        id: `wp-${wp.id}`,
        label: `    📦 ${wp.packageName}`,
        progress: wpProgress,
        phases: [{
          id: wp.id,
          label: wp.packageName,
          start: wp.startDate,
          end: wp.endDate,
          color: wp.color || '#8E44AD'
        }],
        data: { type: 'workpackage', id: wp.id, milestoneId: ms.id, phaseId: phase.id }
      });

      wp.tasks?.forEach((task) => {
        const taskProgress = calculateTaskProgress(task) * 100; // แปลงเป็นเปอร์เซ็นต์
        rows.push({
          id: task.id,
          label: `      🔹 ${task.taskName}`,
          progress: taskProgress,
          phases: [{
            id: task.id,
            label: task.taskName,
            start: task.startDate,
            end: task.endDate || task.startDate,
            color: task.color || '#2ECC71'
          }],
          data: { type: 'task', id: task.id, workPackageId: wp.id, milestoneId: ms.id, phaseId: phase.id }
        });
      });
    });
  });

  return rows;
}

// ===== Helper functions =====
function formatDateForDhtmlx(dateStr: string | undefined): string {
  if (!dateStr) return '01-01-2024';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// ===== Helper: ดึง Icon & Color ประจำ Task ตาม Status =====
function getTaskVisuals(task: TaskResponse): { icon: string; color: string } {
  if (task.color) {
    return { icon: '🔹', color: task.color };
  }
  switch (task.status) {
    case 'Done':
    case 'Closed':
      return { icon: '✅', color: '#22c55e' };
    case 'In Progress':
      return { icon: '👥', color: '#3b82f6' };
    case 'Waiting Review':
      return { icon: '🔍', color: '#06b6d4' };
    case 'Waiting Fix':
      return { icon: '🛠️', color: '#f59e0b' };
    case 'Blocked':
      return { icon: '⛔', color: '#ef4444' };
    default:
      return { icon: '📝', color: '#8b5cf6' };
  }
}

// ===== ฟังก์ชันสร้าง Events สำหรับ SicCalendar =====
export function buildCalendarEvents(phase: PhaseResponse): SicCalendarEvent[] {
  const events: SicCalendarEvent[] = [];

  // Helper เพื่อเพิ่ม Event ทุกๆ วันในช่วง startDate ถึง endDate
  const addMultiDayEvent = (
    baseId: string,
    startDateStr: string,
    endDateStr: string | undefined,
    title: string,
    color: string,
    icon: string,
    description: string,
    extra: any
  ) => {
    if (!startDateStr) return;
    const cleanStart = startDateStr.split('T')[0];
    const cleanEnd = endDateStr ? endDateStr.split('T')[0] : cleanStart;
    const start = dayjs.utc(cleanStart);
    const end = dayjs.utc(cleanEnd);
    const days = Math.max(1, end.diff(start, 'day') + 1);

    for (let i = 0; i < days; i++) {
      const currentDate = start.add(i, 'day').format('YYYY-MM-DD');
      events.push({
        id: `${baseId}-${i}`,
        date: currentDate,
        title,
        color,
        icon,
        description,
        extra,
      } as SicCalendarEvent & { extra?: any });
    }
  };

  // 1. Phase
  if (phase.startDate) {
    addMultiDayEvent(
      `phase-${phase.id}`,
      phase.startDate,
      phase.endDate,
      phase.phaseName,
      phase.color || '#3b82f6',
      '🚩',
      phase.description || `Phase: ${phase.phaseName}`,
      { type: 'phase', id: phase.id }
    );
  }

  // 2. Milestones, Work Packages, Tasks
  phase.milestones?.forEach((ms) => {
    if (ms.dueDate) {
      addMultiDayEvent(
        `ms-${ms.id}`,
        ms.dueDate,
        ms.dueDate,
        ms.milestoneName,
        ms.color || '#eab308',
        '📌',
        ms.description || `Milestone: ${ms.milestoneName}`,
        { type: 'milestone', id: ms.id, phaseId: phase.id }
      );
    }

    ms.workPackages?.forEach((wp) => {
      if (wp.startDate) {
        addMultiDayEvent(
          `wp-${wp.id}`,
          wp.startDate,
          wp.endDate,
          wp.packageName,
          wp.color || '#a855f7',
          '📦',
          wp.description || `Work Package: ${wp.packageName}`,
          { type: 'workpackage', id: wp.id, milestoneId: ms.id, phaseId: phase.id }
        );
      }

      wp.tasks?.forEach((task) => {
        if (task.startDate) {
          const visuals = getTaskVisuals(task);
          const descParts: string[] = [];
          if (task.assignedTo) descParts.push(`ผู้รับผิดชอบ: ${task.assignedTo}`);
          if (task.status) descParts.push(`สถานะ: ${task.status}`);
          if (task.description) descParts.push(task.description);

          addMultiDayEvent(
            `task-${task.id}`,
            task.startDate,
            task.endDate || task.startDate,
            task.taskName,
            visuals.color,
            visuals.icon,
            descParts.join(' | ') || `Task: ${task.taskName}`,
            { type: 'task', id: task.id, workPackageId: wp.id, milestoneId: ms.id, phaseId: phase.id }
          );
        }
      });
    });
  });

  return events;
}

// ===== ฟังก์ชันสร้าง Holidays สำหรับ SicCalendar =====
export function buildCalendarHolidays(phase: PhaseResponse): SicCalendarHoliday[] {
  // ไม่แปลง Milestone เป็นวันหยุดออฟฟิศ เพื่อไม่ให้เกิดข้อมูลซ้ำซ้อนหรือขึ้นเป็นวันหยุดออฟฟิศ
  return [];
}