// src/app/feature/pm/rt/pmrt05/pmrt05.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicCardComponent } from '../../../../core/component/sic-card/sic-card.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';

interface TraceLink {
  id: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  relationshipType: string;
}

interface RequirementDetail {
  id: string;
  requirementCode: string;
  title: string;
  description: string;
  priority: string;
  businessValue: string;
  acceptanceCriteria: string;
  projectId: string;
  projectName: string;
  customerId: string;
  customerName: string;
  status: string;
  version: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface RelatedItem {
  id: string;
  name: string;
  code?: string;
  type: string;
  link: string;
  color?: string;
}

@Component({
  selector: 'app-pmrt05',
  standalone: true,
  imports: [CommonModule, RouterModule, SicButtonComponent, SicCardComponent, SicDatePipe],
  templateUrl: './pmrt05.component.html',
  styleUrls: ['./pmrt05.component.css'],
})
export class Pmrt05Component implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private customerState = inject(CustomerStateService);

  // ===== State =====
  isLoading = signal(false);
  requirement = signal<RequirementDetail | null>(null);
  traceLinks = signal<TraceLink[]>([]);
  projectId = signal<string | null>(null);
  requirementId = signal<string | null>(null);

  // ===== Computed groups =====
  dfdList = signal<RelatedItem[]>([]);
  erList = signal<RelatedItem[]>([]);
  specList = signal<RelatedItem[]>([]);
  taskList = signal<RelatedItem[]>([]);
  testList = signal<RelatedItem[]>([]);
  bugList = signal<RelatedItem[]>([]);
  changeRequestList = signal<RelatedItem[]>([]);
  designReviewList = signal<RelatedItem[]>([]);

  diagrams = computed(() => {
    const dfd = this.dfdList();
    const er = this.erList();
    return [...dfd, ...er].sort((a, b) => a.type.localeCompare(b.type));
  });

