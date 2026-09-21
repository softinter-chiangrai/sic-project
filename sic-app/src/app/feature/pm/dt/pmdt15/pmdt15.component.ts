import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Pmdt15AService } from './pmdt15A/pmdt15A.service';
import { PmUserManualModel } from './pmdt15A/pmdt15A.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { apiBaseUrl } from '../../../../core/config/api.config';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { ApprovalService } from '../pmdt03/approval.service';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';

@Component({
  selector: 'app-pmdt15',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicTableActionsComponent, SicComboboxComponent, SicGridPanelComponent, SicGridPanelTemplate, TranslateModule],
  templateUrl: './pmdt15.component.html',
  styleUrls: ['./pmdt15.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt15Component implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(Pmdt15AService);
  private readonly dialog = inject(DialogService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly http = inject(HttpClient);
  private readonly approvalService = inject(ApprovalService);
  private readonly translate = inject(TranslateService);

  manuals = signal<PmUserManualModel[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  page = signal(1);
  size = signal(50);
  projectId = signal<string | null>(null);

  searchTerm = signal('');
  filterType = signal('');
  filterStatus = signal('');

  typeFilterOptions = [
    { label: this.translate.instant('PMDT15_TYPE_USER'), value: 'USER' },
    { label: this.translate.instant('PMDT15_TYPE_ADMIN'), value: 'ADMIN' },
    { label: this.translate.instant('PMDT15_TYPE_INSTALLATION'), value: 'INSTALLATION' },
    { label: this.translate.instant('PMDT15_TYPE_OPERATION'), value: 'OPERATION' },
  ];

  statusFilterOptions = [
    { label: this.translate.instant('PMDT15_STATUS_DRAFT'), value: 'DRAFT' },
    { label: this.translate.instant('PMDT15_STATUS_REVIEW'), value: 'REVIEW' },
    { label: this.translate.instant('PMDT15_STATUS_APPROVED'), value: 'APPROVED' },
    { label: this.translate.instant('PMDT15_STATUS_CHANGED'), value: 'CHANGED' },
    { label: this.translate.instant('PMDT15_STATUS_PUBLISHED'), value: 'PUBLISHED' },
  ];

  @ViewChild('grid') gridRef?: SicGridPanelComponent;

  gridConfig: SicGridPanelConfig = {
    id: 'id',
    lazy: false,
    selectable: false,
    showToolbar: false,
    column: [
      { label: this.translate.instant('PMDT15_COL_MANUAL_CODE'), name: 'manualCode', type: 'code', minWidth: 140 },
      { label: this.translate.instant('PMDT15_COL_MANUAL_TITLE'), name: 'manualTitle', type: 'text', minWidth: 200 },
      { label: this.translate.instant('PMDT15_COL_TYPE'), name: 'manualType', type: 'typeTag', minWidth: 140 },
      { label: this.translate.instant('PMDT15_COL_VERSION'), name: 'version', type: 'versionText', align: 'center', minWidth: 90 },
      { label: this.translate.instant('PMDT15_COL_STATUS'), name: 'status', type: 'statusBadge', align: 'center', minWidth: 120 },
      { label: this.translate.instant('PMDT15_COL_APPROVAL'), name: 'approvalStatus', type: 'approvalBadge', align: 'center', minWidth: 120 },
      { label: this.translate.instant('PMDT15_COL_ACTIONS'), name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 100 },
    ],
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const qProjectId = params['projectId'];
      this.projectId.set(qProjectId || null);
      this.cdr.markForCheck();
      // ครั้งแรก grid ยัง mount ไม่เสร็จ (จะยิง loadData เองอัตโนมัติ) — ครั้งถัดไปเมื่อ projectId เปลี่ยนต้อง reload เอง
      this.gridRef?.reload();
    });
  }

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    this.isLoading.set(true);
    this.service
      .getPaging({
        projectId: this.projectId() || undefined,
        page: request.pageNumber,
        size: request.pageSize,
        keyword: this.searchTerm().trim() || undefined,
        manualType: this.filterType() || undefined,
        status: this.filterStatus() || undefined,
      })
      .pipe(finalize(() => { this.isLoading.set(false); this.cdr.markForCheck(); }))
      .subscribe({
        next: (res) => {
          const items = res.data || [];
          const totalElements = res.pageable?.totalElements || 0;
          this.manuals.set(items);
          this.totalElements.set(totalElements);
          grid.setRows(items as unknown as SicGridRowData[], { totalElements }, request.requestId);
          this.loadApprovalStatuses(items, grid, request.requestId);
        },
        error: (err) => {
          const msg = err.error?.message || this.translate.instant('PMDT15_LOAD_ERROR');
          this.manuals.set([]);
          this.totalElements.set(0);
          grid.setRows([], { totalElements: 0 }, request.requestId);
          grid.setLoadError(msg, request.requestId);
          this.dialog.error(this.translate.instant('PMDT15_LOAD_ERROR'), msg);
        },
      });
  }

  loadApprovalStatuses(manuals: PmUserManualModel[], grid: SicGridPanelComponent, requestId: number): void {
    manuals.forEach((manual) => {
      if (!manual.id) return;
      this.approvalService.getDocumentStatus('USER_MANUAL', manual.id).subscribe({
        next: (approval) => {
          this.manuals.update((list) =>
            list.map((item) =>
              item.id === manual.id ? { ...item, approvalStatus: approval.status } : item
            )
          );
          grid.setRows(this.manuals() as unknown as SicGridRowData[], { totalElements: this.totalElements() }, requestId);
          this.cdr.markForCheck();
        },
        error: () => {
          // No approval status yet
        },
      });
    });
  }

  onFilterSignalChange(): void {
    this.gridRef?.reload();
  }

  goToAdd(): void {
    const queryParams: any = {};
    if (this.projectId()) {
      queryParams.projectId = this.projectId();
    }
    this.router.navigate(['/feature/pm/manual/new'], { queryParams });
  }

  goToView(id: string): void {
    const queryParams: any = { mode: 'view' };
    if (this.projectId()) {
      queryParams.projectId = this.projectId();
    }
    this.router.navigate(['/feature/pm/manual', id, 'edit'], { queryParams });
  }

  goToEdit(id: string): void {
    const queryParams: any = {};
    if (this.projectId()) {
      queryParams.projectId = this.projectId();
    }
    this.router.navigate(['/feature/pm/manual', id, 'edit'], { queryParams });
  }

  goBack(): void {
    if (this.projectId()) {
      this.router.navigate(['/feature/pm/project-dashboard'], {
        queryParams: { projectId: this.projectId() },
      });
    } else {
      this.router.navigate(['/feature/pm/project']);
    }
  }

  onDelete(id: string, grid: SicGridPanelComponent): void {
    this.dialog.confirm(this.translate.instant('PMDT15_CONFIRM_DELETE_TITLE'), this.translate.instant('PMDT15_CONFIRM_DELETE_MSG')).then((confirmed: boolean) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success(this.translate.instant('PMDT15_SUCCESS_TITLE'), this.translate.instant('PMDT15_DELETE_SUCCESS_MSG'));
            grid.reload();
          },
          error: (err) => {
            this.dialog.error(this.translate.instant('PMDT15_ERROR_TITLE'), err.message || this.translate.instant('PMDT15_DELETE_FAILED_MSG'));
          },
        });
      }
    });
  }

  printManual(item: PmUserManualModel): void {
    if (!item.id) {
      this.dialog.warn(this.translate.instant('PMDT15_NO_MANUAL_ID'), this.translate.instant('PMDT15_PRINT_FAILED_TITLE'));
      return;
    }

    this.isLoading.set(true);
    const url = `${apiBaseUrl}/api/pm/manual/${item.id}/export-pdf`;
    this.http.get(url, { responseType: 'blob' })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (!printWindow) {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = `user-manual-${item.manualCode || item.id}.pdf`;
            a.target = '_blank';
            a.click();
          }
        },
        error: (err) => {
          console.error('Print user manual error:', err);
          this.dialog.error(this.translate.instant('PMDT15_PRINT_ERROR_TITLE'), this.translate.instant('PMDT15_JASPER_ERROR_PREFIX') + (err?.error?.message || err?.message || ''));
        },
      });
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      USER: 'User Manual',
      ADMIN: 'Admin Manual',
      INSTALLATION: 'Installation Manual',
      OPERATION: 'Operation Manual',
    };
    return map[type] || type || '-';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      APPROVED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      CHANGED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      DRAFT: this.translate.instant('PMDT15_STATUS_DRAFT'),
      REVIEW: this.translate.instant('PMDT15_STATUS_REVIEW'),
      APPROVED: this.translate.instant('PMDT15_STATUS_APPROVED'),
      CHANGED: this.translate.instant('PMDT15_STATUS_CHANGED'),
      PUBLISHED: this.translate.instant('PMDT15_STATUS_PUBLISHED'),
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
      PENDING: this.translate.instant('PMDT15_APPROVAL_PENDING'),
      APPROVED: this.translate.instant('PMDT15_STATUS_APPROVED'),
      REJECTED: this.translate.instant('PMDT15_APPROVAL_REJECTED'),
      NEED_REVISION: this.translate.instant('PMDT15_APPROVAL_REVISION'),
      CANCELLED: this.translate.instant('PMDT15_APPROVAL_CANCELLED'),
    };
    return status ? map[status.toUpperCase()] || status : '-';
  }
}

export default Pmdt15Component;