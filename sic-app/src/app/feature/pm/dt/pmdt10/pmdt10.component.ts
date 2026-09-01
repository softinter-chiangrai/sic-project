import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import {
  SicKanbanComponent,
  KanbanStatusChangeEvent,
  KanbanColumnConfig,
} from '../../../../core/component/sic-kanban/sic-kanban.component';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { BusinessService } from '../../../../core/services/business.service';

import { Pmdt10Service } from './pmdt10.service';
import { Pmdt10AComponent } from './pmdt10A/pmdt10A.component';
import type { TaskResponse, SpecificationSummary, WorkPackageOption } from './pmdt10.model';
import { SicAvatarComponent } from '../../../../core/component/sic-avatar/sic-avatar.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';

@Component({
  selector: 'app-pmdt10',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DragDropModule,
    SicAvatarComponent,
    SicComboboxComponent,
    SicKanbanComponent,
    Pmdt10AComponent,
  ],
  templateUrl: './pmdt10.component.html',
  styleUrls: ['./pmdt10.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Pmdt10Component implements OnInit {
  private service = inject(Pmdt10Service);
  private customerState = inject(CustomerStateService);
  private businessService = inject(BusinessService);
  private dialog = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('taskModal') taskModal?: Pmdt10AComponent;

  // View state
  viewType = signal<'kanban' | 'list'>('kanban');
  isLoading = signal(false);

  // Data signals
  projectId = signal<string | null>(null);
  allTasks = signal<TaskResponse[]>([]);
  allBugs = signal<any[]>([]);
  specifications = signal<SpecificationSummary[]>([]);
  workPackages = signal<WorkPackageOption[]>([]);
  businessMembers = signal<{ value: string; text: string }[]>([]);

  // Filter signals
  selectedSpecId = signal<string | null>(null);
  selectedWpId = signal<string | null>(null);
  selectedPriority = signal<string | null>(null);
  selectedAssignee = signal<string | null>(null);
  searchQuery = signal<string>('');

  // Modal signals
  isModalOpen = signal(false);
  isModalEdit = signal(false);
  selectedTaskId = signal<string | null>(null);

  // Columns definition
  readonly columns: KanbanColumnConfig[] = [
    {
      id: 'col-todo',
      name: 'To Do',
      statuses: ['Todo'],
      color: '#64748B',
      textColor: 'text-slate-700 dark:text-slate-300',
      bgLight: 'bg-slate-50 dark:bg-slate-900/40',
      dotColor: 'bg-slate-400',
    },
    {
      id: 'col-inprogress',
      name: 'In Progress',
      statuses: ['In Progress', 'Doing'],
      color: '#3B82F6',
      textColor: 'text-blue-700 dark:text-blue-300',
      bgLight: 'bg-blue-50/50 dark:bg-blue-900/20',
      dotColor: 'bg-blue-500',
    },
    {
      id: 'col-review',
      name: 'Waiting Review',
      statuses: ['Waiting Review', 'Review'],
      color: '#F59E0B',
      textColor: 'text-amber-700 dark:text-amber-300',
      bgLight: 'bg-amber-50/50 dark:bg-amber-900/20',
      dotColor: 'bg-amber-500',
    },
    {
      id: 'col-fix',
      name: 'Waiting Fix',
      statuses: ['Waiting Fix', 'Blocked', 'Delayed'],
      color: '#EF4444',
      textColor: 'text-rose-700 dark:text-rose-300',
      bgLight: 'bg-rose-50/50 dark:bg-rose-900/20',
      dotColor: 'bg-rose-500',
    },
    {
      id: 'col-done',
      name: 'Done',
      statuses: ['Done', 'Completed'],
      color: '#10B981',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      bgLight: 'bg-emerald-50/50 dark:bg-emerald-900/20',
      dotColor: 'bg-emerald-500',
    },
  ];

  // Options
  readonly priorityOptions = [
    { value: 'Critical', text: '🔥 วิกฤต (Critical)' },
    { value: 'High', text: '🔴 สูง (High)' },
    { value: 'Medium', text: '🟡 ปานกลาง (Medium)' },
    { value: 'Low', text: '🟢 ต่ำ (Low)' },
  ];

  // Computed Specifications Options
  specOptions = computed(() => {
    return this.specifications().map((s) => ({
      value: s.id,
      text: `[${s.code}] ${s.title}`,
    }));
  });

  // Computed Work Packages Options
  wpOptions = computed(() => {
    return this.workPackages().map((wp) => ({
      value: wp.id,
      text: `${wp.packageName} (${wp.phaseName})`,
    }));
  });

  // Computed Assignee Options
  assigneeOptions = computed(() => {
    const members = this.businessMembers();
    if (members.length > 0) {
      return members;
    }
    const tasks = this.allTasks();
    const map = new Map<string, string>();
    for (const t of tasks) {
      if (t.assigneeIds && t.assigneeNames) {
        for (const uid of t.assigneeIds) {
          if (t.assigneeNames[uid]) {
            map.set(uid, t.assigneeNames[uid]);
          }
        }
      } else if (t.assignedTo && t.assignedTo.trim().length > 0) {
        map.set(t.assignedTo, t.assignedTo);
      }
    }
    return Array.from(map.entries()).map(([value, text]) => ({ value, text }));
  });

  // Filtered Tasks
  filteredTasks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const specId = this.selectedSpecId();
    const wpId = this.selectedWpId();
    const prio = this.selectedPriority();
    const ass = this.selectedAssignee();

    return this.allTasks().filter((t) => {
      // Filter by Spec
      if (specId && t.specificationId !== specId) return false;
      // Filter by WP
      if (wpId && t.workPackageId !== wpId) return false;
      // Filter by Priority
      if (prio && (t.priority || '').toLowerCase() !== prio.toLowerCase()) return false;
      // Filter by Assignee
      if (ass) {
        const inIds = t.assigneeIds && t.assigneeIds.includes(ass);
        const inName = t.assignedTo && t.assignedTo.toLowerCase() === ass.toLowerCase();
        const inAssigneeNames =
          t.assigneeNames &&
          (t.assigneeNames[ass] !== undefined ||
            Object.values(t.assigneeNames).some((name) => name.toLowerCase() === ass.toLowerCase()));
        if (!inIds && !inName && !inAssigneeNames) return false;
      }
      // Search
      if (query) {
        const matchCode = (t.taskCode || '').toLowerCase().includes(query);
        const matchName = (t.taskName || '').toLowerCase().includes(query);
        const matchDesc = (t.description || '').toLowerCase().includes(query);
        const matchSpec = (t.specificationCode || '').toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchDesc && !matchSpec) return false;
      }
      return true;
    });
  });

  // Tasks by Column
  tasksByColumn = computed(() => {
    const result: Record<string, TaskResponse[]> = {};
    for (const col of this.columns) {
      result[col.id] = [];
    }
    for (const task of this.filteredTasks()) {
      const status = task.status || 'Todo';
      const col = this.columns.find((c) =>
        c.statuses.some((s) => s.toLowerCase() === status.toLowerCase())
      ) || this.columns[0];
      result[col.id].push(task);
    }
    return result;
  });

  // Metrics
  metrics = computed(() => {
    const tasks = this.filteredTasks();

    // 1. ตรวจสอบงานที่เป็น Bug
    const bugStatuses = ['bugfix', 'bug fixing', 'bug', 'fixing', 'waiting fix', 'blocked'];
    const isBugTask = (t: TaskResponse) =>
      bugStatuses.includes((t.status || '').toLowerCase().trim()) ||
      (t.taskCode || '').toLowerCase().startsWith('bug') ||
      (t.taskName || '').toLowerCase().startsWith('bug');

    // 2. งานปกติ (ไม่รวม Bug)
    const normalTasks = tasks.filter((t) => !isBugTask(t));
    const total = normalTasks.length;
    const done = normalTasks.filter((t) =>
      ['done', 'completed', 'complete', 'closed'].includes((t.status || '').toLowerCase().trim())
    ).length;
    const inProgress = normalTasks.filter((t) =>
      ['in progress', 'doing', 'waiting review', 'review', 'testing', 'test', 'in test', 'uat'].includes((t.status || '').toLowerCase().trim())
    ).length;
    const todo = normalTasks.filter((t) =>
      ['todo', 'to do', 'not started', 'draft'].includes((t.status || '').toLowerCase().trim())
    ).length;
    const onHold = normalTasks.filter((t) =>
      ['on hold', 'delayed', 'hold'].includes((t.status || '').toLowerCase().trim())
    ).length;

    // 3. ข้อมูล Bug
    const bugTasks = tasks.filter((t) => isBugTask(t));
    const bugComplete = bugTasks.filter((t) =>
      ['done', 'completed', 'complete', 'closed', 'bug complete', 'bug completed', 'bug done'].includes((t.status || '').toLowerCase().trim())
    ).length;
    const bugPendingTasks = bugTasks.filter((t) =>
      !['done', 'completed', 'complete', 'closed', 'bug complete', 'bug completed', 'bug done'].includes((t.status || '').toLowerCase().trim())
    ).length;

    const bugEntityCount = this.allBugs().length;
    const bug = Math.max(bugPendingTasks, bugEntityCount > 0 ? bugEntityCount - bugComplete : 0);

    // 4. เปอร์เซ็นต์ความสำเร็จ (คิดจากงานปกติเท่านั้น)
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, done, inProgress, bug, bugComplete, todo, onHold, progress };
  });

  get currentSpec() {
    const id = this.selectedSpecId();
    if (!id) return null;
    return this.specifications().find((s) => s.id === id) || null;
  }

  ngOnInit(): void {
    const businessId = this.businessService.getCurrentBusinessId();
    if (businessId) {
      this.service.getMembers(businessId).subscribe({
        next: (members) => this.businessMembers.set(members),
        error: (err) => console.error('Load members error:', err),
      });
    }

    this.route.queryParams.subscribe((params) => {
      const pId = params['projectId'] || this.customerState.getProjectId();
      const specId = params['specificationId'] || null;

      if (pId) {
        this.projectId.set(pId);
        if (specId) this.selectedSpecId.set(specId);
        this.loadProjectData(pId);
      } else {
        const stored = this.customerState.getProjectId();
        if (stored) {
          this.projectId.set(stored);
          this.loadProjectData(stored);
        }
      }
    });
  }

  loadProjectData(pId: string): void {
    this.isLoading.set(true);

    // 1. Load Specs
    this.service.getSpecificationsByProject(pId).subscribe({
      next: (specs) => this.specifications.set(specs),
      error: (err) => console.error('Load specs error:', err),
    });

    // 2. Load Phases -> Work Packages
    this.service.getPhasesByProject(pId).subscribe({
      next: (phases) => {
        const wps: WorkPackageOption[] = [];
        if (phases && Array.isArray(phases)) {
          for (const ph of phases) {
            if (ph.milestones) {
              for (const ms of ph.milestones) {
                if (ms.workPackages) {
                  for (const wp of ms.workPackages) {
                    wps.push({
                      id: wp.id,
                      packageName: wp.packageName,
                      phaseId: ph.id,
                      phaseName: ph.phaseName,
                      milestoneId: ms.id,
                      milestoneName: ms.milestoneName,
                    });
                  }
                }
              }
            }
          }
        }
        this.workPackages.set(wps);
      },
      error: (err) => console.error('Load phases error:', err),
    });

    // 3. Load Tasks
    this.service.getTasksByProjectId(pId).subscribe({
      next: (tasks) => {
        this.allTasks.set(tasks || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Load tasks error:', err);
        this.allTasks.set([]);
        this.isLoading.set(false);
      },
    });

    // 4. Load Bugs
    this.service.getBugsByProject(pId).subscribe({
      next: (bugs) => {
        this.allBugs.set(bugs || []);
      },
      error: (err) => {
        console.error('Load bugs error:', err);
        this.allBugs.set([]);
      },
    });
  }

  // Filter actions
  selectSpecification(specId: string | null): void {
    this.selectedSpecId.set(specId);
  }

  getTaskCountBySpec(specId: string): number {
    return this.allTasks().filter((t) => t.specificationId === specId).length;
  }

  clearFilters(): void {
    this.selectedSpecId.set(null);
    this.selectedWpId.set(null);
    this.selectedPriority.set(null);
    this.selectedAssignee.set(null);
    this.searchQuery.set('');
  }

  // Modal Actions
  openCreateTask(preselectedSpecId?: string | null): void {
    this.isModalEdit.set(false);
    this.selectedTaskId.set(null);
    this.isModalOpen.set(true);
    setTimeout(() => {
      this.taskModal?.initForCreate(preselectedSpecId || this.selectedSpecId());
    });
  }

  openEditTask(task: TaskResponse): void {
    this.isModalEdit.set(true);
    this.selectedTaskId.set(task.id);
    this.isModalOpen.set(true);
    setTimeout(() => {
      this.taskModal?.loadTaskData(task);
    });
  }

  onTaskSaved(saved: TaskResponse): void {
    const list = [...this.allTasks()];
    const idx = list.findIndex((t) => t.id === saved.id);
    if (idx >= 0) {
      list[idx] = saved;
    } else {
      list.unshift(saved);
    }
    this.allTasks.set(list);
  }

  deleteTask(task: TaskResponse, event?: Event): void {
    if (event) event.stopPropagation();
    this.dialog
      .confirm('ยืนยันการลบ', `คุณต้องการลบ Task "${task.taskName}" (${task.taskCode}) ใช่หรือไม่?`)
      .then((confirmed) => {
        if (!confirmed) return;
        this.service.deleteTask(task.id).subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'ลบ Task เรียบร้อย');
            this.allTasks.set(this.allTasks().filter((t) => t.id !== task.id));
          },
          error: (err) => this.dialog.error('ลบไม่สำเร็จ', err.message),
        });
      });
  }

  // ===== SIC-KANBAN INTEGRATED ACTIONS =====
  onKanbanTaskStatusChange(event: KanbanStatusChangeEvent): void {
    const payload: any = {
      workPackageId: event.task.workPackageId,
      specificationId: event.task.specificationId,
      taskCode: event.task.taskCode,
      taskName: event.task.taskName,
      description: event.task.description,
      assignedTo: event.task.assignedTo,
      startDate: event.task.startDate,
      endDate: event.task.endDate,
      estimateManday: event.task.estimateManday || 1,
      priority: event.task.priority || 'Medium',
      status: event.newStatus,
      assigneeIds: event.task.assigneeIds || [],
    };

    this.service.updateTask(event.taskId, payload).subscribe({
      next: (updated) => {
        const all = [...this.allTasks()];
        const idx = all.findIndex((t) => t.id === updated.id);
        if (idx >= 0) all[idx] = updated;
        this.allTasks.set(all);

        // If a Bug Task is moved to complete, check if all bugs of the work package/parent task are resolved
        const isComplete = ['complete', 'done', 'completed'].includes((event.newStatus || '').toLowerCase());
        const isBug = (event.task.taskCode || '').toUpperCase().startsWith('BUG') || (event.task.taskName || '').toUpperCase().startsWith('[BUG]');

        if (isComplete && isBug && event.task.workPackageId) {
          this.checkAndAutoMoveParentTaskToTesting(event.task.workPackageId, event.task.id);
        }
      },
      error: (err) => {
        this.dialog.error('อัปเดตสถานะไม่สำเร็จ', err.message);
        this.loadProjectData(this.projectId()!);
      },
    });
  }

  private checkAndAutoMoveParentTaskToTesting(wpId: string, completedBugId: string): void {
    const tasks = this.allTasks().filter((t) => t.workPackageId === wpId);
    const bugfixTasks = tasks.filter((t) => (t.status || '').toLowerCase() === 'bugfix');

    bugfixTasks.forEach((parentTask) => {
      const hasUnresolvedBugs = tasks.some((t) => {
        if (t.id === completedBugId) return false;
        const isTaskBug = (t.taskCode || '').toUpperCase().startsWith('BUG') || (t.taskName || '').toUpperCase().startsWith('[BUG]');
        const isTaskDone = ['complete', 'done', 'completed'].includes((t.status || '').toLowerCase());
        return isTaskBug && !isTaskDone;
      });

      if (!hasUnresolvedBugs) {
        const updatedParentPayload: any = {
          ...parentTask,
          status: 'Testing',
        };
        this.service.updateTask(parentTask.id, updatedParentPayload).subscribe({
          next: (updatedParent) => {
            const all = [...this.allTasks()];
            const idx = all.findIndex((t) => t.id === updatedParent.id);
            if (idx >= 0) all[idx] = updatedParent;
            this.allTasks.set(all);
            console.log(`Parent task ${parentTask.taskCode} auto-moved back to Testing because all bugs are resolved.`);
          },
          error: (err) => console.error('Failed to auto-move parent task to Testing:', err),
        });
      }
    });
  }

  onKanbanTaskClick(task: TaskResponse): void {
    this.openEditTask(task);
  }

  onKanbanTaskDelete(task: TaskResponse): void {
    this.deleteTask(task);
  }

  onKanbanTaskCreate(event: { status: string; workPackageId?: string }): void {
    this.openCreateTask(this.selectedSpecId());
  }

  // Helpers
  getPriorityClass(priority?: string): string {
    const p = (priority || '').toLowerCase();
    if (p === 'critical') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    if (p === 'high') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
    if (p === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  }

  getStatusClass(status?: string): string {
    const s = (status || '').toLowerCase();
    if (['bug complete', 'bug completed', 'bug done'].includes(s)) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-500/30';
    if (['done', 'completed', 'complete', 'closed'].includes(s)) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (['in progress', 'doing'].includes(s)) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    if (['waiting review', 'review'].includes(s)) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    if (['waiting fix', 'blocked', 'delayed', 'bugfix', 'bug fixing', 'bug'].includes(s)) return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr.split('T')[0];
    }
  }

  isOverdue(endDateStr?: string, status?: string): boolean {
    if (!endDateStr || ['done', 'completed'].includes((status || '').toLowerCase())) return false;
    try {
      const end = new Date(endDateStr);
      return end.getTime() < Date.now();
    } catch {
      return false;
    }
  }
}