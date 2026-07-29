// src/app/feature/pm/dt/pmdt02/pmdt02-gantt.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DhtmlxGanttComponent, DhtmlxGanttTask } from '../../../../core/component/sic-ganttchart/dhtmlx-gantt.component';
import { PhaseService } from '../../../../core/services/phase.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { buildGanttTasks } from './pmdt02.utils';
import type { PhaseResponse } from '../../../../core/model/phase.model';

@Component({
  selector: 'app-pmdt02-gantt',
  standalone: true,
  imports: [CommonModule, RouterModule, DhtmlxGanttComponent],
  template: `
    <div class="p-4 h-screen flex flex-col bg-[var(--bg)]">
      <!-- Header with back button -->
      <div class="flex items-center gap-3 mb-4 flex-shrink-0">
        <button (click)="goBack()"
          class="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--crm-primary)] hover:bg-[var(--crm-primary)]/10 transition-all">
          <i class="bi bi-arrow-left text-xl"></i>
        </button>
        <h1 class="text-xl font-bold text-[var(--text-active)]">
          Gantt Chart: {{ phase()?.phaseName || 'Loading...' }}
        </h1>
        <span class="text-sm text-[var(--text-muted)] ml-auto">Project: {{ projectId() }}</span>
      </div>

      <!-- Gantt container (full remaining height) -->
      <div class="flex-1 min-h-0 bg-[var(--sidebar)] rounded-xl border border-[var(--border)] p-4 overflow-hidden">
        @if (isLoading()) {
          <div class="flex justify-center items-center h-full">
            <div class="w-10 h-10 border-4 border-[var(--border)] border-t-[var(--crm-primary)] rounded-full animate-spin"></div>
          </div>
        } @else {
          <app-dhtmlx-gantt
            [tasks]="ganttTasks()"
            [links]="[]"
            [projectId]="projectId()"
            [phaseId]="phaseId()"
            [isLoading]="false"
            (taskUpdated)="onTaskUpdated($event)"
            (taskDeleted)="onTaskDeleted($event)"
            (taskCreated)="onTaskCreated($event)">
          </app-dhtmlx-gantt>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class Pmdt02GanttComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private phaseService = inject(PhaseService);
  private dialog = inject(DialogService);

  phaseId = signal('');
  projectId = signal('');
  phase = signal<PhaseResponse | null>(null);
  isLoading = signal(true);
  ganttTasks = signal<DhtmlxGanttTask[]>([]);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.phaseId.set(id);
        this.loadPhase(id);
      } else {
        this.goBack();
      }
    });

    this.route.queryParams.subscribe(qParams => {
      const pid = qParams['projectId'];
      if (pid) this.projectId.set(pid);
    });
  }

  loadPhase(id: string) {
    this.isLoading.set(true);
    this.phaseService.getPhaseById(id).subscribe({
      next: (data) => {
        this.phase.set(data);
        // แปลงข้อมูลเป็น Gantt Tasks โดยใช้ Utility
        const tasks = buildGanttTasks(data);
        this.ganttTasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.dialog.error('โหลดข้อมูลไม่สำเร็จ', err.message);
        this.isLoading.set(false);
        this.goBack();
      }
    });
  }

  // ----- Event handlers (อาจจะเพิ่ม logic เชื่อม backend ภายหลัง) -----
  onTaskUpdated(task: DhtmlxGanttTask) {
    console.log('[Gantt] Updated:', task);
    // TODO: sync with backend
  }

  onTaskDeleted(taskId: string) {
    console.log('[Gantt] Deleted:', taskId);
    // TODO: delete from backend
  }

  onTaskCreated(task: DhtmlxGanttTask) {
    console.log('[Gantt] Created:', task);
    // TODO: create in backend
  }

  goBack() {
    const phaseId = this.phaseId();
    const projectId = this.projectId();
    if (phaseId) {
      this.router.navigate(['/feature/pm/phase', phaseId], { queryParams: { projectId } });
    } else {
      this.router.navigate(['/feature/pm/pmdt01'], { queryParams: { projectId } });
    }
  }
}