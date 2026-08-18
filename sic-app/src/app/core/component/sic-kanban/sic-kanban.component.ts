// src/app/core/component/sic-kanban/sic-kanban.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import type { TaskResponse } from '../../../feature/pm/dt/pmdt02/pmdt02C/pmdt02C.model';
import type { WorkPackageResponse } from '../../../feature/pm/dt/pmdt02/pmdt02B/pmdt02B.model';
import type { MilestoneResponse } from '../../../feature/pm/dt/pmdt02/pmdt02A/pmdt02A.model';
import { SicComboboxComponent } from '../sic-combobox/sic-combobox.component';
import { SicAvatarComponent } from '../sic-avatar/sic-avatar.component';

export type KanbanViewMode = 'task' | 'workPackage' | 'milestone';

export interface KanbanColumnConfig {
  id: string;
  name: string;
  statuses: string[];
  color: string;
  textColor: string;
  bgLight: string;
  dotColor: string;
}

export interface KanbanStatusChangeEvent {
  taskId: string;
  task: TaskResponse;
  oldStatus: string;
  newStatus: string;
}

export interface KanbanWpStatusChangeEvent {
  workPackageId: string;
  workPackage: WorkPackageResponse;
  oldStatus: string;
  newStatus: string;
}

export interface KanbanMilestoneStatusChangeEvent {
  milestoneId: string;
  milestone: MilestoneResponse;
  oldStatus: string;
  newStatus: string;
}

