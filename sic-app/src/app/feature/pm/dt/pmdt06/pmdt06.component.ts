// src/app/feature/pm/dt/pmdt07/pmdt07.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, effect, inject, OnInit, signal, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';

import { ChangeRequestService } from './change-request.service';
import { ApprovalService } from '../pmdt03/approval.service';

import { CrAssignee, ChangeImpact, ChangeRequestItem } from './pmdt06.model';

import { FormsModule } from '@angular/forms';
import {
  SicGridLoadRequest,
  SicGridPanelComponent,
  SicGridPanelConfig,
  SicGridPanelTemplate,
  SicGridRowData,
} from 'sic-ng';
import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicStripHtmlPipe } from '../../../../core/pipes/sic-strip-html.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pmdt06',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SicTableActionsComponent,
    SicComboboxComponent,
    SicStripHtmlPipe,
    SicGridPanelComponent,
    SicGridPanelTemplate,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './pmdt06.component.html',
})
export class Pmdt06Component implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private customerState = inject(CustomerStateService);
  private crService = inject(ChangeRequestService);
  private approvalService = inject(ApprovalService);
  private translate = inject(TranslateService);
  private baseUrl = environment.apiBaseUrl + '/api/pm/change-requests';

  // State
  isLoading = signal(false);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');
  // Kept for "create new CR" navigation prefill only — no longer used to filter the loaded list.
  projectId = signal<string | null>(null);

  // Full unfiltered-by-project dataset, loaded once (all projects, backend projectId omitted).
  private allChangeRequests = signal<ChangeRequestItem[]>([]);

  // ===== Navbar context filter (client-side) =====
  // Always load ALL change requests of ALL projects; the navbar project-context selection,
  // plus the existing keyword/status filters, are applied client-side against that full set.
  readonly selectedProjectIds = this.customerState.currentSelectedProjectIds;
  readonly filteredChangeRequests = computed(() => {
    let list = this.allChangeRequests();

    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      list = list.filter(
        (cr) =>
          cr.crCode?.toLowerCase().includes(term) ||
          cr.title?.toLowerCase().includes(term),
      );
    }

    const status = this.filterStatus();
    if (status && status !== 'all') {
      list = list.filter((cr) => cr.status === status);
    }

    const ids = this.selectedProjectIds();
    if (ids && ids.length > 0) {
      const idSet = new Set(ids);
      list = list.filter((cr) => idSet.has(cr.projectId));
    }

    return list;
  });

  totalItems = computed(() => this.filteredChangeRequests().length);

  @ViewChild('grid') private gridRef?: SicGridPanelComponent;

  // guard: ป้องกัน reload ซ้ำซ้อนเมื่อ navigation เกิดจาก syncFiltersToUrl() เอง
  private syncingUrl = false;

  // rows ล่าสุดที่ grid แสดงอยู่ — เก็บไว้ patch approvalStatus ทีหลังโดยไม่ต้อง reload ใหม่ทั้งหน้า
  private latestRows: ChangeRequestItem[] = [];

  // lazy: false — the full (all-projects) dataset is loaded once; the grid sorts/paginates it
  // locally, and we re-supply it via setRows() whenever the client-side filters change.
  gridConfig: SicGridPanelConfig = {
    id: 'id',
    lazy: false,
    selectable: false,
    showToolbar: false,
    pageSize: this.pageSize(),
    column: [
      { label: this.translate.instant('PMDT06_COL_CODE'), name: 'crCode', type: 'code', minWidth: 100 },
      { label: this.translate.instant('PMDT06_COL_TITLE'), name: 'title', type: 'titleDesc', minWidth: 150 },
      { label: this.translate.instant('PMDT06_COL_PROJECT'), name: 'projectName', type: 'text', minWidth: 120 },
      { label: this.translate.instant('PMDT06_COL_TARGET_TYPE'), name: 'targetType', type: 'targetTypeBadge', minWidth: 140 },
      { label: this.translate.instant('PMDT06_COL_PRIORITY'), name: 'priority', type: 'priorityBadge', minWidth: 100 },
      { label: this.translate.instant('PMDT06_COL_ASSIGNEES'), name: 'assignees', type: 'assigneeList', minWidth: 150 },
      { label: this.translate.instant('PMDT06_COL_STATUS'), name: 'status', type: 'statusBadge', minWidth: 100 },
      { label: this.translate.instant('PMDT06_COL_APPROVAL'), name: 'approvalStatus', type: 'approvalBadge', minWidth: 100 },
      { label: this.translate.instant('PMDT06_COL_ACTIONS'), name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 150 },
    ],
  };

  constructor() {
    // Re-push the currently-visible rows whenever anything the computed depends on changes —
    // most importantly the navbar's globally-selected project(s), which the grid itself has
    // no way to react to since it only calls back into us via (loadData)/reload().
    effect(() => {
      const list = this.filteredChangeRequests();
      this.latestRows = list;
      this.gridRef?.setRows(list as unknown as SicGridRowData[], { totalElements: list.length });
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((queryParams) => {
      if (this.syncingUrl) {
        this.syncingUrl = false;
        return;
      }

      if (queryParams['q'] !== undefined) this.searchTerm.set(queryParams['q']);
      if (queryParams['status'] !== undefined) this.filterStatus.set(queryParams['status']);
      if (queryParams['page'] !== undefined) {
        const page = +queryParams['page'] || 1;
        this.currentPage.set(page);
        // ตั้งหน้าเริ่มต้นให้ grid ก่อน sic-gridpanel จะ mount และยิง loadData ครั้งแรก
        this.gridConfig = { ...this.gridConfig, pageNumber: page };
      }

      // projectId ยังอ่านจาก queryParams เพื่อใช้ prefill ตอนสร้าง CR ใหม่เท่านั้น — ไม่ใช้กรอง list แล้ว
      const projectId = queryParams['projectId'] || null;
      this.projectId.set(projectId);
    });

    const resolved = this.route.snapshot.data['list'];
    if (resolved && resolved.data) {
      this.allChangeRequests.set(resolved.data || []);
      this.loadApprovalStatuses(this.allChangeRequests());
    } else {
      this.fetchAll();
    }
  }

  // ===== URL State Sync =====
  private syncFiltersToUrl(): void {
    this.syncingUrl = true;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchTerm() || null,
        status: this.filterStatus() !== 'all' ? this.filterStatus() : null,
        page: this.currentPage() > 1 ? this.currentPage() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // ===== Load Data =====
  // Loads the FULL (all-projects) dataset once from the backend — projectId is intentionally
  // omitted so navbar project-context filtering can be applied entirely client-side.
  private fetchAll(): void {
    this.isLoading.set(true);
    const params = new HttpParams().set('page', '0').set('size', '1000');

    this.http
      .get<any>(this.baseUrl, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          const data: ChangeRequestItem[] = res.data || [];
          this.allChangeRequests.set(data);
          this.loadApprovalStatuses(data);
        },
        error: () => {
          this.dialog.error(this.translate.instant('PMDT06_LOAD_FAIL_TITLE'), this.translate.instant('PMDT06_LOAD_FAIL_MSG'));
          this.allChangeRequests.set([]);
        },
      });
  }

  // lazy: false grid — (loadData) fires once on mount (plus explicit reload()); we simply hand
  // back the currently-filtered rows. The effect() above keeps the grid in sync afterwards.
  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    const list = this.filteredChangeRequests();
    this.latestRows = list;
    grid.setRows(list as unknown as SicGridRowData[], { totalElements: list.length }, request.requestId);
  }

  loadApprovalStatuses(crs: ChangeRequestItem[]) {
    crs.forEach((cr) => {
      if (!cr.id) return;
      this.approvalService.getDocumentStatus('CHANGE_REQUEST', cr.id).subscribe({
        next: (approval) => {
          this.allChangeRequests.update((list) =>
            list.map((item) =>
              item.id === cr.id ? { ...item, approvalStatus: approval.status } : item
            ),
          );
        },
        error: () => {
          // ไม่มีสถานะอนุมัติ ปล่อย null
        },
      });
    });
  }

  // goToPage(1) no-op เงียบๆ ถ้า grid อยู่หน้า 1 อยู่แล้ว (ต้อง reload() เองเพื่อให้ keyword/filter ใหม่มีผล)
  private reloadFromPage1(grid: SicGridPanelComponent): void {
    if (grid.currentPage === 1) {
      grid.reload();
    } else {
      grid.goToPage(1);
    }
  }

  onSearch(event: Event, grid: SicGridPanelComponent) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.reloadFromPage1(grid);
  }

  clearSearch(grid: SicGridPanelComponent) {
    this.searchTerm.set('');
    this.reloadFromPage1(grid);
  }

  // Options
  readonly statusOptions = [
    { value: 'Draft', text: this.translate.instant('PMDT06_STATUS_DRAFT') },
    { value: 'Submitted', text: this.translate.instant('PMDT06_STATUS_SUBMITTED') },
    { value: 'Approved', text: this.translate.instant('PMDT06_STATUS_APPROVED') },
    { value: 'Rejected', text: this.translate.instant('PMDT06_STATUS_REJECTED') },
    { value: 'Implemented', text: this.translate.instant('PMDT06_STATUS_IMPLEMENTED') },
  ];

  onFilterChange(value: any, grid: SicGridPanelComponent) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.reloadFromPage1(grid);
  }

  goToAdd() {
    if (this.projectId()) {
      this.navigation.navigate(['/feature/pm/change-request/new'], {
        queryParams: { projectId: this.projectId() },
      });
    } else {
      this.navigation.navigate(['/feature/pm/change-request/new']);
    }
  }

  goToEdit(id: string) {
    this.navigation.navigate(['/feature/pm/change-request', id, 'edit']);
  }

  goToView(id: string) {
    this.navigation.navigate(['/feature/pm/change-request', id, 'view']);
  }

  exportPdf(id: string) {
    if (!id) return;
    this.isLoading.set(true);
    this.crService.exportPdf(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (!printWindow) {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.target = '_blank';
            a.click();
          }
        },
        error: (err) => {
          console.error('Print change request error:', err);
          this.dialog.error(this.translate.instant('PMDT06_PRINT_FAIL_TITLE'), this.translate.instant('PMDT06_PRINT_FAIL_MSG'));
        },
      });
  }

  goToImpact(id: string) {
    this.navigation.navigate(['/feature/pm/change-request', id, 'edit'], {
      queryParams: { showImpact: true } // optional
    });
  }

  // ✅ ไปที่หน้า Approval Center
  goToApproval(crId: string) {
    this.router.navigate(['/feature/pm/approval', crId]);
  }

  deleteChangeRequest(id: string, grid?: SicGridPanelComponent) {
    this.dialog.confirm(this.translate.instant('PMDT06_CONFIRM_DELETE_TITLE'), this.translate.instant('PMDT06_CONFIRM_DELETE_MSG')).then((ok) => {
      if (ok) {
        this.http.delete(`${this.baseUrl}/${id}`).subscribe({
          next: () => {
            this.dialog.success(this.translate.instant('PMDT06_DELETE_SUCCESS_TITLE'), this.translate.instant('PMDT06_DELETE_SUCCESS_MSG'));
            // Refetch the full dataset (lazy grid holds it locally, so a plain grid.reload()
            // would just re-render the stale, already-deleted row from the client-side cache).
            this.fetchAll();
          },
          error: () => this.dialog.error(this.translate.instant('PMDT06_DELETE_FAIL_TITLE'), this.translate.instant('PMDT06_GENERIC_ERROR')),
        });
      }
    });
  }

  // ===== CRUD Actions (เฉพาะที่เกี่ยวข้องกับสถานะ CR โดยตรง) =====

  submitRequest(id: string, grid?: SicGridPanelComponent) {
    this.crService.submitForApproval(id).subscribe({
      next: () => {
        this.dialog.success(this.translate.instant('PMDT06_SUCCESS_TITLE'), this.translate.instant('PMDT06_SUBMIT_SUCCESS_MSG'));
        this.fetchAll();
      },
      error: (err) => this.dialog.error(this.translate.instant('PMDT06_GENERIC_ERROR'), err.error?.message || this.translate.instant('PMDT06_SUBMIT_FAIL_MSG'))
    });
  }

  implementRequest(id: string, grid?: SicGridPanelComponent) {
    this.crService.implement(id).subscribe({
      next: () => {
        this.dialog.success(this.translate.instant('PMDT06_SUCCESS_TITLE'), this.translate.instant('PMDT06_IMPLEMENT_SUCCESS_MSG'));
        this.fetchAll();
      },
      error: (err) => this.dialog.error(this.translate.instant('PMDT06_GENERIC_ERROR'), err.error?.message || this.translate.instant('PMDT06_IMPLEMENT_FAIL_MSG'))
    });
  }

  completeAssigneeTask(id: string, userId: string, targetId: string, grid?: SicGridPanelComponent) {
    this.crService.markAssigneeComplete(id, userId, targetId).subscribe({
      next: () => {
        this.dialog.success(this.translate.instant('PMDT06_SUCCESS_TITLE'), this.translate.instant('PMDT06_ASSIGNEE_COMPLETE_MSG'));
        this.fetchAll();
      },
      error: (err) => this.dialog.error(this.translate.instant('PMDT06_GENERIC_ERROR'), err.error?.message || this.translate.instant('PMDT06_ASSIGNEE_COMPLETE_FAIL_MSG'))
    });
  }

  // ===== Helper =====

  getTargetTypeText(type?: string): string {
    if (!type) return '-';
    const map: Record<string, string> = {
      REQUIREMENT: this.translate.instant('PMDT06_TARGET_REQUIREMENT'),
      SPECIFICATION: this.translate.instant('PMDT06_TARGET_SPECIFICATION'),
      TASK: this.translate.instant('PMDT06_TARGET_TASK'),
      DFD: this.translate.instant('PMDT06_TARGET_DFD'),
      ER: this.translate.instant('PMDT06_TARGET_ER'),
    };
    return map[type.toUpperCase()] || type;
  }

  getTargetTypeBadgeClass(type?: string): string {
    if (!type) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    const map: Record<string, string> = {
      REQUIREMENT: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
      SPECIFICATION: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
      TASK: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    };
    return map[type.toUpperCase()] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
  }

  getStatusClass(status: string): string {
    if (!status) return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
    const s = status.toUpperCase();
    const map: Record<string, string> = {
      DRAFT: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20',
      SUBMITTED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      IN_REVIEW: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      'IN REVIEW': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      APPROVED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      REJECTED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      IMPLEMENTED: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      NEED_REVISION: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
      'NEED REVISION': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
      CANCELLED: 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20',
    };
    return map[s] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
  }

  getStatusText(status: string): string {
    if (!status) return this.translate.instant('PMDT06_STATUS_DRAFT');
    const map: Record<string, string> = {
      Draft: this.translate.instant('PMDT06_STATUS_DRAFT'),
      DRAFT: this.translate.instant('PMDT06_STATUS_DRAFT'),
      Submitted: this.translate.instant('PMDT06_STATUS_SUBMITTED'),
      SUBMITTED: this.translate.instant('PMDT06_STATUS_SUBMITTED'),
      'In Review': this.translate.instant('PMDT06_STATUS_IN_REVIEW'),
      IN_REVIEW: this.translate.instant('PMDT06_STATUS_IN_REVIEW'),
      Pending: this.translate.instant('PMDT06_STATUS_PENDING'),
      PENDING: this.translate.instant('PMDT06_STATUS_PENDING'),
      Approved: this.translate.instant('PMDT06_STATUS_APPROVED'),
      APPROVED: this.translate.instant('PMDT06_STATUS_APPROVED'),
      Rejected: this.translate.instant('PMDT06_STATUS_REJECTED'),
      REJECTED: this.translate.instant('PMDT06_STATUS_REJECTED'),
      Implemented: this.translate.instant('PMDT06_STATUS_IMPLEMENTED'),
      IMPLEMENTED: this.translate.instant('PMDT06_STATUS_IMPLEMENTED'),
      'Need Revision': this.translate.instant('PMDT06_STATUS_NEED_REVISION'),
      NEED_REVISION: this.translate.instant('PMDT06_STATUS_NEED_REVISION'),
      Cancelled: this.translate.instant('PMDT06_STATUS_CANCELLED'),
      CANCELLED: this.translate.instant('PMDT06_STATUS_CANCELLED'),
    };
    return map[status] || status;
  }

  getApprovalStatusClass(status?: string): string {
    if (!status) return 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20';
    const s = status.toUpperCase();
    const map: Record<string, string> = {
      PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      APPROVED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      REJECTED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      NEED_REVISION: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
      CANCELLED: 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20',
    };
    return map[s] || 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20';
  }

  getApprovalStatusText(status?: string): string {
    const map: Record<string, string> = {
      PENDING: this.translate.instant('PMDT06_STATUS_SUBMITTED'),
      APPROVED: this.translate.instant('PMDT06_APPROVAL_APPROVED'),
      REJECTED: this.translate.instant('PMDT06_STATUS_REJECTED'),
      NEED_REVISION: this.translate.instant('PMDT06_STATUS_NEED_REVISION'),
      CANCELLED: this.translate.instant('PMDT06_STATUS_CANCELLED'),
    };
    return status ? map[status] || '-' : '-';
  }

  getPriorityClass(priority?: string): string {
    if (!priority) return 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20';
    const p = priority.toUpperCase();
    const map: Record<string, string> = {
      LOW: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20',
      MEDIUM: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      HIGH: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      CRITICAL: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      URGENT: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold',
    };
    return map[p] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
  }

  getPriorityText(priority?: string): string {
    if (!priority) return '-';
    const map: Record<string, string> = {
      LOW: this.translate.instant('PMDT06_PRIORITY_LOW'),
      MEDIUM: this.translate.instant('PMDT06_PRIORITY_MEDIUM'),
      HIGH: this.translate.instant('PMDT06_PRIORITY_HIGH'),
      CRITICAL: this.translate.instant('PMDT06_PRIORITY_CRITICAL'),
      URGENT: this.translate.instant('PMDT06_PRIORITY_URGENT'),
    };
    return map[priority.toUpperCase()] || priority;
  }
}