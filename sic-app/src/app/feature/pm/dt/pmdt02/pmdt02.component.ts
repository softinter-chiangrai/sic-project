// src/app/feature/pm/dt/pmdt02/pmdt02.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import dayjs from '../../../../core/dayjs';
import { DialogService } from '../../../../core/services/dialog.service';

import type {
  MilestoneResponse,
  PhaseResponse,
  TaskResponse,
  WorkPackageResponse,
} from '../../../../core/model/phase.model';
import { MilestoneService } from '../../../../core/services/milestone.service';
import { PhaseService } from '../../../../core/services/phase.service';
import { TaskService } from '../../../../core/services/task.service';
import { WorkPackageService } from '../../../../core/services/work-package.service';
import { DhtmlxGanttComponent, DhtmlxGanttTask } from '../../../../core/component/sic-ganttchart/dhtmlx-gantt.component';
import { CalendarItem, SicCalendarComponent } from '../../../../core/component/sic-calendar/sic-calendar.component';




@Component({
  selector: 'app-pmdt02',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DhtmlxGanttComponent,
    SicCalendarComponent,
    DhtmlxGanttComponent
],
  templateUrl: './pmdt02.component.html',
})
export class Pmdt02Component implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private phaseService = inject(PhaseService);
  private milestoneService = inject(MilestoneService);
  private wpService = inject(WorkPackageService);
  private taskService = inject(TaskService);
  private dialog = inject(DialogService);

  // ===== SIGNALS =====
  phase = signal<PhaseResponse | null>(null);
  isLoading = signal(false);
  projectId = signal('');
  currentPhaseId = signal('');
  expandedMilestone = signal<string | null>(null);
  expandedWorkPackage = signal<string | null>(null);
  rightTab = signal<'list' | 'calendar' | 'gantt'>('list');

  // ===== DHTMLX GANTT TASKS =====
  protected dhtmlxTasks = computed<DhtmlxGanttTask[]>(() => {
    const p = this.phase();
    if (!p) return [];

    const result: DhtmlxGanttTask[] = [];

    // 1. Phase
    result.push({
      id: `phase-${p.id}`,
      text: `📍 ${p.phaseName}`,
      start_date: this.formatDateForDhtmlx(p.startDate),
      end_date: this.formatDateForDhtmlx(p.endDate),
      progress: p.progress / 100,
      open: true,
      color: p.color || '#4A90D9'
    });

    // 2. Milestones
    p.milestones?.forEach((ms) => {
      const msId = `ms-${ms.id}`;
      result.push({
        id: msId,
        text: `📌 ${ms.milestoneName}`,
        start_date: this.formatDateForDhtmlx(ms.dueDate),
        end_date: this.formatDateForDhtmlx(ms.dueDate),
        progress: ms.status === 'Done' ? 1 : 0.5,
        parent: `phase-${p.id}`,
        color: ms.color || '#E67E22'
      });

      // 3. Work Packages
      ms.workPackages?.forEach((wp) => {
        const wpId = `wp-${wp.id}`;
        if (wp.startDate && wp.endDate) {
          result.push({
            id: wpId,
            text: `📦 ${wp.packageName}`,
            start_date: this.formatDateForDhtmlx(wp.startDate),
            end_date: this.formatDateForDhtmlx(wp.endDate),
            progress: this.calculateWpProgress(wp),
            parent: msId,
            color: wp.color || '#8E44AD'
          });
        }

        // 4. Tasks
        wp.tasks?.forEach((task) => {
          if (task.startDate) {
            result.push({
              id: task.id,
              text: `🔹 ${task.taskName}`,
              start_date: this.formatDateForDhtmlx(task.startDate),
              end_date: task.endDate ? this.formatDateForDhtmlx(task.endDate) : this.formatDateForDhtmlx(task.startDate),
              progress: task.status === 'Done' ? 1 :
                       task.status === 'In Progress' ? 0.5 : 0,
              parent: `wp-${wp.id}`,
              color: task.color || '#2ECC71'
            });
          }
        });
      });
    });

    return result;
  });

  // ===== CALENDAR ITEMS =====
  calendarItems = computed<CalendarItem[]>(() => {
    const p = this.phase();
    if (!p) return [];
    const result: CalendarItem[] = [];

    // Phase
    if (p.startDate && p.endDate) {
      const start = dayjs.utc(p.startDate);
      const end = dayjs.utc(p.endDate);
      const days = end.diff(start, 'day') + 1;
      for (let i = 0; i < days; i++) {
        const date = start.add(i, 'day');
        result.push({
          id: p.id,
          type: 'phase',
          title: p.phaseName,
          color: p.color || '#4A90D9',
          date: date.toISOString(),
          completed: false,
        });
      }
    }

    // Milestones
    p.milestones?.forEach((ms) => {
      if (ms.dueDate) {
        result.push({
          id: ms.id,
          type: 'milestone',
          title: ms.milestoneName,
          color: ms.color || '#E67E22',
          date: dayjs.utc(ms.dueDate).toISOString(),
          completed: false,
        });
      }

      // WorkPackages
      ms.workPackages?.forEach((wp) => {
        if (wp.startDate && wp.endDate) {
          const start = dayjs.utc(wp.startDate);
          const end = dayjs.utc(wp.endDate);
          const days = end.diff(start, 'day') + 1;
          for (let i = 0; i < days; i++) {
            const date = start.add(i, 'day');
            result.push({
              id: wp.id,
              type: 'workpackage',
              title: wp.packageName,
              color: wp.color || '#8E44AD',
              date: date.toISOString(),
              completed: false,
            });
          }
        }

        // Tasks
        wp.tasks?.forEach((task) => {
          if (task.startDate) {
            result.push({
              id: task.id,
              type: 'task',
              title: task.taskName,
              color: task.color || '#2ECC71',
              date: dayjs.utc(task.startDate).toISOString(),
              completed: task.status === 'Done',
              extra: { workPackageId: wp.id },
            });
          }
        });
      });
    });

    return result;
  });

  // ===== HELPERS =====
  private formatDateForDhtmlx(dateStr: string | undefined): string {
    if (!dateStr) return '01-01-2024';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private calculateWpProgress(wp: any): number {
    if (!wp.tasks || wp.tasks.length === 0) return 0;
    const done = wp.tasks.filter((t: any) => t.status === 'Done').length;
    return done / wp.tasks.length;
  }

  // ===== LIFECYCLE =====
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const phaseId = params.get('id');
      this.route.queryParams.subscribe((qParams) => {
        const pid = qParams['projectId'];
        if (phaseId && pid) {
          this.currentPhaseId.set(phaseId);
          this.projectId.set(pid);
          this.loadPhaseDetail(phaseId);
        } else {
          this.router.navigate(['/feature/pm/pmdt01'], {
            queryParams: { projectId: this.projectId() },
          });
        }
      });
    });
  }

  loadPhaseDetail(phaseId: string) {
    this.isLoading.set(true);
    this.phaseService.getPhaseById(phaseId).subscribe({
      next: (data) => {
        this.phase.set(data);
        this.loadMilestones(phaseId);
      },
      error: (err) => {
        console.error(err);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายละเอียด Phase ได้');
        this.router.navigate(['/feature/pm/pmdt01'], {
          queryParams: { projectId: this.projectId() },
        });
      },
      complete: () => this.isLoading.set(false),
    });
  }

  loadMilestones(phaseId: string) {
    this.milestoneService.getMilestonesByPhaseId(phaseId).subscribe({
      next: (milestones) => {
        const current = this.phase();
        if (current) {
          this.phase.set({
            ...current,
            milestones: milestones,
          });
          this.loadWorkPackagesForMilestones(milestones);
        }
      },
      error: (err) => console.error(err),
    });
  }

  private loadWorkPackagesForMilestones(milestones: MilestoneResponse[]) {
    if (!milestones || milestones.length === 0) return;
    milestones.forEach((ms) => {
      this.wpService.getWorkPackagesByMilestoneId(ms.id).subscribe({
        next: (workPackages) => {
          const current = this.phase();
          if (current?.milestones) {
            const target = current.milestones.find((m) => m.id === ms.id);
            if (target) {
              target.workPackages = workPackages;
              this.phase.set({ ...current });
            }
          }
        },
        error: (err) => console.error(`Failed to load WPs for milestone ${ms.id}`, err),
      });
    });
  }

  private loadTasksForWorkPackage(wpId: string) {
    const current = this.phase();
    if (!current) return;
    let targetWp: WorkPackageResponse | null = null;
    for (const ms of current.milestones || []) {
      const found = ms.workPackages?.find((w) => w.id === wpId);
      if (found) {
        targetWp = found;
        break;
      }
    }
    if (!targetWp) return;
    if (!targetWp.tasks || targetWp.tasks.length === 0) {
      this.taskService.getTasksByWorkPackageId(wpId).subscribe({
        next: (tasks) => {
          targetWp!.tasks = tasks;
          this.phase.set({ ...current });
        },
        error: (err) => console.error(`Failed to load tasks for WP ${wpId}`, err),
      });
    }
  }

  // ===== TOGGLE =====
  toggleMilestone(msId: string) {
    this.expandedMilestone.set(this.expandedMilestone() === msId ? null : msId);
  }

  toggleWorkPackage(wpId: string) {
    if (this.expandedWorkPackage() !== wpId) {
      this.loadTasksForWorkPackage(wpId);
    }
    this.expandedWorkPackage.set(this.expandedWorkPackage() === wpId ? null : wpId);
  }

  getTotalWorkPackages(phase: PhaseResponse): number {
    let count = 0;
    phase.milestones?.forEach((ms) => {
      count += ms.workPackages?.length || 0;
    });
    return count;
  }

  // ===== CRUD =====
  openCreateMilestone() {
    const phaseId = this.currentPhaseId();
    if (!phaseId) return;
    this.router.navigate(['/feature/pm/milestone/new'], {
      queryParams: { phaseId, projectId: this.projectId() },
    });
  }

  editMilestone(ms: MilestoneResponse, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/feature/pm/milestone', ms.id, 'edit'], {
      queryParams: { projectId: this.projectId() },
    });
  }

  deleteMilestone(ms: MilestoneResponse, event: Event) {
    event.stopPropagation();
    this.dialog.confirm('ยืนยันการลบ', `ลบ Milestone "${ms.milestoneName}"?`).then((confirmed) => {
      if (confirmed) {
        this.milestoneService.deleteMilestone(ms.id).subscribe({
          next: () => {
            const current = this.phase();
            if (current?.milestones) {
              current.milestones = current.milestones.filter((m) => m.id !== ms.id);
              this.phase.set({ ...current });
            }
          },
          error: (err) => this.dialog.error('ลบไม่สำเร็จ', err.message),
        });
      }
    });
  }

  openCreateWorkPackage(milestoneId: string) {
    this.router.navigate(['/feature/pm/work-package/new'], {
      queryParams: {
        milestoneId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
      },
    });
  }

  openCreateWorkPackageForPhase() {
    const p = this.phase();
    if (!p || !p.milestones || p.milestones.length === 0) {
      this.dialog.error('ไม่มี Milestone', 'กรุณาสร้าง Milestone ก่อน');
      return;
    }
    this.openCreateWorkPackage(p.milestones[0].id);
  }

  editWorkPackage(wp: WorkPackageResponse, milestoneId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/feature/pm/work-package', wp.id, 'edit'], {
      queryParams: {
        milestoneId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
      },
    });
  }

  deleteWorkPackage(wp: WorkPackageResponse, event: Event) {
    event.stopPropagation();
    this.dialog.confirm('ยืนยันการลบ', `ลบ Work Package "${wp.packageName}"?`).then((confirmed) => {
      if (confirmed) {
        this.wpService.deleteWorkPackage(wp.id).subscribe({
          next: () => {
            const current = this.phase();
            if (current?.milestones) {
              current.milestones = current.milestones.map((m) => ({
                ...m,
                workPackages: m.workPackages?.filter((w) => w.id !== wp.id) || [],
              }));
              this.phase.set({ ...current });
            }
          },
          error: (err) => this.dialog.error('ลบไม่สำเร็จ', err.message),
        });
      }
    });
  }

  openCreateTask(workPackageId: string) {
    this.router.navigate(['/feature/pm/task/new'], {
      queryParams: {
        workPackageId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
      },
    });
  }

  editTask(task: TaskResponse, workPackageId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/feature/pm/task', task.id, 'edit'], {
      queryParams: {
        workPackageId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
      },
    });
  }

  deleteTask(task: TaskResponse, event: Event) {
    event.stopPropagation();
    this.dialog.confirm('ยืนยันการลบ', `ลบ Task "${task.taskName}"?`).then((confirmed) => {
      if (confirmed) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            const current = this.phase();
            if (current?.milestones) {
              current.milestones = current.milestones.map((m) => ({
                ...m,
                workPackages:
                  m.workPackages?.map((wp) => ({
                    ...wp,
                    tasks: wp.tasks?.filter((t) => t.id !== task.id) || [],
                  })) || [],
              }));
              this.phase.set({ ...current });
            }
          },
          error: (err) => this.dialog.error('ลบไม่สำเร็จ', err.message),
        });
      }
    });
  }

  // ===== GANTT EVENTS =====
  onGanttTaskUpdated(task: DhtmlxGanttTask): void {
    console.log('[Gantt] Task updated:', task);
    // TODO: Sync with backend
  }

  onGanttTaskDeleted(taskId: string): void {
    console.log('[Gantt] Task deleted:', taskId);
    // TODO: Delete from backend
  }

  onGanttTaskCreated(task: DhtmlxGanttTask): void {
    console.log('[Gantt] Task created:', task);
    // TODO: Create in backend
  }

  // ===== CALENDAR EVENT =====
  onCalendarItemClick(item: CalendarItem): void {
    const projectId = this.projectId();
    const phaseId = this.currentPhaseId();

    switch (item.type) {
      case 'phase':
        this.router.navigate(['/feature/pm/phase', item.id, 'edit'], {
          queryParams: { projectId },
        });
        break;
      case 'milestone':
        this.router.navigate(['/feature/pm/milestone', item.id, 'edit'], {
          queryParams: { projectId, phaseId },
        });
        break;
      case 'workpackage':
        this.router.navigate(['/feature/pm/work-package', item.id, 'edit'], {
          queryParams: { projectId, phaseId },
        });
        break;
      case 'task':
        const wpId = item.extra?.['workPackageId'] || '';
        this.router.navigate(['/feature/pm/task', item.id, 'edit'], {
          queryParams: { projectId, phaseId, workPackageId: wpId },
        });
        break;
      default:
        break;
    }
  }

  // ===== NAVIGATION =====
  goBack() {
    this.router.navigate(['/feature/pm/pmdt01'], { queryParams: { projectId: this.projectId() } });
  }

  // ===== UTILITIES =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Not Started': 'bg-gray-100 text-gray-600',
      'In Progress': 'bg-blue-100 text-blue-700',
      Done: 'bg-emerald-100 text-emerald-700',
      Delayed: 'bg-red-100 text-red-700',
      Todo: 'bg-gray-100 text-gray-600',
      'Waiting Review': 'bg-purple-100 text-purple-700',
      'Waiting Fix': 'bg-orange-100 text-orange-700',
      Blocked: 'bg-rose-100 text-rose-700',
      Cancelled: 'bg-gray-300 text-gray-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      'Not Started': 'ยังไม่เริ่ม',
      'In Progress': 'กำลังดำเนินการ',
      Done: 'เสร็จสิ้น',
      Delayed: 'ล่าช้า',
      Todo: 'รอเริ่ม',
      'Waiting Review': 'รอ Review',
      'Waiting Fix': 'รอแก้ไข',
      Blocked: 'ติดปัญหา',
      Cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }
}