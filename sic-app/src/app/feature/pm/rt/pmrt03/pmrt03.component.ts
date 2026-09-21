// src/app/feature/pm/rt/pmrt03/pmrt03.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { ProjectDashboard, ProjectHealth, RecentPhase, RecentTask } from './pmrt03.model';
import { Pmrt03Service } from './pmrt03.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pmrt03',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './pmrt03.component.html',
  styleUrl: './pmrt03.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt03Component implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pmrt03Service = inject(Pmrt03Service);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private customerState = inject(CustomerStateService);
  private translate = inject(TranslateService);

  // ===== State =====
  protected isLoading = signal(false);
  protected project = signal<ProjectDashboard | null>(null);
  protected projectId = signal<string>('');
  protected error = signal<string | null>(null);

  // ===== Project Health Score (คำนวณจากข้อมูลโครงการ) =====
  protected projectHealth = computed<ProjectHealth>(() => {
    const p = this.project();
    if (!p) {
      return {
        score: 100,
        status: 'Green',
        factors: [
          { name: this.translate.instant('PMRT03_FACTOR_TASK_PROGRESS'), value: 25, weight: 25, percent: 100, detail: '-' },
          { name: this.translate.instant('PMRT03_FACTOR_MANDAY_USAGE'), value: 25, weight: 25, percent: 0, detail: '-' },
          { name: this.translate.instant('PMRT03_FACTOR_BUG_QUALITY'), value: 20, weight: 20, percent: 100, detail: '-' },
          { name: this.translate.instant('PMRT03_FACTOR_PHASE_PROGRESS'), value: 15, weight: 15, percent: 100, detail: '-' },
          { name: this.translate.instant('PMRT03_FACTOR_STATUS_TIMELINE'), value: 15, weight: 15, percent: 100, detail: '-' },
        ],
      };
    }

    // 1. ความคืบหน้างาน (Tasks Progress) - Weight 25
    let taskScore = 25;
    let taskPercent = 100;
    let taskDetail = this.translate.instant('PMRT03_TASK_DETAIL_EMPTY');
    let taskColor = 'var(--crm-success)';
    if (p.taskCount > 0) {
      const taskRatio = p.taskCompletedCount / p.taskCount;
      taskPercent = Math.round(taskRatio * 100);
      taskScore = Math.round(taskRatio * 25);
      taskDetail = this.translate.instant('PMRT03_TASK_DETAIL', { completed: p.taskCompletedCount, total: p.taskCount, percent: taskPercent });
      taskColor = taskPercent >= 80 ? 'var(--crm-success)' : taskPercent >= 50 ? 'var(--crm-warning)' : 'var(--crm-danger)';
    }

    // 2. การใช้ Manday (Manday Usage & Burn) - Weight 25
    let mandayScore = 25;
    let mandayPercent = 0;
    let mandayDetail = `${p.usedManday || 0} / ${p.budgetManday || 0} Manday`;
    let mandayColor = 'var(--crm-success)';
    if (p.budgetManday > 0) {
      const mandayRatio = (p.usedManday || 0) / p.budgetManday;
      mandayPercent = Math.min(100, Math.round(mandayRatio * 100));
      mandayDetail = `${p.usedManday || 0} / ${p.budgetManday} Manday (${Math.round(mandayRatio * 100)}%)`;

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

    // 3. คุณภาพและการแก้ไข Bug (Bug & Quality) - Weight 20
    let bugScore = 20;
    let bugPercent = 100;
    let bugDetail = this.translate.instant('PMRT03_BUG_DETAIL_EMPTY');
    let bugColor = 'var(--crm-success)';
    if (p.bugCount > 0) {
      const closedBugs = Math.max(0, p.bugCount - (p.bugOpenCount || 0));
      const closeRatio = closedBugs / p.bugCount;
      bugPercent = Math.round(closeRatio * 100);
      bugScore = Math.round(closeRatio * 20);
      bugDetail = this.translate.instant('PMRT03_BUG_DETAIL', { closed: closedBugs, total: p.bugCount, percent: bugPercent });
      bugColor = bugPercent >= 80 ? 'var(--crm-success)' : bugPercent >= 50 ? 'var(--crm-warning)' : 'var(--crm-danger)';
    }

    // 4. ความคืบหน้า Phase (Phase Milestones) - Weight 15
    let phaseScore = 15;
    let phasePercent = 100;
    let phaseDetail = this.translate.instant('PMRT03_PHASE_DETAIL_EMPTY');
    let phaseColor = 'var(--crm-success)';
    if (p.recentPhases && p.recentPhases.length > 0) {
      const totalProgress = p.recentPhases.reduce((sum, phase) => sum + (phase.progress || 0), 0);
      const avgProgress = totalProgress / p.recentPhases.length;
      phasePercent = Math.round(avgProgress);
      phaseScore = Math.round((avgProgress / 100) * 15);
      const completedPhases = p.recentPhases.filter(ph => ph.status === 'Completed' || (ph.progress || 0) >= 100).length;
      phaseDetail = `${completedPhases}/${p.recentPhases.length} Phases (${phasePercent}%)`;
      phaseColor = phasePercent >= 80 ? 'var(--crm-success)' : phasePercent >= 50 ? 'var(--crm-warning)' : 'var(--crm-danger)';
    }

    // 5. สถานะและกำหนดการ (Timeline & Status) - Weight 15
    let statusScore = 15;
    let statusPercent = 100;
    let statusDetail = p.status || this.translate.instant('PMRT03_STATUS_NORMAL');
    let statusColor = 'var(--crm-success)';
    let isOverdue = false;

    if (p.status === 'Delayed') {
      statusScore = 3;
      statusPercent = 20;
      statusDetail = this.translate.instant('PMRT03_STATUS_DELAYED_DETAIL');
      statusColor = 'var(--crm-danger)';
      isOverdue = true;
    } else if (p.status === 'Closed' || p.status === 'Delivered' || p.status === 'Done') {
      statusScore = 15;
      statusPercent = 100;
      statusDetail = this.translate.instant('PMRT03_STATUS_COMPLETED_DETAIL');
      statusColor = 'var(--crm-success)';
    } else if (p.plannedEndDate) {
      const now = new Date();
      const end = new Date(p.plannedEndDate);
      if (end < now && p.status !== 'Done' && p.status !== 'Delivered' && p.status !== 'Closed') {
        statusScore = 3;
        statusPercent = 20;
        statusDetail = this.translate.instant('PMRT03_STATUS_OVERDUE_DETAIL');
        statusColor = 'var(--crm-danger)';
        isOverdue = true;
      } else {
        statusScore = 15;
        statusPercent = 100;
        statusDetail = this.translate.instant('PMRT03_STATUS_ONTRACK_DETAIL');
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

    // หากเลยกำหนดส่ง หรือล่าช้า สุขภาพโครงการไม่ควรเป็น Green
    if (isOverdue && status === 'Green') {
      status = 'Yellow';
      totalScore = Math.min(75, totalScore);
    }

    return {
      score: totalScore,
      status,
      factors: [
        { name: this.translate.instant('PMRT03_FACTOR_TASK_PROGRESS'), value: taskScore, weight: 25, percent: taskPercent, detail: taskDetail, color: taskColor },
        { name: this.translate.instant('PMRT03_FACTOR_MANDAY_USAGE'), value: mandayScore, weight: 25, percent: mandayPercent, detail: mandayDetail, color: mandayColor },
        { name: this.translate.instant('PMRT03_FACTOR_BUG_QUALITY'), value: bugScore, weight: 20, percent: bugPercent, detail: bugDetail, color: bugColor },
        { name: this.translate.instant('PMRT03_FACTOR_PHASE_PROGRESS'), value: phaseScore, weight: 15, percent: phasePercent, detail: phaseDetail, color: phaseColor },
        { name: this.translate.instant('PMRT03_FACTOR_STATUS_TIMELINE'), value: statusScore, weight: 15, percent: statusPercent, detail: statusDetail, color: statusColor },
      ],
    };
  });

  // ===== Lifecycle =====
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const projectId = params['projectId'] || null;
      if (projectId) {
        this.projectId.set(projectId);
        this.loadDashboard(projectId);
      }
    });
  }

  // ===== Load Data =====
  loadDashboard(id: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.pmrt03Service.getDashboard(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.project.set(data);
        },
        error: (err: any) => {
          console.error('Load project dashboard error:', err);
          this.error.set(this.translate.instant('PMRT03_LOAD_ERROR_MSG'));
          this.dialog.error(this.translate.instant('PMRT03_LOAD_ERROR_TITLE'), this.translate.instant('PMRT03_LOAD_ERROR_DETAIL'));
          this.navigation.navigate(['/feature/pm/project']);
        },
      });
  }

  // ===== Navigation Actions =====
  goToEdit() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/project', id, 'edit']);
  }

  goToPhases() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/phase'], { queryParams: { projectId: id } });
  }

  goToTasks() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/task'], { queryParams: { projectId: id } });
  }

  goToRequirements() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/requirement'], { queryParams: { projectId: id } });
  }


  goToContracts() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/contract'], { queryParams: { projectId: id } });
  }

  goToDiscussion() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/discussion'], { queryParams: { projectId: id } });
  }

  goToDesignReviews() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/design-review'], { queryParams: { projectId: id } });
  }

  goToDeliveries() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/delivery'], { queryParams: { projectId: id } });
  }

  goToManuals() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/manual'], { queryParams: { projectId: id } });
  }

  goToInvoices() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/invoice'], { queryParams: { projectId: id } });
  }

  goToMATickets() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/ma-ticket'], { queryParams: { projectId: id } });
  }

  goToApprovals() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/approval'], { queryParams: { projectId: id } });
  }

  goToVersions() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/version'], { queryParams: { projectId: id } });
  }

  goToChangeRequests() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/change-request'], { queryParams: { projectId: id } });
  }

  goToAuditLog() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/audit'], { queryParams: { projectId: id } });
  }

  goToPhaseDetail(phaseId: string) {
    this.navigation.navigate(['/feature/pm/phase', phaseId, 'edit']);
  }

  goToTaskDetail(taskId: string) {
    this.navigation.navigate(['/feature/pm/task', taskId, 'edit']);
  }

  goBack() {
    this.navigation.navigate(['/feature/pm/project']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Not Started': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Delayed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Development: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Prospect: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'Contract Drafting':
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Contract Signed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Requirement Gathering':
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Requirement Approval':
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'System Analysis': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'DFD Design': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'ER Design': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'Specification Design': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      'Specification Approval': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      Planning: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
      'Internal Testing':
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      UAT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Bug Fixing': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Ready for Delivery': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Invoicing: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      Closed: 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'MA Active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      Low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[priority] || map['Low'];
  }

  getPriorityText(priority: string): string {
    const map: Record<string, string> = {
      Low: this.translate.instant('PMRT03_PRIORITY_LOW'),
      Medium: this.translate.instant('PMRT03_PRIORITY_MEDIUM'),
      High: this.translate.instant('PMRT03_PRIORITY_HIGH'),
      Critical: this.translate.instant('PMRT03_PRIORITY_CRITICAL'),
    };
    return map[priority] || priority;
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      'Not Started': this.translate.instant('PMRT03_STATUS_NOT_STARTED'),
      'In Progress': this.translate.instant('PMRT03_STATUS_IN_PROGRESS'),
      Done: this.translate.instant('PMRT03_STATUS_DONE'),
      Delayed: this.translate.instant('PMRT03_STATUS_DELAYED'),
      Prospect: this.translate.instant('PMRT03_STATUS_PROSPECT'),
      'Contract Drafting': this.translate.instant('PMRT03_STATUS_CONTRACT_DRAFTING'),
      'Contract Signed': this.translate.instant('PMRT03_STATUS_CONTRACT_SIGNED'),
      'Requirement Gathering': this.translate.instant('PMRT03_STATUS_REQ_GATHERING'),
      'Requirement Approval': this.translate.instant('PMRT03_STATUS_REQ_APPROVAL'),
      'System Analysis': this.translate.instant('PMRT03_STATUS_SYS_ANALYSIS'),
      'DFD Design': this.translate.instant('PMRT03_STATUS_DFD_DESIGN'),
      'ER Design': this.translate.instant('PMRT03_STATUS_ER_DESIGN'),
      'Specification Design': this.translate.instant('PMRT03_STATUS_SPEC_DESIGN'),
      'Specification Approval': this.translate.instant('PMRT03_STATUS_SPEC_APPROVAL'),
      Planning: this.translate.instant('PMRT03_STATUS_PLANNING'),
      Development: this.translate.instant('PMRT03_STATUS_DEVELOPMENT'),
      'Internal Testing': this.translate.instant('PMRT03_STATUS_INTERNAL_TESTING'),
      UAT: this.translate.instant('PMRT03_STATUS_UAT'),
      'Bug Fixing': this.translate.instant('PMRT03_STATUS_BUG_FIXING'),
      'Ready for Delivery': this.translate.instant('PMRT03_STATUS_READY_DELIVERY'),
      Delivered: this.translate.instant('PMRT03_STATUS_DELIVERED'),
      Invoicing: this.translate.instant('PMRT03_STATUS_INVOICING'),
      Closed: this.translate.instant('PMRT03_STATUS_CLOSED'),
      'MA Active': this.translate.instant('PMRT03_STATUS_MA_ACTIVE'),
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

  getProgressClass(progress: number): string {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-400';
  }

  getMandayProgress(): number {
    const project = this.project();
    if (!project) return 0;
    if (project.budgetManday === 0) return 0;
    return Math.min(Math.round((project.usedManday / project.budgetManday) * 100), 100);
  }

  getHealthStatusColor(status: string): string {
    const map: Record<string, string> = {
      Green: 'var(--crm-success)',
      Yellow: 'var(--crm-warning)',
      Red: 'var(--crm-danger)',
    };
    return map[status] || 'var(--crm-warning)';
  }

  getHealthStatusClass(status: string): string {
    const map: Record<string, string> = {
      Green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }

  getHealthStatusText(status: string): string {
    const map: Record<string, string> = {
      Green: this.translate.instant('PMRT03_HEALTH_GREEN'),
      Yellow: this.translate.instant('PMRT03_HEALTH_YELLOW'),
      Red: this.translate.instant('PMRT03_HEALTH_RED'),
    };
    return map[status] || status;
  }
}

