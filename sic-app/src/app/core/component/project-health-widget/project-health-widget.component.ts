import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';

import { CustomerStateService } from '../../services/customer-state.service';
import { PmCustomerProject } from '../../../feature/pm/rt/pmrt02/pmrt02.model';
import { Pmrt03Service } from '../../../feature/pm/rt/pmrt03/pmrt03.service';
import {
  ProjectDashboard,
  ProjectHealth,
  ProjectHealthFactor,
} from '../../../feature/pm/rt/pmrt03/pmrt03.model';

@Component({
  selector: 'app-project-health-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './project-health-widget.component.html',
  styleUrl: './project-health-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectHealthWidgetComponent implements OnInit {
  private readonly pmrt03Service = inject(Pmrt03Service);
  private readonly customerState = inject(CustomerStateService);
  private readonly translate = inject(TranslateService);

  readonly projects = input<PmCustomerProject[]>([]);

  readonly selectedProjectId = signal<string>('');
  readonly project = signal<ProjectDashboard | null>(null);
  readonly isLoading = signal<boolean>(false);

  constructor() {
    // React to global project change or project list initialization
    effect(() => {
      const globalProjectId = this.customerState.currentProjectId();
      const currentSelected = this.selectedProjectId();
      const projs = this.projects();

      if (globalProjectId && globalProjectId !== currentSelected) {
        this.selectedProjectId.set(globalProjectId);
        this.loadProjectDashboard(globalProjectId);
      } else if (!currentSelected && projs.length > 0) {
        const firstId = projs[0].id;
        this.selectedProjectId.set(firstId);
        this.loadProjectDashboard(firstId);
      }
    });
  }

  ngOnInit(): void {
    const currentId = this.customerState.getProjectId();
    if (currentId) {
      this.selectedProjectId.set(currentId);
      this.loadProjectDashboard(currentId);
    }
  }

  onProjectChange(projectId: string): void {
    if (projectId && projectId !== this.selectedProjectId()) {
      this.selectedProjectId.set(projectId);
      const proj = this.projects().find((p) => p.id === projectId);
      if (proj) {
        this.customerState.setProject(proj.id, proj.projectName);
      }
      this.loadProjectDashboard(projectId);
    }
  }

  loadProjectDashboard(projectId: string): void {
    if (!projectId) return;
    this.isLoading.set(true);

    this.pmrt03Service
      .getDashboard(projectId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.project.set(data);
        },
        error: (err) => {
          console.error('Failed to load project health data for widget:', err);
          this.project.set(null);
        },
      });
  }

  // =========================================================================
  // Project Health Score Calculation
  // =========================================================================
  readonly projectHealth = computed<ProjectHealth>(() => {
    const p = this.project();
    if (!p) {
      return {
        score: 100,
        status: 'Green',
        factors: [
          { name: 'ความคืบหน้างาน', nameKey: 'PROJECT_HEALTH_FACTOR_TASKS', value: 25, weight: 25, percent: 100, detail: 'ไม่มีงาน (0/0)', detailKey: 'PROJECT_HEALTH_DETAIL_NO_TASKS', color: 'var(--crm-success)' },
          { name: 'การใช้ Manday (จากงบทั้งหมด)', nameKey: 'PROJECT_HEALTH_FACTOR_MANDAY', value: 25, weight: 25, percent: 0, detail: '0 / 0 Manday (0%)', detailKey: 'PROJECT_HEALTH_DETAIL_MANDAY_USAGE', detailParams: { used: 0, budget: 0, percent: 0 }, color: 'var(--crm-success)' },
          { name: 'คุณภาพ & การแก้ไข Bug', nameKey: 'PROJECT_HEALTH_FACTOR_QUALITY', value: 20, weight: 20, percent: 100, detail: 'สมบูรณ์ ไม่มี Bug ในระบบ (0/0)', detailKey: 'PROJECT_HEALTH_DETAIL_NO_BUGS', color: 'var(--crm-success)' },
          { name: 'ความคืบหน้า Phase', nameKey: 'PROJECT_HEALTH_FACTOR_PHASE', value: 15, weight: 15, percent: 100, detail: 'ไม่มี Phase (0/0)', detailKey: 'PROJECT_HEALTH_DETAIL_NO_PHASES', color: 'var(--crm-success)' },
          { name: 'สถานะและกำหนดการ', nameKey: 'PROJECT_HEALTH_FACTOR_TIMELINE', value: 15, weight: 15, percent: 100, detail: 'ตามแผนงาน', detailKey: 'PROJECT_HEALTH_DETAIL_ON_SCHEDULE', color: 'var(--crm-success)' },
        ],
      };
    }

    // 1. ความคืบหน้างาน (Tasks Progress) - Weight 25
    let taskScore = 25;
    let taskPercent = 100;
    let taskDetail = 'ไม่มีงาน (0/0)';
    let taskDetailKey = 'PROJECT_HEALTH_DETAIL_NO_TASKS';
    let taskDetailParams: Record<string, any> | undefined = undefined;
    let taskColor = 'var(--crm-success)';
    if (p.taskCount > 0) {
      const taskRatio = p.taskCompletedCount / p.taskCount;
      taskPercent = Math.round(taskRatio * 100);
      taskScore = Math.round(taskRatio * 25);
      taskDetail = `งานเสร็จ ${p.taskCompletedCount}/${p.taskCount} งาน (${taskPercent}%)`;
      taskDetailKey = 'PROJECT_HEALTH_DETAIL_TASKS_PROGRESS';
      taskDetailParams = { completed: p.taskCompletedCount, total: p.taskCount, percent: taskPercent };
      taskColor = taskPercent >= 80 ? 'var(--crm-success)' : taskPercent >= 50 ? 'var(--crm-warning)' : 'var(--crm-danger)';
    }

    // 2. การใช้ Manday (Manday Usage & Burn) - Weight 25
    let mandayScore = 25;
    let mandayPercent = 0;
    let mandayDetail = `${p.usedManday || 0} / ${p.budgetManday || 0} Manday (0%)`;
    let mandayDetailKey = 'PROJECT_HEALTH_DETAIL_MANDAY_USAGE';
    let mandayDetailParams: Record<string, any> = { used: p.usedManday || 0, budget: p.budgetManday || 0, percent: 0 };
    let mandayColor = 'var(--crm-success)';
    if (p.budgetManday > 0) {
      const mandayRatio = (p.usedManday || 0) / p.budgetManday;
      mandayPercent = Math.min(100, Math.round(mandayRatio * 100));
      mandayDetail = `${p.usedManday || 0} / ${p.budgetManday} Manday (${Math.round(mandayRatio * 100)}%)`;
      mandayDetailParams = { used: p.usedManday || 0, budget: p.budgetManday, percent: Math.round(mandayRatio * 100) };

      if (mandayRatio <= 0.8) {
        mandayScore = 25;
        mandayColor = 'var(--crm-success)';
      } else if (mandayRatio <= 1.0) {
        mandayScore = 22;
        mandayColor = 'var(--crm-success)';
      } else if (mandayRatio <= 1.2) {
        mandayScore = 12;
        mandayColor = 'var(--crm-warning)';
      } else if (mandayRatio <= 1.5) {
        mandayScore = 5;
        mandayColor = 'var(--crm-danger)';
      } else {
        mandayScore = 0;
        mandayColor = 'var(--crm-danger)';
      }
    }

    // 3. คุณภาพ & การแก้ไข Bug (Bug & Quality) - Weight 20
    let bugScore = 20;
    let bugPercent = 100;
    let bugDetail = 'สมบูรณ์ ไม่มี Bug ในระบบ (0/0)';
    let bugDetailKey = 'PROJECT_HEALTH_DETAIL_NO_BUGS';
    let bugDetailParams: Record<string, any> | undefined = undefined;
    let bugColor = 'var(--crm-success)';
    if (p.bugCount > 0) {
      const closedBugs = Math.max(0, p.bugCount - (p.bugOpenCount || 0));
      const closeRatio = closedBugs / p.bugCount;
      bugPercent = Math.round(closeRatio * 100);
      bugScore = Math.round(closeRatio * 20);
      bugDetail = `แก้ไขแล้ว ${closedBugs}/${p.bugCount} Bug (${bugPercent}%)`;
      bugDetailKey = 'PROJECT_HEALTH_DETAIL_BUGS_PROGRESS';
      bugDetailParams = { closed: closedBugs, total: p.bugCount, percent: bugPercent };
      bugColor = bugPercent >= 80 ? 'var(--crm-success)' : bugPercent >= 50 ? 'var(--crm-warning)' : 'var(--crm-danger)';
    }

    // 4. ความคืบหน้า Phase (Phase Milestones) - Weight 15
    let phaseScore = 15;
    let phasePercent = 100;
    let phaseDetail = 'ไม่มี Phase (0/0)';
    let phaseDetailKey = 'PROJECT_HEALTH_DETAIL_NO_PHASES';
    let phaseDetailParams: Record<string, any> | undefined = undefined;
    let phaseColor = 'var(--crm-success)';
    if (p.recentPhases && p.recentPhases.length > 0) {
      const totalProgress = p.recentPhases.reduce((sum, phase) => sum + (phase.progress || 0), 0);
      const avgProgress = totalProgress / p.recentPhases.length;
      phasePercent = Math.round(avgProgress);
      phaseScore = Math.round((avgProgress / 100) * 15);
      const completedPhases = p.recentPhases.filter((ph) => ph.status === 'Completed' || (ph.progress || 0) >= 100).length;
      phaseDetail = `${completedPhases}/${p.recentPhases.length} Phase (${phasePercent}%)`;
      phaseDetailKey = 'PROJECT_HEALTH_DETAIL_PHASES_PROGRESS';
      phaseDetailParams = { completed: completedPhases, total: p.recentPhases.length, percent: phasePercent };
      phaseColor = phasePercent >= 80 ? 'var(--crm-success)' : phasePercent >= 50 ? 'var(--crm-warning)' : 'var(--crm-danger)';
    }

    // 5. สถานะและกำหนดการ (Timeline & Status) - Weight 15
    let statusScore = 15;
    let statusPercent = 100;
    let statusDetail = 'ตามแผนงาน';
    let statusDetailKey = 'PROJECT_HEALTH_DETAIL_ON_SCHEDULE';
    let statusColor = 'var(--crm-success)';
    let isOverdue = false;

    if (p.status === 'Delayed') {
      statusScore = 3;
      statusPercent = 20;
      statusDetail = 'ล่าช้ากว่ากำหนด';
      statusDetailKey = 'PROJECT_HEALTH_DETAIL_DELAYED';
      statusColor = 'var(--crm-danger)';
      isOverdue = true;
    } else if (p.status === 'Closed' || p.status === 'Delivered' || p.status === 'Done') {
      statusScore = 15;
      statusPercent = 100;
      statusDetail = 'เสร็จสิ้นตามเป้าหมาย';
      statusDetailKey = 'PROJECT_HEALTH_DETAIL_COMPLETED';
      statusColor = 'var(--crm-success)';
    } else if (p.plannedEndDate) {
      const now = new Date();
      const end = new Date(p.plannedEndDate);
      if (end < now && p.status !== 'Done' && p.status !== 'Delivered' && p.status !== 'Closed') {
        statusScore = 3;
        statusPercent = 20;
        statusDetail = 'เกินกำหนดส่งมอบ';
        statusDetailKey = 'PROJECT_HEALTH_DETAIL_OVERDUE';
        statusColor = 'var(--crm-danger)';
        isOverdue = true;
      } else {
        statusScore = 15;
        statusPercent = 100;
        statusDetail = 'ตามแผนงาน';
        statusDetailKey = 'PROJECT_HEALTH_DETAIL_ON_SCHEDULE';
        statusColor = 'var(--crm-success)';
      }
    }

    let totalScore = Math.min(
      100,
      Math.max(0, taskScore + mandayScore + bugScore + phaseScore + statusScore)
    );

    let status: 'Green' | 'Yellow' | 'Red' = 'Green';
    if (totalScore < 50) {
      status = 'Red';
    } else if (totalScore < 80) {
      status = 'Yellow';
    }

    if (isOverdue && status === 'Green') {
      status = 'Yellow';
      totalScore = Math.min(75, totalScore);
    }

    return {
      score: totalScore,
      status,
      factors: [
        { name: 'ความคืบหน้างาน', nameKey: 'PROJECT_HEALTH_FACTOR_TASKS', value: taskScore, weight: 25, percent: taskPercent, detail: taskDetail, detailKey: taskDetailKey, detailParams: taskDetailParams, color: taskColor },
        { name: 'การใช้ Manday (จากงบทั้งหมด)', nameKey: 'PROJECT_HEALTH_FACTOR_MANDAY', value: mandayScore, weight: 25, percent: mandayPercent, detail: mandayDetail, detailKey: mandayDetailKey, detailParams: mandayDetailParams, color: mandayColor },
        { name: 'คุณภาพ & การแก้ไข Bug', nameKey: 'PROJECT_HEALTH_FACTOR_QUALITY', value: bugScore, weight: 20, percent: bugPercent, detail: bugDetail, detailKey: bugDetailKey, detailParams: bugDetailParams, color: bugColor },
        { name: 'ความคืบหน้า Phase', nameKey: 'PROJECT_HEALTH_FACTOR_PHASE', value: phaseScore, weight: 15, percent: phasePercent, detail: phaseDetail, detailKey: phaseDetailKey, detailParams: phaseDetailParams, color: phaseColor },
        { name: 'สถานะและกำหนดการ', nameKey: 'PROJECT_HEALTH_FACTOR_TIMELINE', value: statusScore, weight: 15, percent: statusPercent, detail: statusDetail, detailKey: statusDetailKey, color: statusColor },
      ],
    };
  });

  getHealthStatusColor(status: string): string {
    const map: Record<string, string> = {
      Green: 'var(--crm-success)',
      Yellow: 'var(--crm-warning)',
      Red: 'var(--crm-danger)',
    };
    return map[status] || 'var(--crm-success)';
  }

  getHealthStatusClass(status: string): string {
    const map: Record<string, string> = {
      Green: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      Yellow: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      Red: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    };
    return map[status] || 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
  }

  getHealthStatusKey(status: string): string {
    const map: Record<string, string> = {
      Green: 'PROJECT_HEALTH_STATUS_GOOD',
      Yellow: 'PROJECT_HEALTH_STATUS_WARNING',
      Red: 'PROJECT_HEALTH_STATUS_CRITICAL',
    };
    return map[status] || 'PROJECT_HEALTH_STATUS_GOOD';
  }

  getHealthStatusText(status: string): string {
    const map: Record<string, string> = {
      Green: 'สุขภาพดี',
      Yellow: 'เฝ้าระวัง',
      Red: 'วิกฤต',
    };
    return map[status] || 'สุขภาพดี';
  }
}
