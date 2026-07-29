// dhtmlx-gantt.component.ts
import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
  inject,
  PLATFORM_ID,
  EventEmitter,
  Output,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gantt } from 'dhtmlx-gantt';

export interface DhtmlxGanttTask {
  id: string;
  text: string;
  start_date: string;      // 'DD-MM-YYYY'
  end_date?: string;
  duration?: number;
  progress: number;        // 0-1
  parent?: string;
  color?: string;
  open?: boolean;
  assignedTo?: string;
  assignees?: string;
}

export interface DhtmlxGanttLink {
  id: string;
  source: string;
  target: string;
  type: string;
}

export type GanttViewMode = 'day' | 'week' | 'month';

@Component({
  selector: 'app-dhtmlx-gantt',
  standalone: true,
  templateUrl: './dhtmlx-gantt.component.html',
  styleUrls: ['./dhtmlx-gantt.component.css'],
})
export class DhtmlxGanttComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('ganttContainer', { static: true }) container!: ElementRef;

  @Input() tasks: DhtmlxGanttTask[] = [];
  @Input() links: DhtmlxGanttLink[] = [];
  @Input() projectId?: string;
  @Input() phaseId?: string;
  @Input() isLoading = false;
  @Input() viewMode: GanttViewMode = 'month';

  @Output() taskUpdated = new EventEmitter<DhtmlxGanttTask>();
  @Output() taskDeleted = new EventEmitter<string>();
  @Output() taskCreated = new EventEmitter<DhtmlxGanttTask>();

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private isInitialized = false;
  private eventIds: string[] = [];

  currentMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'

  // ──────────────────────────────────────────────────────────────
  // 1. 生命周期: ngAfterViewInit
  // ──────────────────────────────────────────────────────────────
  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const containerEl = this.container?.nativeElement;
    if (!containerEl) return;

    // หน่วงเวลาเล็กน้อยเพื่อให้ DOM พร้อมและไม่ถูกซ่อน
    setTimeout(() => {
      // ตรวจสอบว่า container ยังอยู่ใน DOM และมีขนาด visible
      if (!containerEl.isConnected || containerEl.offsetParent === null) {
        console.warn('[Gantt] Container not visible, skip init.');
        return;
      }
      this.initializeGantt(containerEl);
    }, 50);
  }

  // ──────────────────────────────────────────────────────────────
  // 2. ตั้งค่า Gantt ครั้งแรก (แยกเป็น method)
  // ──────────────────────────────────────────────────────────────
  private initializeGantt(containerEl: HTMLElement): void {
    // ถ้าเคย init แล้วให้ทำลายทิ้งก่อน (ป้องกัน state ค้าง)
    if (this.isInitialized) {
      this.destroyGantt();
    }

    // กำหนด config ทั้งหมดใหม่
    this.configureGantt();

    // init
    gantt.init(containerEl);
    this.isInitialized = true;

    // ลงทะเบียน events
    this.registerEvents();

    // ถ้ามีข้อมูลให้แสดง
    if (this.tasks.length > 0) {
      this.renderData();
    }
  }

  // ──────────────────────────────────────────────────────────────
  // 3. รวมการตั้งค่า config, templates, plugins (ปรับขนาดให้เล็กลง)
  // ──────────────────────────────────────────────────────────────
  private configureGantt(): void {
    // ✅ รูปแบบวันที่
    gantt.config['date_format'] = '%d-%m-%Y';
    gantt.config['xml_date'] = '%d-%m-%Y';

    // ✅ ตั้งค่า view mode เริ่มต้น
    this.applyViewMode(this.viewMode);

    // ✅ คอลัมน์ (ปรับความกว้างให้เล็กลง)
    gantt.config['columns'] = [
      { name: 'text', label: 'Task Name', tree: true, width: 160 },
      {
        name: 'assignees',
        label: 'Assignee',
        align: 'center',
        width: 100,
        template: (task: any) => task.assignees || task.assignedTo || '-',
      },
      { name: 'start_date', label: 'Start Date', align: 'center', width: 85 },
      { name: 'end_date', label: 'End Date', align: 'center', width: 85 },
      {
        name: 'progress',
        label: 'Progress',
        align: 'center',
        width: 70,
        template: (task: any) => {
          const val = Number(task.progress);
          const pct = isNaN(val) ? 0 : Math.round(val * 100);
          return pct + '%';
        },
      },
    ];

    // ✅ Drag & Drop
    gantt.config['readonly'] = false;
    gantt.config['drag_move'] = true;
    gantt.config['drag_resize'] = true;
    gantt.config['drag_progress'] = true;

    // ✅ ลดความสูงของสเกล
    gantt.config['scale_height'] = 35;

    // ✅ สีตามโครงสร้างและสถานะ (ใช้ CSS Variables)
    gantt['getTaskColor'] = function (task: any) {
      if (task.color) return task.color;

      const id = String(task.id || '');
      const status = task.status || '';
      const progress = task.progress || 0;

      if (id.startsWith('phase-')) return 'var(--crm-primary)';
      if (id.startsWith('ms-')) return 'var(--crm-warning)';
      if (id.startsWith('wp-')) return 'var(--crm-secondary)';

      if (status === 'Done' || progress === 1) return 'var(--crm-success)';
      if (status === 'Delayed' || status === 'Blocked') return 'var(--crm-danger)';
      if (status === 'In Progress') return 'var(--crm-primary)';

      return 'var(--crm-info)';
    };

    // ✅ Tooltip (ปรับขนาดฟอนต์ให้เล็กลง)
    gantt.templates['tooltip_text'] = function (start: Date, end: Date, task: any) {
      const format = (d: Date) => {
        if (!d || isNaN(d.getTime())) return '-';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      };
      const val = Number(task.progress);
      const pct = isNaN(val) ? 0 : Math.round(val * 100);
      const assigneeText = task.assignees || task.assignedTo || 'Unassigned';

      return `
        <div style="font-weight:600; font-size:12px; color:var(--text-active, #111827);">${task.text}</div>
        <div style="display:flex; flex-direction:column; gap:3px; font-size:11px; color:var(--text-muted, #9ca3af); margin-top:3px;">
          <span>👤 ผู้รับผิดชอบ: ${assigneeText}</span>
          <span>📅 ${format(start)} - ${format(end)}</span>
          <span>📊 ความคืบหน้า: ${pct}%</span>
        </div>
        ${task.status ? `<div style="font-size:10px; color:var(--crm-primary, #29C296); margin-top:2px;">Status: ${task.status}</div>` : ''}
      `;
    };

    // ✅ Task Text (ปรับขนาดฟอนต์ให้เล็กลง)
    gantt.templates['task_text'] = function (_start: Date, _end: Date, task: any) {
      const val = Number(task.progress);
      const pct = isNaN(val) ? 0 : Math.round(val * 100);
      const assignee = task.assignees || task.assignedTo;
      const pctText = pct > 0 ? ` (${pct}%)` : '';
      return assignee ? `${task.text} [${assignee}]${pctText}` : `${task.text}${pctText}`;
    };

    // ✅ Progress Text
    gantt.templates['progress_text'] = function (task: any) {
      const val = Number(task.progress);
      const pct = isNaN(val) ? 0 : Math.round(val * 100);
      if (pct <= 0) return '';
      return `<span style="color:white; font-weight:bold; font-size:10px;">${pct}%</span>`;
    };

    // ✅ Grid Row Class
    gantt.templates['grid_row_class'] = function (_start: Date, _end: Date, task: any) {
      if (task.progress === 1) return 'gantt-row-done';
      if (task.status === 'Delayed' || task.status === 'Blocked') return 'gantt-row-delayed';
      if (task.status === 'In Progress') return 'gantt-row-progress';
      return '';
    };

    // ✅ Plugins
    gantt.plugins({
      tooltip: true,
      marker: true,
    });
  }

  // ──────────────────────────────────────────────────────────────
  // 4. ลงทะเบียน Events
  // ──────────────────────────────────────────────────────────────
  private registerEvents(): void {
    const evt1 = gantt.attachEvent('onTaskDblClick', (id) => {
      this.editTask(String(id));
      return true;
    });
    this.eventIds.push(evt1);

    const evt2 = gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
      const updated: DhtmlxGanttTask = {
        id: String(id),
        text: task.text,
        start_date:
          task.start_date instanceof Date
            ? this.formatDateToString(task.start_date)
            : String(task.start_date),
        end_date:
          task.end_date instanceof Date
            ? this.formatDateToString(task.end_date)
            : task.end_date
            ? String(task.end_date)
            : undefined,
        duration: task.duration,
        progress: task.progress ?? 0,
        parent: task.parent ? String(task.parent) : undefined,
        color: task.color,
        open: task.open,
      };
      this.taskUpdated.emit(updated);
      return true;
    });
    this.eventIds.push(evt2);

    const evt3 = gantt.attachEvent('onAfterTaskDelete', (id) => {
      this.taskDeleted.emit(String(id));
      return true;
    });
    this.eventIds.push(evt3);

    const evt4 = gantt.attachEvent('onAfterTaskAdd', (id, task) => {
      const created: DhtmlxGanttTask = {
        id: String(id),
        text: task.text,
        start_date:
          task.start_date instanceof Date
            ? this.formatDateToString(task.start_date)
            : String(task.start_date),
        end_date:
          task.end_date instanceof Date
            ? this.formatDateToString(task.end_date)
            : task.end_date
            ? String(task.end_date)
            : undefined,
        duration: task.duration,
        progress: task.progress ?? 0,
        parent: task.parent ? String(task.parent) : undefined,
        color: task.color,
        open: task.open,
      };
      this.taskCreated.emit(created);
      return true;
    });
    this.eventIds.push(evt4);
  }

  // ──────────────────────────────────────────────────────────────
  // 5. Utility: วันที่
  // ──────────────────────────────────────────────────────────────
  private formatDateToString(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // ──────────────────────────────────────────────────────────────
  // 6. เมื่อ Input เปลี่ยน
  // ──────────────────────────────────────────────────────────────
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isBrowser) return;
    if (!this.isInitialized) return; // ยังไม่ init ให้ข้าม

    if (changes['viewMode']) {
      this.applyViewMode(this.viewMode);
      gantt.render();
    }
    if (changes['tasks'] || changes['links']) {
      this.renderData();
    }
  }

  // ──────────────────────────────────────────────────────────────
  // 7. เปลี่ยนมุมมอง
  // ──────────────────────────────────────────────────────────────
  applyViewMode(mode: GanttViewMode): void {
    this.viewMode = mode;
    if (mode === 'month') {
      gantt.config['scale_unit'] = 'month';
      gantt.config['date_scale'] = '%F %Y';
      gantt.config['subscales'] = [{ unit: 'day', step: 1, date: '%d' }];
      gantt.config['scale_height'] = 35;
    } else if (mode === 'week') {
      gantt.config['scale_unit'] = 'month';
      gantt.config['date_scale'] = '%F %Y';
      gantt.config['subscales'] = [{ unit: 'week', step: 1, date: 'สัปดาห์ที่ %W' }];
      gantt.config['scale_height'] = 35;
    } else {
      gantt.config['scale_unit'] = 'day';
      gantt.config['date_scale'] = '%d %M %Y';
      gantt.config['subscales'] = [{ unit: 'hour', step: 6, date: '%H:00' }];
      gantt.config['scale_height'] = 35;
    }
  }

  setViewMode(mode: GanttViewMode): void {
    if (!this.isInitialized || !this.isBrowser) return;
    this.applyViewMode(mode);
    gantt.render();
  }

  // ──────────────────────────────────────────────────────────────
  // 8. Month Picker
  // ──────────────────────────────────────────────────────────────
  onMonthChange(event: Event): void {
    if (!this.isInitialized || !this.isBrowser) return;
    const val = (event.target as HTMLInputElement).value; // 'YYYY-MM'
    if (!val) return;
    this.currentMonth = val;
    const [year, month] = val.split('-').map(Number);
    const targetDate = new Date(year, month - 1, 1);

    gantt.config.start_date = new Date(year, month - 1, 1);
    gantt.config.end_date = new Date(year, month, 0);
    gantt.render();
    gantt.showDate(targetDate);
  }

  shiftDate(amount: number): void {
    if (!this.isInitialized || !this.isBrowser) return;
    const [year, month] = this.currentMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + amount, 1);
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    this.currentMonth = `${yStr}-${mStr}`;

    gantt.config.start_date = new Date(d.getFullYear(), d.getMonth(), 1);
    gantt.config.end_date = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    gantt.render();
    gantt.showDate(d);
  }

  // ──────────────────────────────────────────────────────────────
  // 9. แสดงข้อมูล
  // ──────────────────────────────────────────────────────────────
  private renderData(): void {
    if (!this.isInitialized || !this.isBrowser) return;

    const data = this.tasks.map((task) => ({
      id: task.id,
      text: task.text,
      start_date: this.parseDate(task.start_date),
      end_date: task.end_date ? this.parseDate(task.end_date) : undefined,
      duration: task.duration,
      progress: isNaN(Number(task.progress)) ? 0 : Number(task.progress),
      parent: task.parent || undefined,
      color: task.color || undefined,
      assignedTo: task.assignedTo || undefined,
      assignees: task.assignees || undefined,
      open: true,
    }));

    // ขยายขอบเขตวันที่
    if (data.length > 0) {
      let min = new Date(data[0].start_date);
      let max = new Date(data[0].start_date);
      data.forEach((t) => {
        if (t.start_date < min) min = new Date(t.start_date);
        const end = t.end_date || t.start_date;
        if (end > max) max = new Date(end);
      });

      const startDate = new Date(min.getFullYear(), min.getMonth() - 1, 1);
      const endDate = new Date(max.getFullYear(), max.getMonth() + 2, 0);
      gantt.config.start_date = startDate;
      gantt.config.end_date = endDate;

      // อัปเดตเดือนปัจจุบัน
      const yStr = min.getFullYear();
      const mStr = String(min.getMonth() + 1).padStart(2, '0');
      this.currentMonth = `${yStr}-${mStr}`;
    } else {
      gantt.config.start_date = undefined;
      gantt.config.end_date = undefined;
    }

    gantt.clearAll();
    gantt.parse({ data, links: this.links || [] });
    if (data.length > 0) {
      gantt.showDate(data[0].start_date);
    }
  }

  refresh(): void {
    if (this.isInitialized && this.isBrowser) {
      this.renderData();
    }
  }

  editTask(taskId: string): void {
    console.log('[Gantt] Edit task:', taskId);
  }

  // ──────────────────────────────────────────────────────────────
  // 10. ทำลาย instance อย่างสมบูรณ์
  // ──────────────────────────────────────────────────────────────
  private destroyGantt(): void {
    if (this.isBrowser && this.isInitialized) {
      this.eventIds.forEach((id) => gantt.detachEvent(id));
      this.eventIds = [];
      gantt.destructor();
      this.isInitialized = false;

      // ล้าง container เพื่อป้องกัน残留 DOM
      const containerEl = this.container?.nativeElement;
      if (containerEl) {
        containerEl.innerHTML = '';
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyGantt();
  }
}