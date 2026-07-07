// src/app/feature/pm/dt/pmdt02/pmdt02.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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

import { DrawerService } from '../../../../core/component/sic-drawer/drawer.service';
import { Pmdt03Component } from '../pmdt03/pmdt03.component';
import { Pmdt04Component } from '../pmdt04/pmdt04.component';
import { Pmdt02AComponent } from './pmdt02A/pmdt02A.component';

import { environment } from '../../../../../environments/environment';
import {
  GanttTask,
  SicGanttchartComponent,
} from '../../../../core/component/sic-ganttchart/ganttchart.component';
import {
  SicCalendarTask,
  SicTaskComponent,
  SicTaskConfig,
} from '../../../../core/component/sic-task/sic-task.component';

@Component({
  selector: 'app-pmdt02',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SicTaskComponent,
    SicGanttchartComponent,
    Pmdt02AComponent,
    Pmdt03Component,
    Pmdt04Component,
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
  private drawerService = inject(DrawerService);

  // ===== State =====
  phase = signal<PhaseResponse | null>(null);
  isLoading = signal(false);
  projectId = signal('');
  currentPhaseId = signal('');
  expandedMilestone = signal<string | null>(null);
  expandedWorkPackage = signal<string | null>(null);
  rightTab = signal<'list' | 'calendar' | 'gantt'>('list');

  // ===== Task Config =====
  taskConfig = computed<SicTaskConfig>(() => ({
    api: `${environment.apiBaseUrl}/api/pm/projects/${this.currentPhaseId()}/tasks`,
    id: 'id',
    startDateParam: 'startDate',
    endDateParam: 'endDate',
    saveApi: `${environment.apiBaseUrl}/api/pm/tasks`,
    saveMethod: 'POST',
    mapSearchItem: (item: Record<string, unknown>): SicCalendarTask => {
      return {
        id: String(item['id'] || crypto.randomUUID()),
        title: String(item['taskName'] || item['title'] || 'Untitled Task'),
        description: String(item['description'] || ''),
        date: String(item['endDate'] || item['startDate'] || new Date().toISOString()),
        color: '#4ECDC4',
        completed: item['status'] === 'Done',
      };
    },
    savePayload: (task: SicCalendarTask, state: number): unknown => {
      return {
        id: task.id,
        taskName: task.title,
        description: task.description,
        endDate: task.date,
        status: task.completed ? 'Done' : 'Todo',
        workPackageId: null,
        state: state,
      };
    },
  }));

  // ===== Computed Gantt Tasks =====
  protected ganttTasks = computed<GanttTask[]>(() => {
    const p = this.phase();
    if (!p) return [];

    const tasks: GanttTask[] = [];
    p.milestones?.forEach((ms) => {
      ms.workPackages?.forEach((wp) => {
        wp.tasks?.forEach((t) => {
          if (!t.startDate || !t.endDate) return;
          tasks.push({
            id: t.id,
            taskCode: t.taskCode,
            taskName: t.taskName,
            projectId: this.projectId(),
            projectName: p.phaseName,
            assignedTo: t.assignedTo || '-',
            startDate: t.startDate,
            endDate: t.endDate,
            status: t.status,
            priority: t.priority,
            estimateManday: t.estimateManday,
            actualManday: t.actualManday,
          });
        });
      });
    });
    return tasks;
  });

  // ===== Lifecycle =====
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

  // ===== โหลดข้อมูลหลัก =====
  loadPhaseDetail(phaseId: string) {
    this.isLoading.set(true);
    this.phaseService.getPhaseById(phaseId).subscribe({
      next: (data) => {
        this.phase.set(data);
        if (data.milestones && data.milestones.length > 0) {
          // ถ้ามี Milestone อยู่แล้ว ให้โหลด Work Packages ทันที
          this.loadWorkPackagesForMilestones(data.milestones);
        } else {
          // ถ้าไม่มีให้โหลด Milestone ก่อน
          this.loadMilestones(phaseId);
        }
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
          current.milestones = milestones;
          this.phase.set({ ...current });
          // ✅ โหลด Work Packages ของทุก Milestone ที่ได้
          this.loadWorkPackagesForMilestones(milestones);
        }
      },
      error: (err) => console.error(err),
    });
  }

  // ===== โหลด Work Packages สำหรับทุก Milestone =====
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
              this.phase.set({ ...current }); // trigger re-render
            }
          }
        },
        error: (err) => console.error(`Failed to load WPs for milestone ${ms.id}`, err),
      });
    });
  }

  // ===== โหลด Tasks สำหรับ Work Package (เมื่อคลิกขยาย) =====
  private loadTasksForWorkPackage(wpId: string) {
    const current = this.phase();
    if (!current) return;

    // ค้นหา Work Package ที่มี id ตรงกัน
    let targetWp: WorkPackageResponse | null = null;
    for (const ms of current.milestones || []) {
      const found = ms.workPackages?.find((w) => w.id === wpId);
      if (found) {
        targetWp = found;
        break;
      }
    }

    if (!targetWp) return;

    // ถ้ายังไม่มี tasks หรือเป็น null ให้โหลด
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

  // ===== Toggle Expand =====
  toggleMilestone(msId: string) {
    this.expandedMilestone.set(this.expandedMilestone() === msId ? null : msId);
  }

  toggleWorkPackage(wpId: string) {
    // ถ้ากำลังขยาย → โหลด Tasks
    if (this.expandedWorkPackage() !== wpId) {
      this.loadTasksForWorkPackage(wpId);
    }
    this.expandedWorkPackage.set(this.expandedWorkPackage() === wpId ? null : wpId);
  }

  // ===== Helpers =====
  getTotalWorkPackages(phase: PhaseResponse): number {
    let count = 0;
    phase.milestones?.forEach((ms) => {
      count += ms.workPackages?.length || 0;
    });
    return count;
  }

  // ===== Milestone CRUD =====
  openCreateMilestone() {
    const phaseId = this.currentPhaseId();
    if (!phaseId) return;
    this.drawerService.open({
      component: Pmdt02AComponent,
      title: 'สร้าง Milestone ใหม่',
      inputs: {
        phaseId: phaseId,
        projectId: this.projectId(),
        isEdit: false,
      },
      width: '560px',
      onSaved: () => {
        this.loadPhaseDetail(phaseId); // reload หลังจากบันทึก
      },
    });
  }

  editMilestone(ms: MilestoneResponse, event: Event) {
    event.stopPropagation();
    this.drawerService.open({
      component: Pmdt02AComponent,
      title: 'แก้ไข Milestone',
      inputs: {
        milestoneId: ms.id,
        phaseId: this.currentPhaseId(),
        projectId: this.projectId(),
        isEdit: true,
        data: ms,
      },
      width: '560px',
      onSaved: () => {
        this.loadPhaseDetail(this.currentPhaseId());
      },
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

  // ===== Work Package CRUD =====
  openCreateWorkPackage(milestoneId: string) {
    this.drawerService.open({
      component: Pmdt03Component,
      title: 'สร้าง Work Package ใหม่',
      inputs: {
        milestoneId: milestoneId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
        isEdit: false,
      },
      width: '560px',
      onSaved: () => {
        this.loadPhaseDetail(this.currentPhaseId());
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
    this.drawerService.open({
      component: Pmdt03Component,
      title: 'แก้ไข Work Package',
      inputs: {
        wpId: wp.id,
        milestoneId: milestoneId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
        isEdit: true,
        data: wp,
      },
      width: '560px',
      onSaved: () => {
        this.loadPhaseDetail(this.currentPhaseId());
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

  // ===== Task CRUD =====
  openCreateTask(workPackageId: string) {
    this.drawerService.open({
      component: Pmdt04Component,
      title: 'สร้าง Task ใหม่',
      inputs: {
        workPackageId: workPackageId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
        isEdit: false,
      },
      width: '600px',
      onSaved: () => {
        // reload ข้อมูลทั้งหมด เพื่อให้เห็น Task ใหม่
        this.loadPhaseDetail(this.currentPhaseId());
      },
    });
  }

  editTask(task: TaskResponse, workPackageId: string, event: Event) {
    event.stopPropagation();
    this.drawerService.open({
      component: Pmdt04Component,
      title: 'แก้ไข Task',
      inputs: {
        taskId: task.id,
        workPackageId: workPackageId,
        projectId: this.projectId(),
        phaseId: this.currentPhaseId(),
        isEdit: true,
        data: task,
      },
      width: '600px',
      onSaved: () => {
        this.loadPhaseDetail(this.currentPhaseId());
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

  // ===== Navigation =====
  goBack() {
    this.router.navigate(['/feature/pm/pmdt01'], { queryParams: { projectId: this.projectId() } });
  }

  // ===== Calendar Events =====
  onCalendarTasksChange(tasks: SicCalendarTask[]) {
    console.log('Tasks changed:', tasks);
  }

  onTaskAdded(task: SicCalendarTask) {
    console.log('Task added:', task);
  }

  onTaskRemoved(task: SicCalendarTask) {
    console.log('Task removed:', task);
  }

  // ===== Status Utilities =====
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
