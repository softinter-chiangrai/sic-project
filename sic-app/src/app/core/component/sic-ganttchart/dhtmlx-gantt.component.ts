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
}

export interface DhtmlxGanttLink {
  id: string;
  source: string;
  target: string;
  type: string;
}

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

  @Output() taskUpdated = new EventEmitter<DhtmlxGanttTask>();
  @Output() taskDeleted = new EventEmitter<string>();
  @Output() taskCreated = new EventEmitter<DhtmlxGanttTask>();

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private isInitialized = false;
  private eventIds: string[] = [];

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // ✅ Config
    gantt.config['date_format'] = '%d-%m-%Y';
    gantt.config['xml_date'] = '%d-%m-%Y';
    gantt.config['scale_unit'] = 'week';
    gantt.config['date_scale'] = '%d %M';
    gantt.config['subscales'] = [
      { unit: 'day', step: 1, date: '%D' }
    ];
    gantt.config['columns'] = [
      { name: 'text', label: 'Task Name', tree: true, width: 200 },
      { name: 'start_date', label: 'Start Date', align: 'center', width: 100 },
      { name: 'end_date', label: 'End Date', align: 'center', width: 100 },
      {
        name: 'progress',
        label: 'Progress',
        align: 'center',
        width: 80,
        template: (task: any) => Math.round(task.progress * 100) + '%'
      }
    ];

    // ✅ Drag & Drop
    gantt.config['readonly'] = false;
    gantt.config['drag_move'] = true;
    gantt.config['drag_resize'] = true;
    gantt.config['drag_progress'] = true;

    // ✅ สีตามโครงสร้างและสถานะ (ใช้ CSS Variables ของธีมหลัก)
    gantt['getTaskColor'] = function(task: any) {
      if (task.color) return task.color;

      const id = String(task.id || '');
      const status = task.status || '';
      const progress = task.progress || 0;

      // ลำดับชั้น Gantt (Phase > Milestone > Work Package > Task)
      if (id.startsWith('phase-')) return 'var(--crm-primary)';
      if (id.startsWith('ms-')) return 'var(--crm-warning)';
      if (id.startsWith('wp-')) return 'var(--crm-secondary)';

      // สถานะ Task ทั่วไป
      if (status === 'Done' || progress === 1) return 'var(--crm-success)';
      if (status === 'Delayed' || status === 'Blocked') return 'var(--crm-danger)';
      if (status === 'In Progress') return 'var(--crm-primary)';
      
      return 'var(--crm-info)';
    };

    // ✅ Tooltip
    gantt.templates['tooltip_text'] = function(start: Date, end: Date, task: any) {
  const format = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };
  return `
    <div style="font-weight:bold; font-size:14px; color:var(--text-active, #111827);">${task.text}</div>
    <div style="display:flex; gap:8px; font-size:12px; color:var(--text-muted, #9ca3af); margin-top:4px;">
      <span>📅 ${format(start)} - ${format(end)}</span>
      <span>📊 ${Math.round(task.progress * 100)}%</span>
    </div>
    ${task.status ? `<div style="font-size:11px; color:var(--crm-primary, #29C296); margin-top:2px;">Status: ${task.status}</div>` : ''}
  `;
};

    // ✅ Task Text (แสดง %)
    gantt.templates['task_text'] = function(_start: Date, _end: Date, task: any) {
      const pct = Math.round((task.progress || 0) * 100);
      return `${task.text} (${pct}%)`;
    };

    // ✅ Progress Text
    gantt.templates['progress_text'] = function(task: any) {
      return `<span style="color:white; font-weight:bold; font-size:11px;">${Math.round(task.progress * 100)}%</span>`;
    };

    // ✅ Grid Row Class
    gantt.templates['grid_row_class'] = function(_start: Date, _end: Date, task: any) {
      if (task.progress === 1) return 'gantt-row-done';
      if (task.status === 'Delayed' || task.status === 'Blocked') return 'gantt-row-delayed';
      if (task.status === 'In Progress') return 'gantt-row-progress';
      return '';
    };

    // ✅ Plugins
    gantt.plugins({
      tooltip: true,
      marker: true
    });

    gantt.init(this.container.nativeElement);
    this.isInitialized = true;
    this.registerEvents();

    if (this.tasks.length > 0) {
      this.renderData();
    }
  }

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
        // ✅ ตรวจสอบว่า task.start_date เป็น Date หรือไม่
        start_date: task.start_date instanceof Date 
          ? this.formatDateToString(task.start_date) 
          : String(task.start_date),
        end_date: task.end_date instanceof Date 
          ? this.formatDateToString(task.end_date) 
          : task.end_date ? String(task.end_date) : undefined,
        duration: task.duration,
        progress: task.progress ?? 0,
        parent: task.parent ? String(task.parent) : undefined,
        color: task.color,
        open: task.open
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
        start_date: task.start_date instanceof Date 
          ? this.formatDateToString(task.start_date) 
          : String(task.start_date),
        end_date: task.end_date instanceof Date 
          ? this.formatDateToString(task.end_date) 
          : task.end_date ? String(task.end_date) : undefined,
        duration: task.duration,
        progress: task.progress ?? 0,
        parent: task.parent ? String(task.parent) : undefined,
        color: task.color,
        open: task.open
      };
      this.taskCreated.emit(created);
      return true;
    });
    this.eventIds.push(evt4);
  }

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

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isInitialized || !this.isBrowser) return;
    if (changes['tasks'] || changes['links']) {
      this.renderData();
    }
  }

  private renderData(): void {
    if (!this.isInitialized || !this.isBrowser) return;

    const data = this.tasks.map(task => ({
      id: task.id,
      text: task.text,
      start_date: this.parseDate(task.start_date),
      end_date: task.end_date ? this.parseDate(task.end_date) : undefined,
      duration: task.duration,
      progress: task.progress ?? 0,
      parent: task.parent || undefined,
      color: task.color || undefined,
      open: true
    }));

    this.autoAdjustScale(data);

    gantt.clearAll();
    gantt.parse({ data, links: this.links || [] });
  }

  private autoAdjustScale(tasks: any[]): void {
    if (!tasks || tasks.length === 0) return;

    let minDate = tasks[0].start_date;
    let maxDate = tasks[0].start_date;

    tasks.forEach((task: any) => {
      const start = task.start_date;
      const end = task.end_date || start;
      if (start < minDate) minDate = start;
      if (end > maxDate) maxDate = end;
    });

    const diffDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > 180) {
      gantt.config['scale_unit'] = 'month';
      gantt.config['date_scale'] = '%F, %Y';
      gantt.config['subscales'] = [
        { unit: 'week', step: 1, date: '%d %M' }
      ];
    } else if (diffDays > 60) {
      gantt.config['scale_unit'] = 'week';
      gantt.config['date_scale'] = '%d %M';
      gantt.config['subscales'] = [
        { unit: 'day', step: 1, date: '%D' }
      ];
    } else {
      gantt.config['scale_unit'] = 'day';
      gantt.config['date_scale'] = '%D, %d %M';
      gantt.config['subscales'] = [
        { unit: 'day', step: 1, date: '%d' }
      ];
    }

    gantt.render();
  }

  refresh(): void {
    if (this.isInitialized && this.isBrowser) {
      this.renderData();
    }
  }

  editTask(taskId: string): void {
    console.log('[Gantt] Edit task:', taskId);
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.isInitialized) {
      this.eventIds.forEach(id => gantt.detachEvent(id));
      this.eventIds = [];
      gantt.destructor();
      this.isInitialized = false;
    }
  }
}