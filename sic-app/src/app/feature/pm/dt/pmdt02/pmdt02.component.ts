// src/app/feature/pm/dt/pmdt02/pmdt02.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import dayjs from '../../../../core/dayjs';
import { DialogService } from '../../../../core/services/dialog.service';

import type {
  MilestoneResponse,
  PhaseResponse,
  TaskResponse,
  WorkPackageResponse,
} from '../../../../core/model/phase.model';
import { MilestoneService } from './milestone.service';
import { PhaseService } from './phase.service';
import { TaskService } from './task.service';
import { WorkPackageService } from './work-package.service';
import 'dayjs/locale/th';
import {
  SicCalendarComponent,
  SicCalendarEvent,
  SicCalendarHoliday,
  SicCalendarTimelineComponent,
  SicCalendarTimelineRow,
  SicCalendarTimelineViewMode,
  SicCalendarEra,
  SicCalendarView,
} from 'sic-ng';
import { buildCalendarEvents, buildCalendarHolidays, buildTimelineItems } from './pmdt02.utils';

@Component({
  selector: 'app-pmdt02',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SicCalendarComponent,
    SicCalendarTimelineComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
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
  calendarEra = signal<SicCalendarEra>('BE');
  calendarView = signal<SicCalendarView>('grid');
  timelineViewMode = signal<SicCalendarTimelineViewMode>('week');

  switchTab(tab: 'list' | 'calendar' | 'gantt'): void {
    this.rightTab.set(tab);
  }

  // ===== CALENDAR & TIMELINE DATA =====
  calendarTasks = computed<SicCalendarEvent[]>(() => {
    const p = this.phase();
    if (!p) return [];
    return buildCalendarEvents(p);
  });

  calendarHolidays = computed<SicCalendarHoliday[]>(() => {
    const p = this.phase();
    if (!p) return [];
    return buildCalendarHolidays(p);
  });

  timelineItems = computed<SicCalendarTimelineRow[]>(() => {
    const p = this.phase();
    if (!p) return [];
    return buildTimelineItems(p);
  });

  timelineStartDate = computed(() => {
    const p = this.phase();
    if (p?.startDate) return p.startDate.split('T')[0];
    return dayjs().format('YYYY-MM-DD');
  });

  timelineEndDate = computed(() => {
    const p = this.phase();
    if (p?.endDate) return p.endDate.split('T')[0];
    return dayjs().add(30, 'day').format('YYYY-MM-DD');
  });

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

  // ===== NAVIGATION TO FULLSCREEN GANTT =====
  goToGanttFullscreen() {
    const phaseId = this.currentPhaseId();
    const projectId = this.projectId();
    if (phaseId) {
      this.router.navigate(['/feature/pm/phase', phaseId, 'gantt'], {
        queryParams: { projectId }
      });
    }
  }

  // ===== CALENDAR & TIMELINE EVENT HANDLERS =====
  handleCalendarEventClick(event: SicCalendarEvent): void {
    const extra = (event as any).extra;
    if (!extra) return;

    const projectId = this.projectId();
    const phaseId = this.currentPhaseId();

    switch (extra.type) {
      case 'phase':
        this.router.navigate(['/feature/pm/phase', extra.id, 'edit'], {
          queryParams: { projectId },
        });
        break;
      case 'milestone':
        this.router.navigate(['/feature/pm/milestone', extra.id, 'edit'], {
          queryParams: { projectId, phaseId },
        });
        break;
      case 'workpackage':
        this.router.navigate(['/feature/pm/work-package', extra.id, 'edit'], {
          queryParams: { projectId, phaseId },
        });
        break;
      case 'task':
        this.router.navigate(['/feature/pm/task', extra.id, 'edit'], {
          queryParams: { projectId, phaseId, workPackageId: extra.workPackageId || '' },
        });
        break;
    }
  }

  onTimelineRowClick(row: SicCalendarTimelineRow): void {
    this.navigateFromTimelineData(row.data);
  }

  onTimelinePhaseClick(event: { row: SicCalendarTimelineRow; phase: any }): void {
    this.navigateFromTimelineData(event.row.data);
  }

  private navigateFromTimelineData(data: any): void {
    if (!data) return;
    const projectId = this.projectId();
    const phaseId = this.currentPhaseId();

    switch (data.type) {
      case 'phase':
        this.router.navigate(['/feature/pm/phase', data.id, 'edit'], {
          queryParams: { projectId },
        });
        break;
      case 'milestone':
        this.router.navigate(['/feature/pm/milestone', data.id, 'edit'], {
          queryParams: { projectId, phaseId },
        });
        break;
      case 'workpackage':
        this.router.navigate(['/feature/pm/work-package', data.id, 'edit'], {
          queryParams: { projectId, phaseId },
        });
        break;
      case 'task':
        this.router.navigate(['/feature/pm/task', data.id, 'edit'], {
          queryParams: { projectId, phaseId, workPackageId: data.workPackageId || '' },
        });
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