@Component({
  selector: 'sic-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, SicComboboxComponent, SicAvatarComponent],
  templateUrl: './sic-kanban.component.html',
  styleUrl: './sic-kanban.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicKanbanComponent {
  // ===== INPUTS =====
  @Input({ required: true }) set tasks(value: TaskResponse[] | null | undefined) {
    this._tasks.set(value || []);
  }
  @Input() set workPackages(value: WorkPackageResponse[] | null | undefined) {
    this._workPackages.set(value || []);
  }
  get workPackages(): WorkPackageResponse[] {
    return this._workPackages();
  }
  @Input() set milestones(value: MilestoneResponse[] | null | undefined) {
    this._milestones.set(value || []);
  }
  get milestones(): MilestoneResponse[] {
    return this._milestones();
  }
  @Input() set specifications(value: { id: string; code: string; title: string }[] | null | undefined) {
    this._specifications.set(value || []);
  }
  get specifications(): { id: string; code: string; title: string }[] {
    return this._specifications();
  }
  @Input() readonly = false;
  @Input() allowDragDrop = true;
  @Input() allowActions = true;
  @Input() showToolbar = true;
  @Input() allowCreate = true;
  @Input() showColumnFooterCreate = true;

  get canDrag(): boolean {
    return !this.readonly && this.allowDragDrop;
  }

  get canAction(): boolean {
    return !this.readonly && this.allowActions;
  }

  get canCreate(): boolean {
    return !this.readonly && this.allowCreate;
  }

  // ===== OUTPUTS FOR TASK =====
  @Output() taskStatusChange = new EventEmitter<KanbanStatusChangeEvent>();
  @Output() taskClick = new EventEmitter<TaskResponse>();
  @Output() taskEdit = new EventEmitter<TaskResponse>();
  @Output() taskDelete = new EventEmitter<TaskResponse>();
  @Output() taskCreate = new EventEmitter<{ status: string; workPackageId?: string }>();

  // ===== OUTPUTS FOR WORK PACKAGE =====
  @Output() workPackageStatusChange = new EventEmitter<KanbanWpStatusChangeEvent>();
  @Output() workPackageClick = new EventEmitter<WorkPackageResponse>();
  @Output() workPackageEdit = new EventEmitter<WorkPackageResponse>();
  @Output() workPackageDelete = new EventEmitter<WorkPackageResponse>();
  @Output() workPackageCreate = new EventEmitter<{ status: string; milestoneId?: string }>();

  // ===== OUTPUTS FOR MILESTONE =====
  @Output() milestoneStatusChange = new EventEmitter<KanbanMilestoneStatusChangeEvent>();
  @Output() milestoneClick = new EventEmitter<MilestoneResponse>();
  @Output() milestoneEdit = new EventEmitter<MilestoneResponse>();
  @Output() milestoneDelete = new EventEmitter<MilestoneResponse>();
  @Output() milestoneCreate = new EventEmitter<{ status: string }>();

  // ===== SIGNALS =====
  private _tasks = signal<TaskResponse[]>([]);
  private _workPackages = signal<WorkPackageResponse[]>([]);
  private _milestones = signal<MilestoneResponse[]>([]);
  private _specifications = signal<{ id: string; code: string; title: string }[]>([]);

  viewMode = signal<KanbanViewMode>('task');
  searchQuery = signal<string>('');
  selectedWpFilter = signal<string | null>(null);
  selectedSpecFilter = signal<string | null>(null);
  selectedMilestoneFilter = signal<string | null>(null);
  selectedPriorityFilter = signal<string | null>(null);
  selectedAssigneeFilter = signal<string | null>(null);

  // ===== COLUMNS CONFIG (matching ClickUp style) =====
  readonly columns: KanbanColumnConfig[] = [
    {
      id: 'TODO',
      name: 'TO DO',
      statuses: ['Todo', 'To Do', 'Not Started', 'TODO', 'Draft'],
      color: '#64748b',
      textColor: '#cbd5e1',
      bgLight: 'rgba(100, 116, 139, 0.15)',
      dotColor: '#94a3b8',
    },
    {
      id: 'IN_PROGRESS',
      name: 'IN PROGRESS',
      statuses: ['In Progress', 'Doing', 'IN_PROGRESS'],
      color: '#3b82f6',
      textColor: '#93c5fd',
      bgLight: 'rgba(59, 130, 246, 0.15)',
      dotColor: '#3b82f6',
    },
    {
      id: 'TESTING',
      name: 'TESTING',
      statuses: ['Testing', 'Test', 'In Test', 'TESTING', 'UAT', 'Waiting Review', 'Review'],
      color: '#a855f7',
      textColor: '#d8b4fe',
      bgLight: 'rgba(168, 85, 247, 0.15)',
      dotColor: '#a855f7',
    },
    {
      id: 'BUG_FIXING',
      name: 'BUG FIXING',
      statuses: ['bugfix', 'Bugfix', 'Bug Fixing', 'Bug', 'Fixing', 'Waiting Fix', 'BUG_FIXING', 'BUG FIXING', 'Blocked'],
      color: '#ef4444',
      textColor: '#fca5a5',
      bgLight: 'rgba(239, 68, 68, 0.15)',
      dotColor: '#ef4444',
    },
    {
      id: 'ON_HOLD',
      name: 'ON HOLD',
      statuses: ['On Hold', 'on hold', 'Delayed', 'ON_HOLD', 'Hold'],
      color: '#f97316',
      textColor: '#fdba74',
      bgLight: 'rgba(249, 115, 22, 0.15)',
      dotColor: '#f97316',
    },
    {
      id: 'COMPLETE',
      name: 'COMPLETE',
      statuses: ['complete', 'Complete', 'Done', 'Completed', 'COMPLETE', 'Closed'],
      color: '#10b981',
      textColor: '#6ee7b7',
      bgLight: 'rgba(16, 185, 129, 0.15)',
      dotColor: '#10b981',
    },
  ];

  // List of column IDs for cdkDropList
  readonly columnDropListIds = this.columns.map((c) => 'kanban-col-' + c.id);

  // ===== COMBOBOX OPTIONS =====
  wpOptions = computed(() => {
    return this._workPackages().map((wp) => ({
      value: wp.id,
      text: wp.packageName,
    }));
  });

  specOptions = computed(() => {
    return this._specifications().map((s) => ({
      value: s.id,
      text: `[${s.code}] ${s.title}`,
    }));
  });

  milestoneOptions = computed(() => {
    return this._milestones().map((ms) => ({
      value: ms.id,
      text: ms.milestoneName,
    }));
  });

  readonly priorityOptions = [
    { value: 'Urgent', text: '🔴 Urgent' },
    { value: 'High', text: '🟡 High' },
    { value: 'Normal', text: '🔵 Normal' },
    { value: 'Low', text: '⚪ Low' },
  ];

  assigneeOptions = computed(() => {
    const set = new Set<string>();
    for (const t of this._tasks()) {
      const assignees = this.getTaskAssignees(t);
      for (const a of assignees) {
        if (a && a.trim()) {
          set.add(a.trim());
        }
      }
    }
    return Array.from(set).map((a) => ({
      value: a,
      text: `👤 ${a}`,
    }));
  });

  // ===== VIEW MODE SWITCHER =====
  setViewMode(mode: KanbanViewMode): void {
    this.viewMode.set(mode);
  }

  // ===== COMPUTED: FILTERED ITEMS =====
  filteredTasks = computed(() => {
    let list = this._tasks();
    const query = this.searchQuery().trim().toLowerCase();
    const wpId = this.selectedWpFilter();
    const specId = this.selectedSpecFilter();
    const priority = this.selectedPriorityFilter();
    const assignee = this.selectedAssigneeFilter();

    if (query) {
      list = list.filter(
        (t) =>
          (t.taskName && t.taskName.toLowerCase().includes(query)) ||
          (t.taskCode && t.taskCode.toLowerCase().includes(query)) ||
          (t.description && t.description.toLowerCase().includes(query)) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(query)) ||
          (t.workPackageName && t.workPackageName.toLowerCase().includes(query)) ||
          (t.specificationCode && t.specificationCode.toLowerCase().includes(query)) ||
          (t.specificationTitle && t.specificationTitle.toLowerCase().includes(query))
      );
    }

    if (specId) {
      list = list.filter((t) => t.specificationId === specId);
    }

    if (wpId) {
      list = list.filter((t) => t.workPackageId === wpId);
    }

    if (priority) {
      list = list.filter((t) => (t.priority || '').toLowerCase() === priority.toLowerCase());
    }

    if (assignee) {
      list = list.filter((t) => {
        const assignees = this.getTaskAssignees(t);
        return assignees.includes(assignee) || t.assignedTo === assignee;
      });
    }

    return list;
  });

  filteredWorkPackages = computed(() => {
    let list = this._workPackages();
    const query = this.searchQuery().trim().toLowerCase();
    const msId = this.selectedMilestoneFilter();
    const priority = this.selectedPriorityFilter();
    const assignee = this.selectedAssigneeFilter();

    if (query) {
      list = list.filter(
        (wp) =>
          (wp.packageName && wp.packageName.toLowerCase().includes(query)) ||
          (wp.description && wp.description.toLowerCase().includes(query)) ||
          (wp.milestoneName && wp.milestoneName.toLowerCase().includes(query))
      );
    }

    if (msId) {
      list = list.filter((wp) => wp.milestoneId === msId);
    }

    if (priority) {
      list = list.filter((wp) => {
        const wpTasks = (wp.tasks && wp.tasks.length > 0)
          ? wp.tasks
          : this._tasks().filter((t) => t.workPackageId === wp.id);
        return wpTasks.some((t) => (t.priority || '').toLowerCase() === priority.toLowerCase());
      });
    }

    if (assignee) {
      list = list.filter((wp) => {
        const wpTasks = (wp.tasks && wp.tasks.length > 0)
          ? wp.tasks
          : this._tasks().filter((t) => t.workPackageId === wp.id);
        return wpTasks.some((t) => {
          const assignees = this.getTaskAssignees(t);
          return assignees.includes(assignee) || t.assignedTo === assignee;
        });
      });
    }

    return list;
  });

  filteredMilestones = computed(() => {
    let list = this._milestones();
    const query = this.searchQuery().trim().toLowerCase();
    const priority = this.selectedPriorityFilter();
    const assignee = this.selectedAssigneeFilter();

    if (query) {
      list = list.filter(
        (ms) =>
          (ms.milestoneName && ms.milestoneName.toLowerCase().includes(query)) ||
          (ms.description && ms.description.toLowerCase().includes(query))
      );
    }

    if (priority) {
      list = list.filter((ms) => {
        // Collect all tasks under this milestone via work packages or global tasks
        const msWpIds = new Set((ms.workPackages || []).map((wp) => wp.id));
        const msTasks = this._tasks().filter((t) => msWpIds.has(t.workPackageId));
        const hasDirectTask = (ms.workPackages || []).some((wp) =>
          (wp.tasks || []).some((t) => (t.priority || '').toLowerCase() === priority.toLowerCase())
        );
        return hasDirectTask || msTasks.some((t) => (t.priority || '').toLowerCase() === priority.toLowerCase());
      });
    }

    if (assignee) {
      list = list.filter((ms) => {
        const msWpIds = new Set((ms.workPackages || []).map((wp) => wp.id));
        const msTasks = this._tasks().filter((t) => msWpIds.has(t.workPackageId));
        const hasDirectTask = (ms.workPackages || []).some((wp) =>
          (wp.tasks || []).some((t) => {
            const assignees = this.getTaskAssignees(t);
            return assignees.includes(assignee) || t.assignedTo === assignee;
          })
        );
        return hasDirectTask || msTasks.some((t) => {
          const assignees = this.getTaskAssignees(t);
          return assignees.includes(assignee) || t.assignedTo === assignee;
        });
      });
    }

    return list;
  });

  // Get items in a specific column according to viewMode
  getColumnTasks(column: KanbanColumnConfig): TaskResponse[] {
    const list = this.filteredTasks();
    return list.filter((t) => {
      const s = (t.status || '').trim();
      return column.statuses.some((status) => status.toLowerCase() === s.toLowerCase());
    });
  }

  getColumnWorkPackages(column: KanbanColumnConfig): WorkPackageResponse[] {
    const list = this.filteredWorkPackages();
    return list.filter((wp) => {
      const s = (wp.status || 'Todo').trim();
      return column.statuses.some((status) => status.toLowerCase() === s.toLowerCase());
    });
  }

  getColumnMilestones(column: KanbanColumnConfig): MilestoneResponse[] {
    const list = this.filteredMilestones();
    return list.filter((ms) => {
      const s = (ms.status || 'Todo').trim();
      return column.statuses.some((status) => status.toLowerCase() === s.toLowerCase());
    });
  }

  getColumnItemCount(column: KanbanColumnConfig): number {
    const mode = this.viewMode();
    if (mode === 'task') return this.getColumnTasks(column).length;
    if (mode === 'workPackage') return this.getColumnWorkPackages(column).length;
    return this.getColumnMilestones(column).length;
  }

  // ===== DRAG & DROP HANDLERS =====
  onDropTask(event: CdkDragDrop<TaskResponse[]>, targetColumn: KanbanColumnConfig): void {
    if (!this.canDrag) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      if (!task) return;

      const oldStatus = task.status;
      const targetDefaultStatus = targetColumn.statuses[0];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      task.status = targetDefaultStatus;

      this.taskStatusChange.emit({
        taskId: task.id,
        task,
        oldStatus,
        newStatus: targetDefaultStatus,
      });
    }
  }

  onDropWorkPackage(event: CdkDragDrop<WorkPackageResponse[]>, targetColumn: KanbanColumnConfig): void {
    if (!this.canDrag) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const wp = event.previousContainer.data[event.previousIndex];
      if (!wp) return;

      const oldStatus = wp.status;
      const targetDefaultStatus = targetColumn.statuses[0];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      wp.status = targetDefaultStatus;

      this.workPackageStatusChange.emit({
        workPackageId: wp.id,
        workPackage: wp,
        oldStatus,
        newStatus: targetDefaultStatus,
      });
    }
  }

  onDropMilestone(event: CdkDragDrop<MilestoneResponse[]>, targetColumn: KanbanColumnConfig): void {
    if (!this.canDrag) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const ms = event.previousContainer.data[event.previousIndex];
      if (!ms) return;

      const oldStatus = ms.status;
      const targetDefaultStatus = targetColumn.statuses[0];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      ms.status = targetDefaultStatus;

      this.milestoneStatusChange.emit({
        milestoneId: ms.id,
        milestone: ms,
        oldStatus,
        newStatus: targetDefaultStatus,
      });
    }
  }

  // ===== TASK ACTION HANDLERS =====
  onCardClick(task: TaskResponse): void {
    this.taskClick.emit(task);
  }

  onEditClick(task: TaskResponse, event: Event): void {
    event.stopPropagation();
    this.taskEdit.emit(task);
  }

  onDeleteClick(task: TaskResponse, event: Event): void {
    event.stopPropagation();
    this.taskDelete.emit(task);
  }

  // ===== WORK PACKAGE ACTION HANDLERS =====
  onWpCardClick(wp: WorkPackageResponse): void {
    this.workPackageClick.emit(wp);
  }

  onWpEditClick(wp: WorkPackageResponse, event: Event): void {
    event.stopPropagation();
    this.workPackageEdit.emit(wp);
  }

  onWpDeleteClick(wp: WorkPackageResponse, event: Event): void {
    event.stopPropagation();
    this.workPackageDelete.emit(wp);
  }

  // ===== MILESTONE ACTION HANDLERS =====
  onMilestoneCardClick(ms: MilestoneResponse): void {
    this.milestoneClick.emit(ms);
  }

  onMilestoneEditClick(ms: MilestoneResponse, event: Event): void {
    event.stopPropagation();
    this.milestoneEdit.emit(ms);
  }

  onMilestoneDeleteClick(ms: MilestoneResponse, event: Event): void {
    event.stopPropagation();
    this.milestoneDelete.emit(ms);
  }

  // ===== ADD ITEM (DYNAMIC PER VIEW MODE) =====
  onAddItem(columnStatus?: string): void {
    const status = columnStatus || this.columns[0].statuses[0];
    const mode = this.viewMode();

    if (mode === 'task') {
      const wpId = this.selectedWpFilter() || undefined;
      this.taskCreate.emit({ status, workPackageId: wpId });
    } else if (mode === 'workPackage') {
      const msId = this.selectedMilestoneFilter() || undefined;
      this.workPackageCreate.emit({ status, milestoneId: msId });
    } else {
      this.milestoneCreate.emit({ status });
    }
  }

  // ===== UI HELPERS =====
  getTaskAssignees(task: TaskResponse): string[] {
    const list: string[] = [];
    if (task.assigneeNames) {
      if (Array.isArray(task.assigneeNames)) {
        list.push(...task.assigneeNames.filter(Boolean));
      } else if (typeof task.assigneeNames === 'object') {
        list.push(...Object.values(task.assigneeNames).filter(Boolean));
      }
    }
    if (list.length === 0 && task.assignedTo) {
      list.push(task.assignedTo);
    }
    return list;
  }

  getInitials(name?: string | null): string {
    if (!name || name.trim() === '' || name === 'undefined' || name === 'null') return '?';
    const cleanName = name.trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0][0] || '';
      const second = parts[1][0] || '';
      return (first + second).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateStr;
    }
  }

  isOverdue(dateStr?: string, status?: string): boolean {
    if (!dateStr) return false;
    const s = (status || '').toLowerCase();
    if (s === 'done' || s === 'completed' || s === 'closed' || s === 'complete') return false;
    try {
      const d = new Date(dateStr);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return d < now;
    } catch {
      return false;
    }
  }

  isBugTask(task: TaskResponse): boolean {
    const code = (task.taskCode || '').toUpperCase();
    const name = (task.taskName || '').toUpperCase();
    return code.startsWith('BUG-') || code.startsWith('BUG') || name.startsWith('[BUG]') || name.includes('BUG');
  }

  getPriorityClass(priority?: string): string {
    if (!priority) return 'normal';
    const p = priority.toLowerCase();
    if (p.includes('urgent') || p.includes('critical')) return 'urgent';
    if (p.includes('high')) return 'high';
    if (p.includes('low')) return 'low';
    return 'normal';
  }

  getPriorityLabel(priority?: string): string {
    if (!priority) return 'Normal';
    const p = priority.toLowerCase();
    if (p.includes('urgent') || p.includes('critical')) return 'Urgent';
    if (p.includes('high')) return 'High';
    if (p.includes('low')) return 'Low';
    return 'Normal';
  }

  onTaskQuickStatusChange(task: TaskResponse, targetStatus: string, event: MouseEvent): void {
    event.stopPropagation();
    this.taskStatusChange.emit({
      taskId: task.id,
      task: task,
      oldStatus: task.status || 'Todo',
      newStatus: targetStatus,
    });
  }
}

