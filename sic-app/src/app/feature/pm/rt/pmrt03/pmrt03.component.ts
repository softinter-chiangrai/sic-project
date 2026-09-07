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

@Component({
  selector: 'app-pmrt03',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
          { name: 'ความคืบหน้างาน (Tasks)', value: 25, weight: 25 },
          { name: 'การควบคุม Manday', value: 25, weight: 25 },
          { name: 'คุณภาพ & Bug ที่ปิดแล้ว', value: 20, weight: 20 },
          { name: 'ความคืบหน้า Phase', value: 15, weight: 15 },
          { name: 'สถานะและกำหนดการ (Timeline)', value: 15, weight: 15 },
        ],
      };
    }

    // 1. ความคืบหน้างาน (Tasks Progress) - Weight 25
    let taskScore = 25;
    if (p.taskCount > 0) {
      const taskRatio = p.taskCompletedCount / p.taskCount;
      taskScore = Math.round(taskRatio * 25);
    }

    // 2. การควบคุม Manday (Manday Control) - Weight 25
    let mandayScore = 25;
    if (p.budgetManday > 0) {
      const mandayRatio = p.usedManday / p.budgetManday;
      if (mandayRatio <= 1.0) {
        mandayScore = 25;
      } else if (mandayRatio <= 1.2) {
        mandayScore = 15;
      } else if (mandayRatio <= 1.5) {
        mandayScore = 8;
      } else {
        mandayScore = 0;
      }
    }

    // 3. คุณภาพและ Bug ที่ปิดแล้ว (Bug & Quality) - Weight 20
    let bugScore = 20;
    if (p.bugCount > 0) {
      const openRatio = p.bugOpenCount / p.bugCount;
      bugScore = Math.max(0, Math.round((1 - openRatio) * 20));
    }

    // 4. ความคืบหน้า Phase (Phase Milestones) - Weight 15
    let phaseScore = 15;
    if (p.recentPhases && p.recentPhases.length > 0) {
      const totalProgress = p.recentPhases.reduce((sum, phase) => sum + (phase.progress || 0), 0);
      const avgProgress = totalProgress / p.recentPhases.length;
      phaseScore = Math.round((avgProgress / 100) * 15);
    }

    // 5. สถานะและกำหนดการ (Timeline & Status) - Weight 15
    let statusScore = 15;
    if (p.status === 'Delayed') {
      statusScore = 4;
    } else if (p.status === 'Closed' || p.status === 'Delivered' || p.status === 'Done') {
      statusScore = 15;
    } else if (p.plannedEndDate) {
      const now = new Date();
      const end = new Date(p.plannedEndDate);
      if (end < now && p.status !== 'Done' && p.status !== 'Delivered' && p.status !== 'Closed') {
        statusScore = 5;
      } else {
        statusScore = 14;
      }
    }

    const totalScore = Math.min(
      100,
      Math.max(0, taskScore + mandayScore + bugScore + phaseScore + statusScore)
    );

    let status: 'Green' | 'Yellow' | 'Red' = 'Green';
    if (totalScore < 50) {
      status = 'Red';
    } else if (totalScore < 80) {
      status = 'Yellow';
    }

    return {
      score: totalScore,
      status,
      factors: [
        { name: 'ความคืบหน้างาน (Tasks)', value: taskScore, weight: 25 },
        { name: 'การควบคุม Manday', value: mandayScore, weight: 25 },
        { name: 'คุณภาพ & Bug ที่ปิดแล้ว', value: bugScore, weight: 20 },
        { name: 'ความคืบหน้า Phase', value: phaseScore, weight: 15 },
        { name: 'สถานะและกำหนดการ (Timeline)', value: statusScore, weight: 15 },
      ],
    };
  });

  // ===== Lifecycle =====
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const projectId = params['projectId'] || this.customerState.getProjectId();
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
          this.error.set('ไม่สามารถโหลดข้อมูลโครงการได้');
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลโครงการหรือเกิดข้อผิดพลาด');
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
      Low: 'ต่ำ',
      Medium: 'ปานกลาง',
      High: 'สูง',
      Critical: 'วิกฤต',
    };
    return map[priority] || priority;
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      'Not Started': 'ยังไม่เริ่ม',
      'In Progress': 'กำลังดำเนินการ',
      Done: 'เสร็จสิ้น',
      Delayed: 'ล่าช้า',
      Prospect: 'โอกาส',
      'Contract Drafting': 'ร่างสัญญา',
      'Contract Signed': 'เซ็นสัญญา',
      'Requirement Gathering': 'เก็บ Requirement',
      'Requirement Approval': 'อนุมัติ Requirement',
      'System Analysis': 'วิเคราะห์ระบบ',
      'DFD Design': 'ออกแบบ DFD',
      'ER Design': 'ออกแบบ ER',
      'Specification Design': 'ออกแบบ Spec',
      'Specification Approval': 'อนุมัติ Spec',
      Planning: 'วางแผน',
      Development: 'พัฒนา',
      'Internal Testing': 'ทดสอบภายใน',
      UAT: 'ทดสอบ UAT',
      'Bug Fixing': 'แก้ไข Bug',
      'Ready for Delivery': 'พร้อมส่งมอบ',
      Delivered: 'ส่งมอบแล้ว',
      Invoicing: 'ออก Invoice',
      Closed: 'ปิดโครงการ',
      'MA Active': 'อยู่ใน MA',
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
      Green: 'สุขภาพดี (Green)',
      Yellow: 'เฝ้าระวัง (Yellow)',
      Red: 'วิกฤต (Red)',
    };
    return map[status] || status;
  }
}

