// src/app/feature/pm/rt/pmrt05/pmrt05.component.ts

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize, forkJoin, of, catchError, map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { SicCardComponent } from '../../../../core/component/sic-card/sic-card.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { RequirementDetail, TraceLink, RelatedItem, Pmrt05PageData } from './pmrt05.model';

@Component({
  selector: 'app-pmrt05',
  standalone: true,
  imports: [CommonModule, RouterModule, SicButtonComponent, SicCardComponent, SicDatePipe],
  templateUrl: './pmrt05.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  // ===== Expand state =====
  isExpanded = signal(false);

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

  // ===== Toggle expand =====
  toggleExpand() {
    this.isExpanded.update(v => !v);
  }

  // ===== Check if description is long (strip HTML) =====
  isLongDescription(html: string | null | undefined): boolean {
    if (!html) return false;
    const plainText = html.replace(/<[^>]*>/g, '').trim();
    return plainText.length > 150 || html.includes('\n') || html.includes('<p>') || html.includes('<br>');
  }

  // ===== Get short description (strip HTML + truncate) =====
  getShortDescription(html: string | null | undefined): string {
    if (!html) return '-';
    const plainText = html.replace(/<[^>]*>/g, '').trim();
    if (plainText.length <= 150) return plainText;
    return plainText.substring(0, 150) + '...';
  }

  // ===== Lifecycle =====
  ngOnInit() {
    const pageData: Pmrt05PageData = this.route.snapshot.data['pageData'];
    if (pageData && pageData.requirementDetail) {
      this.requirement.set(pageData.requirementDetail);
      this.projectId.set(pageData.requirementDetail.projectId);
      this.requirementId.set(pageData.requirementDetail.id);
      if (pageData.traceLinks) {
        this.traceLinks.set(pageData.traceLinks);
        this.groupLinks(pageData.traceLinks);
      }
    } else {
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

  private fetchItemDetails(type: string, id: string): Observable<{ code: string; name: string }> {
    let url = '';
    switch (type) {
      case 'DFD':
      case 'ER':
        url = `${environment.apiBaseUrl}/api/diagram/tabs/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({
            code: data?.tabCode || data?.name || id.slice(0, 8),
            name: data?.name || data?.tabCode || `${type} Diagram`,
          })),
          catchError(() => of({ code: id.slice(0, 8), name: `${type} Diagram` }))
        );
      case 'SPECIFICATION':
        url = `${environment.apiBaseUrl}/api/pm/specifications/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({
            code: data?.specificationCode || data?.specCode || 'SPEC',
            name: data?.title || data?.specificationCode || 'Specification',
          })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Specification' }))
        );
      case 'TASK':
        url = `${environment.apiBaseUrl}/api/pm/tasks/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({
            code: data?.taskCode || 'TASK',
            name: data?.taskName || data?.title || 'Task',
          })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Task' }))
        );
      case 'CHANGE_REQUEST':
        url = `${environment.apiBaseUrl}/api/pm/change-requests/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({
            code: data?.crNumber || data?.crCode || 'CR',
            name: data?.changeTitle || data?.title || 'Change Request',
          })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Change Request' }))
        );
      case 'TEST_CASE':
        url = `${environment.apiBaseUrl}/api/pm/test-case/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({
            code: data?.testCode || 'TC',
            name: data?.title || data?.testCase || 'Test Case',
          })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Test Case' }))
        );
      case 'BUG':
        url = `${environment.apiBaseUrl}/api/pm/bug/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({
            code: data?.bugCode || 'BUG',
            name: data?.title || 'Bug',
          })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Bug' }))
        );
      case 'DESIGN_REVIEW':
        url = `${environment.apiBaseUrl}/api/pm/design-review/${id}`;
        return this.http.get<any>(url).pipe(
          map((data) => ({
            code: data?.reviewCode || 'DR',
            name: data?.title || 'Design Review',
          })),
          catchError(() => of({ code: id.slice(0, 8), name: 'Design Review' }))
        );
      default:
        return of({ code: id.slice(0, 8), name: id });
    }
  }

  private groupLinks(links: TraceLink[]) {
    if (!links || links.length === 0) {
      this.dfdList.set([]);
      this.erList.set([]);
      this.specList.set([]);
      this.taskList.set([]);
      this.testList.set([]);
      this.bugList.set([]);
      this.changeRequestList.set([]);
      this.designReviewList.set([]);
      return;
    }

    const projectId = this.projectId();
    const requests$ = links.map((link) =>
      this.fetchItemDetails(link.targetType, link.targetId).pipe(
        map((details) => ({
          id: link.targetId,
          name: details.name,
          code: details.code,
          type: link.targetType,
          link: this.buildLink(link.targetType, link.targetId, projectId),
        }))
      )
    );

    forkJoin(requests$).subscribe({
      next: (items: RelatedItem[]) => {
        const dfd: RelatedItem[] = [];
        const er: RelatedItem[] = [];
        const spec: RelatedItem[] = [];
        const task: RelatedItem[] = [];
        const test: RelatedItem[] = [];
        const bug: RelatedItem[] = [];
        const cr: RelatedItem[] = [];
        const review: RelatedItem[] = [];

        items.forEach((item) => {
          switch (item.type) {
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
      },
      error: (err) => {
        console.error('Error fetching link details:', err);
      },
    });
  }

  private buildLink(type: string, id: string, projectId: string | null): string {
    const base = '/feature/pm';
    switch (type) {
      case 'DFD':
      case 'ER':
        return `${base}/diagram?tabId=${id}&projectId=${projectId || ''}`;
      case 'SPECIFICATION':
        return `${base}/pmdt08/${id}/edit`;
      case 'TASK':
        return `${base}/task-list/${id}/edit`;
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

  createSpec() {
    const projId = this.projectId();
    if (!projId) return;
    this.navigation.navigate(['/feature/pm/pmdt08'], {
      queryParams: { projectId: projId, requirementId: this.requirementId() },
    });
  }

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
    this.navigation.navigate(['/feature/pm/design-review/new'], {
      queryParams: { projectId: projId, requirementId: reqId },
    });
  }

  createTask() {
    const reqId = this.requirementId();
    const projId = this.projectId();
    if (!reqId || !projId) return;
    this.navigation.navigate(['/feature/pm/task-list'], {
      queryParams: { projectId: projId, requirementId: reqId },
    });
  }

  createTest() {
    const reqId = this.requirementId();
    const projId = this.projectId();
    if (!reqId || !projId) return;
    this.navigation.navigate(['/feature/pm/test-case'], {
      queryParams: { projectId: projId, requirementId: reqId },
    });
  }

  createBug() {
    const reqId = this.requirementId();
    const projId = this.projectId();
    if (!reqId || !projId) return;
    this.navigation.navigate(['/feature/pm/bug'], {
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