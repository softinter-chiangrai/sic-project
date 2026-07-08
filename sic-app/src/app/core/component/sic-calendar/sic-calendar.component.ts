// src/app/core/component/sic-calendar/sic-calendar.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Dayjs } from 'dayjs';
import type { Subscription } from 'rxjs';
import dayjs from '../../dayjs';
import { DateTimeUtil, type CalendarEra } from '../../utils/datetime.util';
import { DialogService } from '../../services/dialog.service';
import { SicButtonComponent } from '../sic-button/sic-button.component';
import { SicColorpickerComponent } from '../sic-colorpicker/sic-colorpicker.component';
import { SicInputComponent } from '../sic-input/sic-input.component';
import { SicInputAreaComponent } from '../sic-input-area/sic-input-area.component';

// ===== NEW INTERFACE =====
export interface CalendarItem {
  id: string;
  type: 'phase' | 'milestone' | 'workpackage' | 'task' | 'other';
  title: string;
  color: string;
  date: string;
  completed?: boolean;
  extra?: Record<string, any>;
}

// ===== EXISTING TASK INTERFACE (keep for backward compatibility) =====
export interface SicCalendarTask {
  id: string;
  title: string;
  date: string;
  description?: string;
  color?: string;
  completed?: boolean;
}

export interface SicCalendarViewRange {
  startDate: string;
  endDate: string;
  currentMonth: string;
}

type TaskDraftPayload = {
  title: string;
  description?: string;
  color: string;
};

// Task Dialog Component (unchanged)
@Component({
  selector: 'sic-calendar-task-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SicInputComponent, SicInputAreaComponent, SicColorpickerComponent, SicButtonComponent],
  template: `
    <div
      class="w-[min(92vw,30rem)] overflow-hidden rounded-2xl border bg-[var(--bg)] text-[var(--text)] shadow-2xl"
      style="border-color: var(--border);"
    >
      <div class="border-b px-5 py-4" style="border-color: var(--border);">
        <div class="text-base font-semibold text-[var(--text-active)]">Add Task</div>
        <div class="mt-1 text-sm text-[var(--text-muted)]">{{ dateLabel }}</div>
      </div>

      <div class="space-y-3 px-5 py-4">
        <sic-input
          label="Task title"
          [required]="true"
          [(ngModel)]="title"
          [ngModelOptions]="{ standalone: true }">
        </sic-input>

        <sic-input-area
          label="Task detail"
          [rows]="4"
          [(ngModel)]="description"
          [ngModelOptions]="{ standalone: true }">
        </sic-input-area>

        <sic-colorpicker
          label="Task color"
          [(ngModel)]="color"
          [ngModelOptions]="{ standalone: true }">
        </sic-colorpicker>
      </div>

      <div class="flex justify-end gap-2 border-t px-5 py-4" style="border-color: var(--border);">
        <sic-button variant="secondary" size="sm" (click)="cancel()">Cancel</sic-button>
        <sic-button variant="primary" size="sm" [disabled]="!canSave" (click)="save()">Add Task</sic-button>
      </div>
    </div>
  `,
})
class SicCalendarTaskDialog implements OnInit {
  @Input({ required: true }) dateLabel = '';
  @Input({ required: true }) onSave!: (payload: TaskDraftPayload) => void;
  @Input() initialColor = '#4ECDC4';

  title = '';
  description = '';
  color = '#4ECDC4';

  constructor(private readonly dialogService: DialogService) {}

  ngOnInit(): void {
    this.color = this.initialColor || '#4ECDC4';
  }

  get canSave(): boolean {
    return this.title.trim().length > 0;
  }

  save(): void {
    if (!this.canSave) return;
    this.onSave({
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      color: this.color.trim() || '#4ECDC4',
    });
    this.dialogService.close(true);
  }

  cancel(): void {
    this.dialogService.close(false);
  }
}

@Component({
  selector: 'sic-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sic-calendar.component.html',
  styleUrl: './sic-calendar.component.css',
  host: { ngSkipHydration: 'true' },
})
export class SicCalendarComponent implements OnInit, OnDestroy, OnChanges {
  // ===== INPUTS =====
  @Input() label?: string;
  @Input() tasks: SicCalendarTask[] = [];
  @Input() items: CalendarItem[] = [];                 // NEW: ข้อมูลแบบรวม
  @Input() mode: 'view' | 'edit' = 'edit';             // NEW: view = แสดงอย่างเดียว, edit = เปิด dialog เพิ่ม task
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() hint?: string;
  @Input() minDate?: Date | string | null;
  @Input() maxDate?: Date | string | null;
  @Input() emptyStateTitle = 'No tasks for this day';
  @Input() emptyStateDescription = 'Pick a day and add your first task.';

