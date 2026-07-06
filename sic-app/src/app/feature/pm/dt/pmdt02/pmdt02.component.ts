// src/app/feature/pm/dt/pmdt02/pmdt02.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DialogService } from '../../../../core/services/dialog.service';

import { WorkPackageService } from '../../../../core/services/work-package.service';
import { MilestoneService } from '../../../../core/services/milestone.service';
import { TaskService } from '../../../../core/services/task.service';
import type { MilestoneResponse, PhaseResponse, TaskResponse, WorkPackageResponse, TaskRequest } from '../../../../core/model/phase.model';
import { PhaseService } from '../../../../core/services/phase.service';

import { Pmdt03Component } from '../pmdt03/pmdt03.component';
import { Pmdt04Component } from '../pmdt04/pmdt04.component';
import { DrawerService } from '../../../../core/component/sic-drawer/drawer.service';
import { Pmdt02AComponent } from './pmdt02A/pmdt02A.component';

@Component({
  selector: 'app-pmdt02',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  phase = signal<PhaseResponse | null>(null);
  isLoading = signal(false);
  projectId = signal('');
  currentPhaseId = signal('');
  expandedWorkPackage = signal<string | null>(null);
  rightTab = signal<'workspace' | 'gantt'>('workspace');

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
          this.router.navigate(['/feature/pm/pmdt01'], { queryParams: { projectId: this.projectId() } });
        }
      });
    });
  }

  loadPhaseDetail(phaseId: string) {
    this.isLoading.set(true);
    this.phaseService.getPhaseById(phaseId).subscribe({
      next: (data) => {
        this.phase.set(data);
        if (!data.milestones || data.milestones.length === 0) {
          this.loadMilestones(phaseId);
        }
      },
      error: (err) => {
        console.error(err);
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายละเอียด Phase ได้');
        this.router.navigate(['/feature/pm/pmdt01'], { queryParams: { projectId: this.projectId() } });
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
        }
      },
      error: (err) => console.error(err),
    });
  }

  toggleWorkPackage(wpId: string) {
    this.expandedWorkPackage.set(this.expandedWorkPackage() === wpId ? null : wpId);
  }

  goBack() {
    this.router.navigate(['/feature/pm/pmdt01'], { queryParams: { projectId: this.projectId() } });
  }

  getTotalWorkPackages(phase: PhaseResponse): number {
    let count = 0;
    phase.milestones?.forEach((ms) => {
      count += ms.workPackages?.length || 0;
    });
    return count;
  }

  openCreateWorkPackageFromHeader() {
    const phase = this.phase();
    if (!phase || !phase.milestones || phase.milestones.length === 0) {
      this.dialog.warn('ไม่มี Milestone', 'กรุณาสร้าง Milestone ก่อนเพื่อเพิ่ม Work Package');
      return;
    }
    const firstMilestone = phase.milestones[0];
    this.openCreateWorkPackage(firstMilestone.id);
  }

  toggleTaskStatus(task: TaskResponse, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const newStatus = checked ? 'Done' : 'Todo';
    // Build request from task data
    const request: TaskRequest = {
      workPackageId: task.workPackageId,
      taskCode: task.taskCode,
      taskName: task.taskName,
      description: task.description,
      assignedTo: task.assignedTo,
      startDate: task.startDate,
      endDate: task.endDate,
      estimateManday: task.estimateManday,
      priority: task.priority,
    };
    this.taskService.updateTask(task.id, request).subscribe({
      next: () => {
        const phaseId = this.currentPhaseId();
        if (phaseId) this.loadPhaseDetail(phaseId);
      },
      error: (err) => this.dialog.error('อัปเดตสถานะไม่สำเร็จ', err.message),
    });
  }

  // ---- Drawer: Milestone ----
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
    });
    
    // Subscribe to saved event to reload the phase data
    const subscription = this.drawerService.drawer$.subscribe((config) => {
      if (!config) {
        // If drawer is closed, we reload to ensure we get the latest data
        this.loadPhaseDetail(phaseId);
        subscription.unsubscribe();
      }
    });
  }

  editMilestone(ms: MilestoneResponse, event: Event) {
    event.stopPropagation();
    const phaseId = this.currentPhaseId();
    this.drawerService.open({
      component: Pmdt02AComponent,
      title: 'แก้ไข Milestone',
      inputs: {
        milestoneId: ms.id,
        phaseId: phaseId,
        projectId: this.projectId(),
        isEdit: true,
        data: ms,
      },
      width: '560px',
    });

    const subscription = this.drawerService.drawer$.subscribe((config) => {
      if (!config) {
        if (phaseId) this.loadPhaseDetail(phaseId);
        subscription.unsubscribe();
      }
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

  // ---- Drawer: WorkPackage ----
  openCreateWorkPackage(milestoneId: string) {
    const phaseId = this.currentPhaseId();
    this.drawerService.open({
      component: Pmdt03Component,
      title: 'สร้าง Work Package',
      inputs: {
        milestoneId: milestoneId,
        projectId: this.projectId(),
        phaseId: phaseId,
        isEdit: false,
      },
      width: '560px',
    });

    const subscription = this.drawerService.drawer$.subscribe((config) => {
      if (!config) {
        if (phaseId) this.loadPhaseDetail(phaseId);
        subscription.unsubscribe();
      }
    });
  }

  editWorkPackage(wp: WorkPackageResponse, event: Event) {
    event.stopPropagation();
    const phaseId = this.currentPhaseId();
    this.drawerService.open({
      component: Pmdt03Component,
      title: 'แก้ไข Work Package',
      inputs: {
        wpId: wp.id,
        milestoneId: wp.milestoneId,
        projectId: this.projectId(),
        phaseId: phaseId,
        isEdit: true,
        data: wp,
      },
      width: '560px',
    });

    const subscription = this.drawerService.drawer$.subscribe((config) => {
      if (!config) {
        if (phaseId) this.loadPhaseDetail(phaseId);
        subscription.unsubscribe();
      }
    });
  }

  deleteWorkPackage(wp: WorkPackageResponse, event: Event) {
    event.stopPropagation();
    this.dialog.confirm('ยืนยันการลบ', `ลบ Work Package "${wp.packageName}"?`).then((confirmed) => {
      if (confirmed) {
        this.wpService.deleteWorkPackage(wp.id).subscribe({
          next: () => {
            const phaseId = this.currentPhaseId();
            if (phaseId) this.loadPhaseDetail(phaseId);
          },
          error: (err) => this.dialog.error('ลบไม่สำเร็จ', err.message),
        });
      }
    });
  }

  // ---- Drawer: Task ----
  openCreateTask(wpId: string) {
    const phaseId = this.currentPhaseId();
    this.drawerService.open({
      component: Pmdt04Component,
      title: 'สร้าง Task',
      inputs: {
        workPackageId: wpId,
        projectId: this.projectId(),
        phaseId: phaseId,
        isEdit: false,
      },
      width: '560px',
    });

    const subscription = this.drawerService.drawer$.subscribe((config) => {
      if (!config) {
        if (phaseId) this.loadPhaseDetail(phaseId);
        subscription.unsubscribe();
      }
    });
  }

  editTask(task: TaskResponse, event: Event) {
    event.stopPropagation();
    const phaseId = this.currentPhaseId();
    this.drawerService.open({
      component: Pmdt04Component,
      title: 'แก้ไข Task',
      inputs: {
        taskId: task.id,
        workPackageId: task.workPackageId,
        projectId: this.projectId(),
        phaseId: phaseId,
        isEdit: true,
        data: task,
      },
      width: '560px',
    });

    const subscription = this.drawerService.drawer$.subscribe((config) => {
      if (!config) {
        if (phaseId) this.loadPhaseDetail(phaseId);
        subscription.unsubscribe();
      }
    });
  }

  deleteTask(task: TaskResponse, event: Event) {
    event.stopPropagation();
    this.dialog.confirm('ยืนยันการลบ', `ลบ Task "${task.taskName}"?`).then((confirmed) => {
      if (confirmed) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            const phaseId = this.currentPhaseId();
            if (phaseId) this.loadPhaseDetail(phaseId);
          },
          error: (err) => this.dialog.error('ลบไม่สำเร็จ', err.message),
        });
      }
    });
  }

  // ---- Utilities ----
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