  // ===== Lifecycle =====
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const reqId = params['requirementId'];
      const projId = params['projectId'];
      if (!reqId || !projId) {
        this.dialog.warn('ไม่พบ Requirement', 'กรุณาระบุ requirementId และ projectId');
        this.navigation.navigate(['/feature/pm/pmrt02']);
        return;
      }
      this.requirementId.set(reqId);
      this.projectId.set(projId);
      this.loadRequirement(reqId);
      this.loadTraceLinks(reqId);
    });
  }

  // ===== Load Data =====
  loadRequirement(id: string) {
    this.isLoading.set(true);
    this.http
      .get<RequirementDetail>(`${environment.apiBaseUrl}/api/pm/requirement/${id}`)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.requirement.set(data);
          this.projectId.set(data.projectId);
        },
        error: (err) => {
          console.error('Load requirement error:', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบ Requirement นี้');
          this.navigation.navigate(['/feature/pm/pmrt02']);
        },
      });
  }

  loadTraceLinks(reqId: string) {
    this.http
      .get<TraceLink[]>(`${environment.apiBaseUrl}/api/trace/links/source/REQUIREMENT/${reqId}`)
      .subscribe({
        next: (links) => {
          this.traceLinks.set(links);
          this.groupLinks(links);
        },
        error: (err) => {
          console.error('Load trace links error:', err);
          this.traceLinks.set([]);
          this.groupLinks([]);
        },
      });
  }

  private groupLinks(links: TraceLink[]) {
    const dfd: RelatedItem[] = [];
    const er: RelatedItem[] = [];
    const spec: RelatedItem[] = [];
    const task: RelatedItem[] = [];
    const test: RelatedItem[] = [];
    const bug: RelatedItem[] = [];
    const cr: RelatedItem[] = [];
    const review: RelatedItem[] = [];

    const projectId = this.projectId();

    links.forEach((link) => {
      const type = link.targetType;
      const id = link.targetId;
      const item: RelatedItem = {
        id: id,
        name: id,
        type: type,
        link: this.buildLink(type, id, projectId),
        code: id.slice(0, 8),
      };

      switch (type) {
        case 'DFD':
          dfd.push(item);
          break;
        case 'ER':
          er.push(item);
          break;
        case 'SPECIFICATION':
          spec.push(item);
          break;
        case 'TASK':
          task.push(item);
          break;
        case 'TEST_CASE':
          test.push(item);
          break;
        case 'BUG':
          bug.push(item);
          break;
        case 'CHANGE_REQUEST':
          cr.push(item);
          break;
        case 'DESIGN_REVIEW':
          review.push(item);
          break;
        default:
          break;
      }
    });

    this.dfdList.set(dfd);
    this.erList.set(er);
    this.specList.set(spec);
    this.taskList.set(task);
    this.testList.set(test);
    this.bugList.set(bug);
    this.changeRequestList.set(cr);
    this.designReviewList.set(review);
  }

  private buildLink(type: string, id: string, projectId: string | null): string {
    const base = '/feature/pm';
    switch (type) {
      case 'DFD':
      case 'ER':
        return `${base}/diagram?tabId=${id}&projectId=${projectId || ''}`;
      case 'SPECIFICATION':
        return `${base}/specification/${id}/edit`;
      case 'TASK':
        return `${base}/task/${id}/edit`;
      case 'TEST_CASE':
        return `${base}/test-case/${id}/edit`;
      case 'BUG':
        return `${base}/bug/${id}/edit`;
      case 'CHANGE_REQUEST':
        return `${base}/pmdt07/${id}/edit`;
      case 'DESIGN_REVIEW':
        return `${base}/design-review/${id}/edit`;
      default:
        return '#';
    }
  }

  // ===== Navigation Actions =====
  goBack() {
    this.navigation.navigate(['/feature/pm/pmrt02']);
  }

  // ✅ แก้ไขปุ่ม Diagram: ส่ง requirementTitle และเปลี่ยน path เป็น diagram
  createDiagram(): void {
    const reqId = this.requirementId();
    const projId = this.projectId();
    const reqTitle = this.requirement()?.title || '';
    if (!reqId || !projId) {
      this.dialog.warn('ไม่พบข้อมูล', 'กรุณาระบุ Requirement และ Project');
      return;
    }
    this.navigation.navigate(['/feature/pm/diagram'], {
      queryParams: {
        projectId: projId,
        requirementId: reqId,
        requirementTitle: reqTitle,
        openCreate: 'true',
      },
    });
  }

  createSpec() {
    const reqId = this.requirementId();
    const projId = this.projectId();
    if (!reqId || !projId) return;
    this.navigation.navigate(['/feature/pm/pmdt10/new'], {
      queryParams: { projectId: projId, requirementId: reqId },
    });
  }

  createChangeRequest() {
    const reqId = this.requirementId();
    const projId = this.projectId();
    if (!reqId || !projId) return;
    this.navigation.navigate(['/feature/pm/pmdt07'], {
      queryParams: { projectId: projId, requirementId: reqId },
    });
  }

  createDesignReview() {
    const reqId = this.requirementId();
    const projId = this.projectId();
    if (!reqId || !projId) return;
    this.navigation.navigate(['/feature/pm/pmdt11/new'], {
      queryParams: { projectId: projId, requirementId: reqId },
    });
  }

  createTask() {
    const reqId = this.requirementId();
    const projId = this.projectId();
    if (!reqId || !projId) return;
    if (this.specList().length === 0) {
      this.dialog.warn('ยังไม่มี Specification', 'กรุณาสร้าง Specification ก่อนสร้าง Task');
      return;
    }
    this.navigation.navigate(['/feature/pm/pmdt12/new'], {
      queryParams: { projectId: projId, requirementId: reqId },
    });
  }

  createTest() {
    const reqId = this.requirementId();
    const projId = this.projectId();
    if (!reqId || !projId) return;
    if (this.taskList().length === 0) {
      this.dialog.warn('ยังไม่มี Task', 'กรุณาสร้าง Task ก่อนสร้าง Test Case');
      return;
    }
    this.navigation.navigate(['/feature/pm/pmdt16/new'], {
      queryParams: { projectId: projId, requirementId: reqId },
    });
  }

  createBug() {
    const reqId = this.requirementId();
    const projId = this.projectId();
    if (!reqId || !projId) return;
    if (this.taskList().length === 0) {
      this.dialog.warn('ยังไม่มี Task', 'กรุณาสร้าง Task ก่อนแจ้ง Bug');
      return;
    }
    this.navigation.navigate(['/feature/pm/pmdt17/new'], {
      queryParams: { projectId: projId, requirementId: reqId },
    });
  }

  // ===== Helper =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'In Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Changed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      'In Review': 'อยู่ระหว่างตรวจสอบ',
      Approved: 'อนุมัติแล้ว',
      Changed: 'เปลี่ยนแปลง',
      Cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      Must: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Should: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Could: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      "Won't": 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[priority] || map["Won't"];
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }
}