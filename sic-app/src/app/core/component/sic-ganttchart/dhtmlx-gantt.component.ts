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

// ============================================================
// 1. Public Interface (ใช้กับ @Input / @Output)
//    ข้อมูลเป็น string format 'DD-MM-YYYY'
// ============================================================
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

// ============================================================
// 2. Internal Interface (ใช้ภายใน Component เมื่อรับจาก DHTMLX)
//    DHTMLX ใช้ Date, id/parent เป็น string|number
// ============================================================
export interface GanttTaskInternal {
  id: string | number;
  text: string;
  start_date: Date;
  end_date?: Date;
  duration?: number;
  progress: number;
  parent?: string | number;
  color?: string;
  open?: boolean;
}

// ============================================================
// 3. Helper Functions
// ============================================================

/** แปลง Date → string 'DD-MM-YYYY' */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/** แปลง string 'DD-MM-YYYY' → Date */
function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// ============================================================
// 4. Component
// ============================================================

@Component({
  selector: 'app-dhtmlx-gantt',
  standalone: true,
  template: `<div #ganttContainer class="dhtmlx-gantt-container"></div>`,
  styles: [`
    .dhtmlx-gantt-container {
      width: 100%;
      height: 500px;
    }
    :host {
      display: block;
      width: 100%;
    }
  `]
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

    // ✅ Color
    gantt['getTaskColor'] = function(task: any, _row: any, _column: any) {
      if (task.color) return task.color;
      const progress = task.progress || 0;
      if (progress === 1) return '#4CAF50';
      if (progress >= 0.5) return '#FF9800';
      return '#2196F3';
    };

    // ✅ Tooltip (ใช้ formatDate)
    gantt.templates['tooltip_text'] = function(start: Date, end: Date, task: any) {
      const startStr = formatDate(start);
      const endStr = formatDate(end);
      return `<b>${task.text}</b><br/>Start: ${startStr}<br/>End: ${endStr}<br/>Progress: ${Math.round(task.progress * 100)}%`;
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

  // ============================================================
  // 5. Event Registration (ใช้ Internal Interface)
  // ============================================================

  private registerEvents(): void {
    // 5.1 Double-click
    const evt1 = gantt.attachEvent('onTaskDblClick', (id: string | number) => {
      this.editTask(String(id));
      return true;
    });
    this.eventIds.push(evt1);

    // 5.2 After Update
    const evt2 = gantt.attachEvent('onAfterTaskUpdate', (id: string | number, task: GanttTaskInternal) => {
      const updated: DhtmlxGanttTask = {
        id: String(id),
        text: task.text,
        start_date: formatDate(task.start_date),
        end_date: task.end_date ? formatDate(task.end_date) : undefined,
        duration: task.duration,
        progress: task.progress,
        parent: task.parent ? String(task.parent) : undefined,
        color: task.color,
        open: task.open
      };
      this.taskUpdated.emit(updated);
      return true;
    });
    this.eventIds.push(evt2);

    // 5.3 After Delete
    const evt3 = gantt.attachEvent('onAfterTaskDelete', (id: string | number) => {
      this.taskDeleted.emit(String(id));
      return true;
    });
    this.eventIds.push(evt3);

    // 5.4 After Add
    const evt4 = gantt.attachEvent('onAfterTaskAdd', (id: string | number, task: GanttTaskInternal) => {
      const created: DhtmlxGanttTask = {
        id: String(id),
        text: task.text,
        start_date: formatDate(task.start_date),
        end_date: task.end_date ? formatDate(task.end_date) : undefined,
        duration: task.duration,
        progress: task.progress || 0,
        parent: task.parent ? String(task.parent) : undefined,
        color: task.color,
        open: task.open
      };
      this.taskCreated.emit(created);
      return true;
    });
    this.eventIds.push(evt4);
  }

  // ============================================================
  // 6. Lifecycle
  // ============================================================

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isInitialized || !this.isBrowser) return;
    if (changes['tasks'] || changes['links']) {
      this.renderData();
    }
  }

  // ============================================================
  // 7. Render Data (แปลง Input → Internal)
  // ============================================================

  private renderData(): void {
    if (!this.isInitialized || !this.isBrowser) return;

    // แปลง Input tasks (string) → internal (Date)
    const data = this.tasks.map(task => ({
      id: task.id,
      text: task.text,
      start_date: parseDate(task.start_date),
      end_date: task.end_date ? parseDate(task.end_date) : undefined,
      duration: task.duration,
      progress: task.progress || 0,
      parent: task.parent || undefined,
      color: task.color || undefined,
      open: true
    }));

    this.autoAdjustScale(data);

    gantt.clearAll();
    gantt.parse({ data, links: this.links || [] });
  }

  // ============================================================
  // 8. Auto Adjust Scale
  // ============================================================

  private autoAdjustScale(tasks: GanttTaskInternal[]): void {
    if (!tasks || tasks.length === 0) return;

    let minDate = tasks[0].start_date;
    let maxDate = tasks[0].start_date;

    tasks.forEach(task => {
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

  // ============================================================
  // 9. Public Methods
  // ============================================================

  refresh(): void {
    if (this.isInitialized && this.isBrowser) {
      this.renderData();
    }
  }

  editTask(taskId: string): void {
    console.log('[Gantt] Edit task:', taskId);
  }

  // ============================================================
  // 10. Cleanup
  // ============================================================

  ngOnDestroy(): void {
    if (this.isBrowser && this.isInitialized) {
      this.eventIds.forEach(id => gantt.detachEvent(id));
      this.eventIds = [];
      gantt.destructor();
      this.isInitialized = false;
    }
  }
}