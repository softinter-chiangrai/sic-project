// src/app/feature/pm/rt/pmrt02/pmrt02.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { Pmrt02Service } from './pmrt02.service';
import { PmCustomerProject } from './pmrt02.model';

import { FormsModule } from '@angular/forms';
import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { RecentItemsService } from '../../../../core/services/recent-items.service';
import { AiProjectPipelineService } from '../../../../core/services/ai-project-pipeline.service';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pmrt02',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicTableActionsComponent, SicComboboxComponent, SicGridPanelComponent, SicGridPanelTemplate, TranslateModule],
  templateUrl: './pmrt02.component.html',
  styleUrl: './pmrt02.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt02Component implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(Pmrt02Service);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private recentItems = inject(RecentItemsService);
  private translate = inject(TranslateService);
  private pipelineSvc = inject(AiProjectPipelineService);

  openAiProjectWizard(): void {
    this.pipelineSvc.openWizard();
  }

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterPriority = signal('all');
  protected filterCustomerId = signal<string | null>(null);
  protected filterCustomerName = signal<string>('');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected isLoading = signal(false);
  protected projects = signal<PmCustomerProject[]>([]);
  protected totalItems = signal(0);

  // guard: ป้องกัน loadProjects() ซ้ำซ้อนเมื่อ navigation เกิดจาก syncFiltersToUrl() เอง
  private syncingUrl = false;

  @ViewChild('grid') gridRef?: SicGridPanelComponent;

  gridConfig: SicGridPanelConfig = {
    id: 'id',
    selectable: false,
    showToolbar: false,
    defaultSortField: 'projectCode',
    pageSize: this.pageSize(),
    column: [
      { label: this.translate.instant('PMRT02_COL_CODE'), name: 'projectCode', type: 'code', sortable: true, minWidth: 100 },
      { label: this.translate.instant('PMRT02_COL_PROJECT_NAME'), name: 'projectName', type: 'text', sortable: true, minWidth: 150 },
      { label: this.translate.instant('PMRT02_COL_CUSTOMER'), name: 'customerName', type: 'text', sortable: true, minWidth: 120 },
      { label: this.translate.instant('PMRT02_COL_STATUS'), name: 'status', type: 'statusBadge', sortable: true, minWidth: 130 },
      { label: this.translate.instant('PMRT02_COL_APPROVAL_STATUS'), name: 'approvalStatus', type: 'approvalBadge', minWidth: 120 },
      { label: 'Manday', name: 'usedManday', type: 'mandayProgress', minWidth: 150 },
      { label: this.translate.instant('PMRT02_COL_DURATION'), name: 'startDate', type: 'dateRangeText', minWidth: 120 },
      { label: this.translate.instant('PMRT02_COL_PRIORITY'), name: 'priority', type: 'priorityBadge', sortable: true, minWidth: 100 },
      { label: this.translate.instant('PMRT02_COL_VERSION'), name: 'version', type: 'text', minWidth: 90 },
      { label: this.translate.instant('PMRT02_COL_ACTIONS'), name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 160 },
    ],
  };

  // resolver อาจ preload ข้อมูลหน้าแรกมาให้แล้ว — ใช้แทนการยิง HTTP รอบแรกใน handleGridLoad()
  private initialResolverData: { data: PmCustomerProject[]; totalElements: number } | null = null;
  private hasResolverData = false;

  // goToPage(1) no-op เงียบๆ ถ้า grid อยู่หน้า 1 อยู่แล้ว
  private reloadFromPage1(grid: SicGridPanelComponent): void {
    if (grid.currentPage === 1) {
      grid.reload();
    } else {
      grid.goToPage(1);
    }
  }

  // ===== Options =====
  readonly statusSelectOptions = [
    'Prospect',
    'Contract Drafting',
    'Contract Signed',
    'Requirement Gathering',
    'Requirement Approval',
    'System Analysis',
    'DFD Design',
    'ER Design',
    'Specification Design',
    'Specification Approval',
    'Planning',
    'Development',
    'Internal Testing',
    'UAT',
    'Bug Fixing',
    'Ready for Delivery',
    'Delivered',
    'Invoicing',
    'Closed',
    'MA Active',
  ].map((s) => ({ value: s, text: this.getStatusText(s) }));

  readonly prioritySelectOptions = [
    { value: 'Low', text: 'Low' },
    { value: 'Medium', text: 'Medium' },
    { value: 'High', text: 'High' },
    { value: 'Critical', text: 'Critical' },
  ];

  statusOptions = [
    'Prospect',
    'Contract Drafting',
    'Contract Signed',
    'Requirement Gathering',
    'Requirement Approval',
    'System Analysis',
    'DFD Design',
    'ER Design',
    'Specification Design',
    'Specification Approval',
    'Planning',
    'Development',
    'Internal Testing',
    'UAT',
    'Bug Fixing',
    'Ready for Delivery',
    'Delivered',
    'Invoicing',
    'Closed',
    'MA Active',
  ];
  priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  // ===== Lifecycle =====
  ngOnInit() {
    const resolved = this.route.snapshot.data['form'] || this.route.snapshot.data['pageData'];
    if (resolved && resolved.data) {
      this.hasResolverData = true;
      this.initialResolverData = { data: resolved.data || [], totalElements: resolved.pageable?.totalElements || resolved.data.length || 0 };
      const first = resolved.data?.[0];
      if (first?.customerName) {
        this.filterCustomerName.set(first.customerName);
      }
    }

    this.route.queryParams.subscribe((params) => {
      if (this.syncingUrl) {
        this.syncingUrl = false;
        return;
      }

      if (params['q'] !== undefined) this.searchTerm.set(params['q']);
      if (params['status'] !== undefined) this.filterStatus.set(params['status']);
      if (params['priority'] !== undefined) this.filterPriority.set(params['priority']);
      if (params['page'] !== undefined) this.currentPage.set(+params['page'] || 1);

      const customerId = params['customerId'] || null;
      if (customerId) {
        this.filterCustomerId.set(customerId);
      } else {
        this.filterCustomerId.set(null);
        this.filterCustomerName.set('');
      }

      // ข้ามรอบแรก: grid จะ mount และยิง loadData เองอัตโนมัติ (ใช้ resolver data ถ้ามี) — รอบถัดไปจาก URL เปลี่ยนต้อง reload เอง
      if (this.gridRef) {
        this.gridRef.reload();
      }
    });
  }

  // ===== Load Data =====
  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent) {
    const hasActiveFilters = !!this.searchTerm() || this.filterStatus() !== 'all' || this.filterPriority() !== 'all';
    if (this.hasResolverData && this.initialResolverData && !hasActiveFilters) {
      const { data, totalElements } = this.initialResolverData;
      this.hasResolverData = false;
      this.projects.set(data);
      this.totalItems.set(totalElements);
      grid.setRows(data as unknown as SicGridRowData[], { totalElements }, request.requestId);
      return;
    }
    this.hasResolverData = false;

    this.isLoading.set(true);
    this.currentPage.set(request.pageNumber);
    this.syncFiltersToUrl();

    this.service
      .getProjects({
        customerId: this.filterCustomerId() || undefined,
        keyword: this.searchTerm() || undefined,
        status: this.filterStatus() !== 'all' ? this.filterStatus() : undefined,
        priority: this.filterPriority() !== 'all' ? this.filterPriority() : undefined,
        page: request.pageNumber,
        size: request.pageSize,
        sortBy: request.sortField ?? 'projectCode',
        sortDir: request.sortDescending ? 'desc' : 'asc',
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          const data = response.data || [];
          const totalElements = response.pageable?.totalElements || 0;
          this.projects.set(data);
          this.totalItems.set(totalElements);
          if (this.filterCustomerId() && !this.filterCustomerName()) {
            const first = data?.[0];
            if (first?.customerName) {
              this.filterCustomerName.set(first.customerName);
            }
          }
          grid.setRows(data as unknown as SicGridRowData[], { totalElements }, request.requestId);
        },
        error: (err) => {
          console.error('Load projects error:', err);
          this.dialog.error(this.translate.instant('PMRT02_LOAD_ERROR_TITLE'), err.message || this.translate.instant('PMRT02_GENERIC_ERROR_MSG'));
          this.projects.set([]);
          this.totalItems.set(0);
          grid.setRows([], { totalElements: 0 }, request.requestId);
          grid.setLoadError(this.translate.instant('PMRT02_LOAD_ERROR_TITLE'), request.requestId);
        },
      });
  }

  // ===== URL State Sync =====
  private syncFiltersToUrl(): void {
    this.syncingUrl = true;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchTerm() || null,
        status: this.filterStatus() !== 'all' ? this.filterStatus() : null,
        priority: this.filterPriority() !== 'all' ? this.filterPriority() : null,
        page: this.currentPage() > 1 ? this.currentPage() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // ===== Event Handlers =====
  onSearch(event: Event, grid: SicGridPanelComponent) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  clearSearch(grid: SicGridPanelComponent) {
    this.searchTerm.set('');
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  onFilterChange(value: any, grid: SicGridPanelComponent) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  onPriorityChange(value: any, grid: SicGridPanelComponent) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterPriority.set(val || 'all');
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  // ===== Navigation & Actions =====
  goToAdd() {
    const customerId = this.filterCustomerId();
    if (customerId) {
      this.navigation.navigate(['/feature/pm/project/new'], { queryParams: { customerId } });
    } else {
      this.navigation.navigate(['/feature/pm/project/new']);
    }
  }

  goToDetailView(id: string) {
    const project = this.projects().find(p => p.id === id);
    if (project) {
      this.recentItems.record({
        id: project.id,
        label: project.projectCode,
        type: 'project',
        path: `/feature/pm/project/${id}/edit`,
        queryParams: { mode: 'view' },
        icon: 'bi-briefcase-fill',
      });
    }
    this.navigation.navigate(['/feature/pm/project', id, 'edit'], {
      queryParams: { mode: 'view' }
    });
  }

  goToEdit(id: string) {
    this.navigation.navigate(['/feature/pm/project', id, 'edit']);
  }

  printProject(project: PmCustomerProject) {
    if (!project.id) {
      this.dialog.warn(this.translate.instant('PMRT02_NO_PROJECT_ID_TITLE'), this.translate.instant('PMRT02_NO_PRINT_MSG'));
      return;
    }

    this.isLoading.set(true);
    this.service.exportProjectPdf(project.id)
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
          console.error('Print project error:', err);
          this.dialog.error(this.translate.instant('PMRT02_PRINT_ERROR_TITLE'), this.translate.instant('PMRT02_PRINT_ERROR_MSG'));
        },
      });
  }

  deleteProject(id: string, grid: SicGridPanelComponent) {
    this.dialog.confirm(this.translate.instant('PMRT02_CONFIRM_DELETE_TITLE'), this.translate.instant('PMRT02_CONFIRM_DELETE_MSG')).then((ok) => {
      if (ok) {
        this.service.deleteProject(id).subscribe({
          next: () => {
            this.dialog.success(this.translate.instant('PMRT02_DELETE_SUCCESS_TITLE'), this.translate.instant('PMRT02_DELETE_SUCCESS_MSG'));
            grid.reload();
          },
          error: (err) => {
            this.dialog.error(this.translate.instant('PMRT02_DELETE_ERROR_TITLE'), err.error?.message || err.message || this.translate.instant('PMRT02_GENERIC_ERROR_MSG'));
          },
        });
      }
    });
  }

  goBackToCustomer() {
    this.navigation.navigate(['/feature/pm/customer']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Prospect: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'Contract Drafting': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Contract Signed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Requirement Gathering': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Requirement Approval': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'System Analysis': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'DFD Design': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'ER Design': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'Specification Design': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      'Specification Approval': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      Planning: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
      Development: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Internal Testing': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      UAT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Bug Fixing': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Ready for Delivery': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Invoicing: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      Closed: 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'MA Active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || map['Prospect'];
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

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Prospect: this.translate.instant('PMRT02_STATUS_PROSPECT'),
      'Contract Drafting': this.translate.instant('PMRT02_STATUS_CONTRACT_DRAFTING'),
      'Contract Signed': this.translate.instant('PMRT02_STATUS_CONTRACT_SIGNED'),
      'Requirement Gathering': this.translate.instant('PMRT02_STATUS_REQ_GATHERING'),
      'Requirement Approval': this.translate.instant('PMRT02_STATUS_REQ_APPROVAL'),
      'System Analysis': this.translate.instant('PMRT02_STATUS_SYSTEM_ANALYSIS'),
      'DFD Design': this.translate.instant('PMRT02_STATUS_DFD_DESIGN'),
      'ER Design': this.translate.instant('PMRT02_STATUS_ER_DESIGN'),
      'Specification Design': this.translate.instant('PMRT02_STATUS_SPEC_DESIGN'),
      'Specification Approval': this.translate.instant('PMRT02_STATUS_SPEC_APPROVAL'),
      Planning: this.translate.instant('PMRT02_STATUS_PLANNING'),
      Development: this.translate.instant('PMRT02_STATUS_DEVELOPMENT'),
      'Internal Testing': this.translate.instant('PMRT02_STATUS_INTERNAL_TESTING'),
      UAT: this.translate.instant('PMRT02_STATUS_UAT'),
      'Bug Fixing': this.translate.instant('PMRT02_STATUS_BUG_FIXING'),
      'Ready for Delivery': this.translate.instant('PMRT02_STATUS_READY_DELIVERY'),
      Delivered: this.translate.instant('PMRT02_STATUS_DELIVERED'),
      Invoicing: this.translate.instant('PMRT02_STATUS_INVOICING'),
      Closed: this.translate.instant('PMRT02_STATUS_CLOSED'),
      'MA Active': this.translate.instant('PMRT02_STATUS_MA_ACTIVE'),
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

  getProgress(used?: number | null, budget?: number | null): number {
    const u = used || 0;
    const b = budget || 0;
    if (b <= 0) return 0;
    return Math.min(Math.round((u / b) * 100), 100);
  }

  getApprovalStatusClass(status?: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      PARTIALLY_APPROVED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      NEED_REVISION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[status || ''] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }

  getApprovalStatusText(status?: string): string {
    const map: Record<string, string> = {
      PENDING: this.translate.instant('PMRT02_APPROVAL_PENDING'),
      PARTIALLY_APPROVED: this.translate.instant('PMRT02_APPROVAL_PARTIAL'),
      APPROVED: this.translate.instant('PMRT02_APPROVAL_APPROVED'),
      REJECTED: this.translate.instant('PMRT02_APPROVAL_REJECTED'),
      NEED_REVISION: this.translate.instant('PMRT02_APPROVAL_NEED_REVISION'),
      CANCELLED: this.translate.instant('PMRT02_APPROVAL_CANCELLED'),
    };
    return map[status || ''] || status || '-';
  }
}