  // ===== OUTPUTS =====
  @Output() tasksChange = new EventEmitter<SicCalendarTask[]>();
  @Output() taskAdded = new EventEmitter<SicCalendarTask>();
  @Output() taskRemoved = new EventEmitter<SicCalendarTask>();
  @Output() taskSelected = new EventEmitter<string>();
  @Output() viewRangeChange = new EventEmitter<SicCalendarViewRange>();
  @Output() itemClick = new EventEmitter<CalendarItem>();   // NEW: คลิกรายการในวัน
  @Output() dateClick = new EventEmitter<Dayjs>();          // NEW: คลิกวันที่ (เฉพาะ mode='view')

  @HostBinding('class.sic-calendar-host') readonly hostClass = true;

  // ===== STATE =====
  selectedDate: Dayjs;
  currentViewDate: Dayjs;
  calendarDays: Dayjs[] = [];
  weekDays: string[] = [];
  weekDaysFull: string[] = [];
  isWideScreen = false;
  monthNames: string[] = [];
  years: number[] = [];
  yearViewOpen = false;
  monthViewOpen = false;

  private tasksInternal: SicCalendarTask[] = [];
  private languageChangeSubscription: Subscription | null = null;
  private era: CalendarEra = DateTimeUtil.getDefaults().era;
  private offset = DateTimeUtil.getDefaults().offset;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly dialogService: DialogService,
  ) {
    this.isWideScreen = typeof window !== 'undefined' && window.innerWidth >= 768;
    const now = this.createLocalizedDay();
    this.selectedDate = now;
    this.currentViewDate = now;
    this.generateWeekDays();
    this.generateMonthNames();
    this.generateYears();
    this.generateCalendar();
  }

  ngOnInit(): void {
    this.syncTasks(this.tasks);
    this.languageChangeSubscription = DateTimeUtil.onEraChange().subscribe(() => {
      this.era = DateTimeUtil.getDefaults().era;
      this.offset = DateTimeUtil.getDefaults().offset;
      this.selectedDate = this.selectedDate.locale(this.resolveLocale(this.era));
      this.currentViewDate = this.currentViewDate.locale(this.resolveLocale(this.era));
      this.generateWeekDays();
      this.generateMonthNames();
      this.generateYears();
      this.generateCalendar();
      this.emitViewRangeChange();
      this.cdr.markForCheck();
    });
    this.emitViewRangeChange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasks']) {
      this.syncTasks(this.tasks);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isWideScreen = window.innerWidth >= 768;
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.languageChangeSubscription?.unsubscribe();
  }

  // ===== GETTERS =====
  get selectedDateLabel(): string {
    return this.selectedDate.format(this.normalizeYearFormat('D MMMM YYYY'));
  }

  get selectedTasks(): SicCalendarTask[] {
    return this.getTasksForDate(this.selectedDate);
  }

  get totalTaskCount(): number {
    return this.tasksInternal.length;
  }

  get visibleRangeStart(): Dayjs {
    return this.currentViewDate.startOf('month').startOf('week');
  }

  get visibleRangeEnd(): Dayjs {
    return this.currentViewDate.endOf('month').endOf('week');
  }

  getMonthYearLabel(): string {
    return this.currentViewDate.format(this.normalizeYearFormat('MMM YYYY')).toUpperCase();
  }

  get currentYearLabel(): string {
    return this.currentViewDate.format(this.normalizeYearFormat('YYYY'));
  }

  getYearRangeLabel(): string {
    if (!this.years.length) return '';
    const lastYear = this.years.at(-1);
    if (lastYear === undefined) return '';
    return `${this.getDisplayYear(this.years[0])} - ${this.getDisplayYear(lastYear)}`;
  }

  // ===== NAVIGATION =====
  previousMonth(): void {
    this.currentViewDate = this.currentViewDate.subtract(1, 'month');
    this.generateYears();
    this.generateCalendar();
    this.emitViewRangeChange();
  }

  nextMonth(): void {
    this.currentViewDate = this.currentViewDate.add(1, 'month');
    this.generateYears();
    this.generateCalendar();
    this.emitViewRangeChange();
  }

  // ===== DATE SELECTION =====
  selectDate(date: Dayjs): void {
    if (this.disabled || this.isDateDisabled(date)) return;

    const changedMonth = !date.isSame(this.currentViewDate, 'month');
    this.selectedDate = date;
    this.currentViewDate = date;
    this.taskSelected.emit(date.toISOString());

    if (changedMonth) {
      this.generateYears();
      this.generateCalendar();
      this.emitViewRangeChange();
    }

    if (this.mode === 'edit') {
      this.openAddTaskDialog();             // เปิด dialog เพิ่ม task (แบบเดิม)
    } else {
      this.dateClick.emit(date);            // mode='view' ส่ง event ไปให้ parent
    }
  }

  // ===== ITEM CLICK =====
  onItemClick(item: CalendarItem, event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.itemClick.emit(item);
  }

  // ===== YEAR / MONTH PICKER =====
  toggleYearView(): void {
    if (this.disabled) return;
    this.yearViewOpen = !this.yearViewOpen;
    if (this.yearViewOpen) {
      this.monthViewOpen = false;
      this.generateYears();
    }
  }

  closePickerOverlay(): void {
    this.yearViewOpen = false;
    this.monthViewOpen = false;
  }

  selectYear(year: number): void {
    if (this.disabled) return;
    this.currentViewDate = this.currentViewDate.year(year);
    this.yearViewOpen = false;
    this.monthViewOpen = true;
    this.generateYears();
    this.generateCalendar();
  }

  selectMonth(month: number): void {
    if (this.disabled) return;
    this.currentViewDate = this.currentViewDate.month(month);
    this.monthViewOpen = false;
    this.generateYears();
    this.generateCalendar();
    this.emitViewRangeChange();
  }

  onMonthSelectionChange(value: number | string): void {
    if (this.disabled) return;
    const monthIndex = Number(value);
    if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return;
    this.currentViewDate = this.currentViewDate.month(monthIndex);
    this.generateYears();
    this.generateCalendar();
    this.emitViewRangeChange();
  }

  onYearSelectionChange(value: number | string): void {
    if (this.disabled) return;
    const year = Number(value);
    if (!Number.isInteger(year)) return;
    this.currentViewDate = this.currentViewDate.year(year);
    this.generateYears();
    this.generateCalendar();
    this.emitViewRangeChange();
  }

  goToToday(): void {
    const today = this.createLocalizedDay();
    this.selectedDate = today;
    this.currentViewDate = today;
    this.generateYears();
    this.generateCalendar();
    this.emitViewRangeChange();
  }

  // ===== ADD TASK DIALOG (เดิม) =====
  openAddTaskDialog(): void {
    if (this.readonly || this.disabled) return;

    this.dialogService.open({
      type: 'confirm',
      component: SicCalendarTaskDialog,
      componentInputs: {
        dateLabel: this.selectedDateLabel,
        initialColor: '#4ECDC4',
        onSave: (payload: TaskDraftPayload) => {
          const newTask: SicCalendarTask = {
            id: this.generateId(),
            title: payload.title,
            description: payload.description,
            color: payload.color,
            completed: false,
            date: this.selectedDate.startOf('day').toISOString(),
          };
          this.tasksInternal = [...this.tasksInternal, newTask];
          this.emitTasks();
          this.taskAdded.emit({ ...newTask });
        },
      },
    });
  }

  removeTask(taskId: string): void {
    const removed = this.tasksInternal.find((task) => task.id === taskId);
    if (!removed) return;
    this.tasksInternal = this.tasksInternal.filter((task) => task.id !== taskId);
    this.emitTasks();
    this.taskRemoved.emit({ ...removed });
  }

  toggleTaskCompletion(taskId: string): void {
    this.tasksInternal = this.tasksInternal.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
    this.emitTasks();
  }

  clearTasks(): void {
    if (this.disabled || this.readonly) return;
    this.tasksInternal = [];
    this.emitTasks();
  }

  // ===== ฟังก์ชันสำหรับแสดงข้อมูลในวัน =====
  // ใช้รวมทั้ง tasks และ items ที่ส่งเข้ามา
  getItemsForDate(date: Dayjs): CalendarItem[] {
    const fromTasks: CalendarItem[] = this.tasksInternal
      .filter((task) => this.isTaskOnDate(task, date))
      .map((task) => ({
        id: task.id,
        type: 'task',
        title: task.title,
        color: task.color || '#4ECDC4',
        date: task.date,
        completed: task.completed || false,
      }));

    const fromItems = this.items.filter((item) => {
      const itemDate = dayjs.utc(item.date).utcOffset(this.offset).locale(this.resolveLocale(this.era));
      return itemDate.isValid() && itemDate.isSame(date, 'day');
    });

    // รวมและเรียงตาม title
    return [...fromTasks, ...fromItems].sort((a, b) => a.title.localeCompare(b.title));
  }

  getVisibleItemsForDate(date: Dayjs): CalendarItem[] {
    return this.getItemsForDate(date).slice(0, 3);
  }

  getOverflowItemCount(date: Dayjs): number {
    const total = this.getItemsForDate(date).length;
    return total > 3 ? total - 3 : 0;
  }

  // ฟังก์ชันเก่าที่ใช้เฉพาะ task (ยังคงไว้)
  taskCountForDate(date: Dayjs): number {
    return this.getTasksForDate(date).length;
  }

  hasTasks(date: Dayjs): boolean {
    return this.taskCountForDate(date) > 0;
  }

  isToday(date: Dayjs): boolean {
    return date.isSame(this.createLocalizedDay(), 'day');
  }

  isSelected(date: Dayjs): boolean {
    return date.isSame(this.selectedDate, 'day');
  }

  isCurrentMonth(date: Dayjs): boolean {
    return date.isSame(this.currentViewDate, 'month');
  }

  isDateDisabled(date: Dayjs): boolean {
    const minDate = this.resolveBoundaryDate(this.minDate);
    const maxDate = this.resolveBoundaryDate(this.maxDate);
    if (minDate && date.isBefore(minDate, 'day')) return true;
    if (maxDate && date.isAfter(maxDate, 'day')) return true;
    return false;
  }

  // ===== TRACK BY =====
  trackByDate = (_index: number, date: Dayjs): string => date.toISOString();
  trackByItem = (_index: number, item: CalendarItem): string => item.id;

  // ===== PRIVATE METHODS =====
  private syncTasks(tasks: SicCalendarTask[] | null | undefined): void {
    this.tasksInternal = this.cloneTasks(tasks ?? []);
    this.cdr.markForCheck();
  }

  private emitTasks(): void {
    this.tasksChange.emit(this.cloneTasks(this.tasksInternal));
    this.cdr.markForCheck();
  }

  private emitViewRangeChange(): void {
    this.viewRangeChange.emit({
      startDate: this.visibleRangeStart.startOf('day').toISOString(),
      endDate: this.visibleRangeEnd.endOf('day').toISOString(),
      currentMonth: this.currentViewDate.startOf('month').toISOString(),
    });
  }

  private generateCalendar(): void {
    this.calendarDays = [];
    let current = this.visibleRangeStart;
    while (current.isBefore(this.visibleRangeEnd) || current.isSame(this.visibleRangeEnd, 'day')) {
      this.calendarDays.push(current);
      current = current.add(1, 'day');
    }
  }

  private generateWeekDays(): void {
    if (this.resolveLocale(this.era) === 'th') {
      this.weekDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      this.weekDaysFull = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
      return;
    }
    this.weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this.weekDaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  private generateMonthNames(): void {
    const base = this.currentViewDate.startOf('year');
    this.monthNames = Array.from({ length: 12 }, (_value, index) =>
      base.month(index).format('MMM').toUpperCase(),
    );
  }

  private generateYears(): void {
    const currentYear = this.currentViewDate.year();
    const startYear = currentYear - 7;
    this.years = Array.from({ length: 16 }, (_value, index) => startYear + index);
  }

  private resolveLocale(era: CalendarEra): 'en' | 'th' {
    return era === 'en' ? 'en' : 'th';
  }

  getDisplayYear(year: number): string {
    return this.era === 'th' ? String(year + 543) : String(year);
  }

  private normalizeYearFormat(format: string): string {
    if (this.era === 'th') {
      return format.replaceAll('YYYY', 'BBBB').replaceAll('YY', 'BB');
    }
    return format.replaceAll('BBBB', 'YYYY').replaceAll('BB', 'YY');
  }

  private resolveBoundaryDate(value: Date | string | null | undefined): Dayjs | null {
    if (!value) return null;
    const parsed = dayjs.utc(value).utcOffset(this.offset).locale(this.resolveLocale(this.era));
    return parsed.isValid() ? parsed : null;
  }

  private getTasksForDate(date: Dayjs): SicCalendarTask[] {
    return this.tasksInternal
      .filter((task) => this.isTaskOnDate(task, date))
      .sort((left, right) => left.title.localeCompare(right.title));
  }

  private isTaskOnDate(task: SicCalendarTask, date: Dayjs): boolean {
    const taskDate = dayjs.utc(task.date).utcOffset(this.offset).locale(this.resolveLocale(this.era));
    return taskDate.isValid() && taskDate.isSame(date, 'day');
  }

  private createLocalizedDay(): Dayjs {
    return dayjs.utc().utcOffset(this.offset).locale(this.resolveLocale(this.era));
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private cloneTasks(tasks: SicCalendarTask[]): SicCalendarTask[] {
    return tasks.map((task) => ({ ...task }));
  }
}