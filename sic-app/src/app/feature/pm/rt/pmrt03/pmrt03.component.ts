// src/app/feature/pm/rt/pmrt03/pmrt03.component.ts

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';

import { environment } from '../../../../../environments/environment';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';

// ===== Interfaces =====
export interface ProjectDashboard {
  id: string;
  projectCode: string;
  projectName: string;
  customerId: string;
  customerName: string;
  contractId: string;
  contractNo: string;
  projectManager: string;
  ba: string;
  sa: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  budgetManday: number;
  usedManday: number;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description?: string;
  isActive: boolean;
  rowVersion?: number;

  // Summary stats
  phaseCount: number;
  taskCount: number;
  taskCompletedCount: number;
  requirementCount: number;
  bugCount: number;
  bugOpenCount: number;

  // Recent items (for quick view)
  recentPhases: RecentPhase[];
  recentTasks: RecentTask[];
}

export interface RecentPhase {
  id: string;
  phaseCode: string;
  phaseName: string;
  status: string;
  progress: number;
  endDate: string;
}

export interface RecentTask {
  id: string;
  taskCode: string;
  taskName: string;
  assignedTo: string;
  status: string;
  priority: string;
}

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
  private http = inject(HttpClient);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);

  // ===== State =====
  protected isLoading = signal(false);
  protected project = signal<ProjectDashboard | null>(null);
  protected projectId = signal<string>('');
  protected error = signal<string | null>(null);

  private apiUrl = environment.apiBaseUrl + '/api/pm/projects';

  // ===== Lifecycle =====
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const projectId = params['projectId'];
      if (!projectId) {
        this.navigation.navigate(['/feature/pm/pmrt02']);
        return;
      }
      this.projectId.set(projectId);
      this.loadDashboard(projectId);
    });
  }

  // ===== Load Data =====
  loadDashboard(id: string) {
    this.isLoading.set(true);
    this.error.set(null);

    // ใช้ Mock Data (เปลี่ยนเป็น HTTP จริงเมื่อเชื่อมต่อ API)
    this.getMockData(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.project.set(data);
        },
        error: (err: any) => {
          console.error('Load project dashboard error:', err);
          this.error.set('ไม่สามารถโหลดข้อมูลโครงการได้');
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบข้อมูลโครงการหรือเกิดข้อผิดพลาด');
          this.navigation.navigate(['/feature/pm/pmrt02']);
        },
      });
  }

  // ===== Mock Data (ลบเมื่อเชื่อมต่อ API จริง) =====
  private getMockData(id: string): Observable<ProjectDashboard> {
    const mockData: ProjectDashboard = {
      id: id,
      projectCode: 'PRJ-001',
      projectName: 'ระบบบริหารจัดการลูกค้า (CRM)',
      customerId: '1',
      customerName: 'บริษัท ซอฟต์อินเตอร์ จำกัด',
      contractId: '1',
      contractNo: 'CT-001',
      projectManager: 'สมศักดิ์ รุ่งเรือง',
      ba: 'สมหญิง รักเรียน',
      sa: 'วิชัย พัฒนาชัย',
      startDate: '2024-01-15',
      plannedEndDate: '2024-06-30',
      actualEndDate: undefined,
      budgetManday: 120,
      usedManday: 85,
      status: 'Development',
      priority: 'High',
      description:
        'พัฒนาระบบ CRM สำหรับบริหารจัดการข้อมูลลูกค้า ติดตามการขาย และการบริการหลังการขาย',
      isActive: true,
      phaseCount: 5,
      taskCount: 23,
      taskCompletedCount: 12,
      requirementCount: 15,
      bugCount: 8,
      bugOpenCount: 3,
      recentPhases: [
        {
          id: 'p1',
          phaseCode: 'PH-001',
          phaseName: 'Requirement & Analysis',
          status: 'Done',
          progress: 100,
          endDate: '2024-02-28',
        },
        {
          id: 'p2',
          phaseCode: 'PH-002',
          phaseName: 'System Design',
          status: 'In Progress',
          progress: 75,
          endDate: '2024-03-31',
        },
        {
          id: 'p3',
          phaseCode: 'PH-003',
          phaseName: 'Development',
          status: 'Not Started',
          progress: 0,
          endDate: '2024-05-31',
        },
      ],
      recentTasks: [
        {
          id: 't1',
          taskCode: 'TASK-001',
          taskName: 'ออกแบบ Database Schema',
          assignedTo: 'วิชัย พัฒนาชัย',
          status: 'Done',
          priority: 'High',
        },
        {
          id: 't2',
          taskCode: 'TASK-002',
          taskName: 'พัฒนา API Login',
          assignedTo: 'สมชาย ใจดี',
          status: 'In Progress',
          priority: 'High',
        },
        {
          id: 't3',
          taskCode: 'TASK-003',
          taskName: 'พัฒนา UI Dashboard',
          assignedTo: 'มานี มีทรัพย์',
          status: 'Todo',
          priority: 'Medium',
        },
      ],
    };

    return of(mockData).pipe(delay(500));
  }

  // ===== Navigation Actions =====
  goToEdit() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/pmrt02', id, 'edit']);
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

  goToBugs() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/bug'], { queryParams: { projectId: id } });
  }

  goToGantt() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/gantt'], { queryParams: { projectId: id } });
  }

  goToContracts() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/pmrt04'], { queryParams: { projectId: id } });
  }

  // ---- เพิ่ม Navigation สำหรับ Module อื่นๆ ----
  goToChangeRequests() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/pmdt07'], { queryParams: { projectId: id } });
  }

  goToSpecifications() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/specification'], { queryParams: { projectId: id } });
  }

    goToDiagram() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/diagram'], { queryParams: { projectId: id } });
  }

  goToDesignReviews() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/design-review'], { queryParams: { projectId: id } });
  }

  goToPlanning() {
    const id = this.projectId();
    // ไปที่หน้า Task (Planning) หรือถ้ามีหน้า Planning แยกก็เปลี่ยน path
    this.navigation.navigate(['/feature/pm/task'], { queryParams: { projectId: id } });
  }

  goToDiscussion() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/discussion'], { queryParams: { projectId: id } });
  }

  goToTestCases() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/test-case'], { queryParams: { projectId: id } });
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

  goToRenewals() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/renewal'], { queryParams: { projectId: id } });
  }

  goToApprovals() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/approval'], { queryParams: { projectId: id } });
  }

  goToVersions() {
    const id = this.projectId();
    this.navigation.navigate(['/feature/pm/version'], { queryParams: { projectId: id } });
  }

  goToPhaseDetail(phaseId: string) {
    this.navigation.navigate(['/feature/pm/phase', phaseId, 'edit']);
  }

  goToTaskDetail(taskId: string) {
    this.navigation.navigate(['/feature/pm/task', taskId, 'edit']);
  }

  goBack() {
    this.navigation.navigate(['/feature/pm/pmrt02']);
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
}
