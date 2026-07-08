// src/app/core/component/sic-task/sic-task.component.ts
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DialogService } from '../../services/dialog.service';
import { SicCalendarComponent, SicCalendarTask, SicCalendarViewRange } from '../sic-calendar/sic-calendar.component';
import { environment } from '../../../../environments/environment';

export type SicTaskPersistState = 4 | 3 | 2;

export interface SicTaskConfig {
  api: string;
  id: string;
  params?: Record<string, unknown>;
  startDateParam?: string;
  endDateParam?: string;
  saveApi?: string;
  saveMethod?: 'POST' | 'PUT' | 'PATCH';
  savePayload?: (task: SicCalendarTask, state: SicTaskPersistState) => unknown;
  mapSearchItem?: (item: Record<string, unknown>) => SicCalendarTask;
}

type SicTaskResponse<TItem> = {
  data?: TItem[];
};

type SicTaskState = 'active' | 'new' | 'updated' | 'deleted';

@Component({
  selector: 'sic-task',
  standalone: true,
  imports: [CommonModule, SicCalendarComponent],
  templateUrl: './sic-task.component.html',
  styleUrl: './sic-task.component.css',
})
export class SicTaskComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) config!: SicTaskConfig;
  @Input() label?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() hint?: string;
  @Input() minDate?: Date | string | null;
  @Input() maxDate?: Date | string | null;
  @Input() emptyStateTitle = 'No tasks for this day';
  @Input() emptyStateDescription = 'Pick a day and add your first task.';

  @Output() tasksChange = new EventEmitter<SicCalendarTask[]>();
  @Output() taskAdded = new EventEmitter<SicCalendarTask>();
  @Output() taskRemoved = new EventEmitter<SicCalendarTask>();
  @Output() taskSelected = new EventEmitter<string>();

  @HostBinding('class.sic-task-host') readonly hostClass = true;

  tasks: SicCalendarTask[] = [];
  loading = false;
  saving = false;
  errorMessage: string | null = null;
  currentRange: SicCalendarViewRange | null = null;
  private readonly isBrowser: boolean;
  private clientReady = false;

  private readonly originalTaskSnapshots = new Map<string, string>();
  private readonly originalTaskMap = new Map<string, SicCalendarTask>();

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
    private readonly dialogService: DialogService,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    this.clientReady = this.isBrowser;

    if (this.clientReady && this.currentRange) {
      this.loadTasks();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange && this.currentRange) {
      this.loadTasks();
    }
  }

  get visibleRangeLabel(): string | null {
    if (!this.currentRange) {
      return null;
    }

    const start = new Date(this.currentRange.startDate).toLocaleDateString();
    const end = new Date(this.currentRange.endDate).toLocaleDateString();
    return `${start} - ${end}`;
  }

  get canSaveChanges(): boolean {
    return !!this.config?.saveApi && !this.loading && !this.saving && this.hasPendingChanges();
  }

  get canResetChanges(): boolean {
    return !this.loading && !this.saving && this.hasPendingChanges();
  }

  get calendarHint(): string | undefined {
    if (this.errorMessage) {
      return undefined;
    }

    if (this.loading && this.visibleRangeLabel) {
      return `Searching tasks for ${this.visibleRangeLabel}`;
    }

    return this.hint;
  }

  onViewRangeChange(range: SicCalendarViewRange): void {
    const nextRange: SicCalendarViewRange = {
      startDate: range.startDate,
      endDate: range.endDate,
      currentMonth: range.currentMonth,
    };

    queueMicrotask(() => {
      this.currentRange = nextRange;

      if (this.clientReady) {
        this.loadTasks();
      }

      this.cdr.markForCheck();
    });
  }

  onCalendarTasksChange(tasks: SicCalendarTask[]): void {
    this.tasks = this.cloneTasks(tasks);
    this.tasksChange.emit(this.cloneTasks(tasks));
    this.cdr.markForCheck();
  }

  async saveChanges(): Promise<void> {
    if (!this.canSaveChanges || !this.config.saveApi) {
      return;
    }

    const tasksToPersist = this.getTrackedTasks()
      .filter((task) => this.getTaskState(task) !== 'active')
      .sort((left, right) => this.getPersistPriority(this.getTaskState(left)) - this.getPersistPriority(this.getTaskState(right)));

    this.saving = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    try {
      const payload = tasksToPersist.map((task) =>
        this.buildSavePayload(task, this.toPersistState(this.getTaskState(task)))
      );

      const saveUrl = this.buildFullUrl(this.config.saveApi);
      await firstValueFrom(
        this.http.request(this.config.saveMethod ?? 'POST', saveUrl, {
          body: payload,
        })
      );

      void this.dialogService.success('Save Complete', 'Task calendar data was saved successfully.');
      this.loadTasks();
    } catch (error: any) {
      const message = error?.error?.message || error?.message || 'Unable to save task calendar data.';
      this.errorMessage = message;
      void this.dialogService.error('Task Error', message);
    } finally {
      this.saving = false;
      this.cdr.markForCheck();
    }
  }

  resetChanges(): void {
    if (!this.canResetChanges) {
      return;
    }

    this.errorMessage = null;
    this.loadTasks();
  }

  // ===== ตัวช่วยจัดการ URL =====
  private buildFullUrl(url: string): string {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    return `${environment.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  private loadTasks(): void {
    if (!this.clientReady) {
      return;
    }

    if (!this.config?.api || !this.currentRange) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    const fullUrl = this.buildFullUrl(this.config.api);

    this.http
      .get<Record<string, unknown>[] | SicTaskResponse<Record<string, unknown>>>(fullUrl, {
        params: this.buildSearchParams(),
      })
      .subscribe({
        next: (response) => {
          const normalized = this.normalizeResponse(response)
            .map((item) => this.mapSearchItem(item))
            .filter((task) => !!task.id);

          this.tasks = normalized;
          this.captureOriginalSnapshots(normalized);
          this.loading = false;
          this.tasksChange.emit(this.cloneTasks(normalized));
          this.cdr.markForCheck();
        },
        error: (error: any) => {
          const message = error?.error?.message || error?.message || 'Unable to load task calendar data.';
          this.errorMessage = message;
          this.loading = false;
          void this.dialogService.error('Task Error', message);
          this.cdr.markForCheck();
        },
      });
  }

  private buildSearchParams(): HttpParams {
    let params = new HttpParams();
    const currentRange = this.currentRange;

    for (const [key, value] of Object.entries(this.config.params ?? {})) {
      params = this.appendParam(params, key, value);
    }

    return params
      .set(this.config.startDateParam ?? 'startDate', currentRange?.startDate ?? '')
      .set(this.config.endDateParam ?? 'endDate', currentRange?.endDate ?? '');
  }

  private appendParam(params: HttpParams, key: string, value: unknown): HttpParams {
    if (value === null || value === undefined || value === '') {
      return params;
    }

    if (Array.isArray(value)) {
      return value.reduce((nextParams, item) => this.appendParam(nextParams, key, item), params);
    }

    if (value instanceof Date) {
      return params.append(key, value.toISOString());
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return params.append(key, String(value));
    }

    return params;
  }

  private normalizeResponse(
    response: Record<string, unknown>[] | SicTaskResponse<Record<string, unknown>>
  ): Record<string, unknown>[] {
    if (Array.isArray(response)) {
      return response;
    }

    return Array.isArray(response?.data) ? response.data : [];
  }

  private mapSearchItem(item: Record<string, unknown>): SicCalendarTask {
    if (this.config.mapSearchItem) {
      return this.config.mapSearchItem(item);
    }

    return {
      id: this.toText(item[this.config.id]) || crypto.randomUUID(),
      title: this.toText(item['title']) || this.toText(item['name']) || 'Untitled task',
      description: typeof item['description'] === 'string' ? item['description'] : undefined,
      date: this.normalizeCalendarDate(item['date']),
      color: typeof item['color'] === 'string' ? item['color'] : '#4ECDC4',
      completed: Boolean(item['completed']),
    };
  }

  private captureOriginalSnapshots(tasks: SicCalendarTask[]): void {
    this.originalTaskSnapshots.clear();
    this.originalTaskMap.clear();

    for (const task of tasks) {
      this.originalTaskSnapshots.set(task.id, this.serializeTask(task));
      this.originalTaskMap.set(task.id, { ...task });
    }
  }

  private hasPendingChanges(): boolean {
    return this.getTrackedTasks().some((task) => this.getTaskState(task) !== 'active');
  }

  private getTrackedTasks(): SicCalendarTask[] {
    return [...this.tasks, ...this.getDeletedTasks()];
  }

  private getDeletedTasks(): SicCalendarTask[] {
    const currentIds = new Set(this.tasks.map((task) => task.id));
    const deleted: SicCalendarTask[] = [];

    for (const [taskId, task] of this.originalTaskMap.entries()) {
      if (!currentIds.has(taskId)) {
        deleted.push({ ...task });
      }
    }

    return deleted;
  }

  private getTaskState(task: SicCalendarTask): SicTaskState {
    const existsInCurrent = this.tasks.some((current) => current.id === task.id);
    const originalSnapshot = this.originalTaskSnapshots.get(task.id);

    if (!existsInCurrent && originalSnapshot) {
      return 'deleted';
    }

    if (!originalSnapshot) {
      return 'new';
    }

    return originalSnapshot === this.serializeTask(task) ? 'active' : 'updated';
  }

  private buildSavePayload(task: SicCalendarTask, state: SicTaskPersistState): unknown {
    if (this.config.savePayload) {
      return this.config.savePayload(task, state);
    }

    return {
      ...task,
      state,
    };
  }

  private toPersistState(state: SicTaskState): SicTaskPersistState {
    if (state === 'new') {
      return 4;
    }

    if (state === 'updated') {
      return 3;
    }

    return 2;
  }

  private getPersistPriority(state: SicTaskState): number {
    if (state === 'deleted') {
      return 0;
    }

    if (state === 'updated') {
      return 1;
    }

    return 2;
  }

  private cloneTasks(tasks: SicCalendarTask[]): SicCalendarTask[] {
    return tasks.map((task) => ({ ...task }));
  }

  private serializeTask(task: SicCalendarTask): string {
    return JSON.stringify({
      id: task.id,
      title: task.title,
      date: task.date,
      description: task.description ?? null,
      color: task.color ?? null,
      completed: task.completed ?? false,
    });
  }

  private normalizeCalendarDate(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }

    if (typeof value === 'number') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }

    return new Date().toISOString();
  }

  private toText(value: unknown): string | null {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return String(value);
    }

    return null;
  }
}

export type { SicCalendarTask };