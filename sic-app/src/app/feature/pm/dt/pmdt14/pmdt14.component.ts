import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

import { Pmdt14AService } from './pmdt14A/pmdt14A.service';
import { PmDeliveryModel } from './pmdt14A/pmdt14A.model';
import { DialogService } from '../../../../core/services/dialog.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';
import { ApprovalService } from '../pmdt03/approval.service';

import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';

import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { resolveProjectId } from '../../../../core/utils/resolve-context.util';

@Component({
  selector: 'app-pmdt14',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicTableActionsComponent, SicDatePipe, SicComboboxComponent, SicGridPanelComponent, SicGridPanelTemplate, TranslateModule],
  templateUrl: './pmdt14.component.html',
  styleUrls: ['./pmdt14.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt14Component implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt14AService);
  private readonly dialog = inject(DialogService);
  private readonly http = inject(HttpClient);
  private readonly approvalService = inject(ApprovalService);
  private readonly customerState = inject(CustomerStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  deliveries = signal<PmDeliveryModel[]>([]);
  approvalStatusMap = signal<Record<string, string>>({});
  isLoading = signal(false);
  totalElements = signal(0);
  page = signal(1);
  size = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');
  projectId = signal<string | null>(null);

  gridConfig: SicGridPanelConfig = {
    id: 'id',
    selectable: false,
    showToolbar: false,
    pageSize: this.size(),
    column: [
      { label: this.translate.instant('PMDT14_COL_CODE_TITLE'), name: 'deliveryCode', type: 'codeTitle', minWidth: 140 },
      { label: this.translate.instant('PMDT14_COL_TYPE'), name: 'deliveryType', type: 'typeTag', minWidth: 100 },
      { label: this.translate.instant('PMDT14_COL_VERSION'), name: 'deliveryVersion', type: 'versionText', minWidth: 90 },
      { label: this.translate.instant('PMDT14_COL_DELIVERY_DATE'), name: 'deliveryDate', type: 'dateText', minWidth: 110 },
      { label: this.translate.instant('PMDT14_COL_STATUS'), name: 'status', type: 'statusBadge', minWidth: 140 },
      { label: this.translate.instant('PMDT14_COL_APPROVAL'), name: 'approvalStatus', type: 'approvalBadge', align: 'center', minWidth: 120 },
      { label: this.translate.instant('PMDT14_COL_ACTIONS'), name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 120 },
    ],
  };

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParams;
    if (qp['q'] !== undefined) this.searchTerm.set(qp['q']);
    if (qp['status'] !== undefined) this.filterStatus.set(qp['status']);
    if (qp['page'] !== undefined) this.page.set(+qp['page'] || 1);

    const projId = resolveProjectId(this.route, this.customerState);
    this.projectId.set(projId);
  }

  // ===== URL State Sync =====
  private syncFiltersToUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchTerm() || null,
        status: this.filterStatus() !== 'all' ? this.filterStatus() : null,
        page: this.page() > 1 ? this.page() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    this.isLoading.set(true);
    this.page.set(request.pageNumber);
    this.syncFiltersToUrl();

    const projectId = resolveProjectId(this.route, this.customerState) || undefined;
    this.service.getPaging({
      page: request.pageNumber,
      size: request.pageSize,
      projectId,
      keyword: this.searchTerm().trim(),
      status: this.filterStatus(),
    }).subscribe({
      next: (res) => {
        const items = res.data || [];
        const totalElements = res.pageable?.totalElements || 0;
        this.deliveries.set(items);
        this.totalElements.set(totalElements);
        this.isLoading.set(false);
        grid.setRows(items as unknown as SicGridRowData[], { totalElements }, request.requestId);
        this.loadApprovalStatuses(items, grid, request.requestId, totalElements);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || this.translate.instant('PMDT14_LOAD_ERROR');
        this.deliveries.set([]);
        this.totalElements.set(0);
        grid.setRows([], { totalElements: 0 }, request.requestId);
        grid.setLoadError(msg, request.requestId);
        this.dialog.error(this.translate.instant('PMDT14_LOAD_ERROR'), msg);
      },
    });
  }

  loadApprovalStatuses(deliveries: PmDeliveryModel[], grid: SicGridPanelComponent, requestId: number, totalElements: number): void {
    deliveries.forEach((delivery) => {
      if (!delivery.id) return;
      this.approvalService.getDocumentStatus('DELIVERY', delivery.id).subscribe({
        next: (approval) => {
          this.approvalStatusMap.update((map) => ({ ...map, [delivery.id!]: approval.status }));
          grid.setRows(this.deliveries() as unknown as SicGridRowData[], { totalElements }, requestId);
        },
        error: () => {
          // No approval status or not submitted yet
        },
      });
    });
  }

  private reloadFromPage1(grid: SicGridPanelComponent): void {
    if (grid.currentPage === 1) {
      grid.reload();
    } else {
      grid.goToPage(1);
    }
  }

  onSearch(event: Event, grid: SicGridPanelComponent): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  clearSearch(grid: SicGridPanelComponent): void {
    this.searchTerm.set('');
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  readonly statusOptions = [
    { value: 'DRAFT', text: this.translate.instant('PMDT14_STATUS_DRAFT') },
    { value: 'PREPARING', text: this.translate.instant('PMDT14_STATUS_PREPARING') },
    { value: 'READY', text: this.translate.instant('PMDT14_STATUS_READY') },
    { value: 'DELIVERED', text: this.translate.instant('PMDT14_STATUS_DELIVERED') },
    { value: 'CONFIRMED', text: this.translate.instant('PMDT14_STATUS_CONFIRMED') },
    { value: 'CHANGED', text: this.translate.instant('PMDT14_STATUS_CHANGED') },
  ];

  onFilterChange(value: any, grid: SicGridPanelComponent): void {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  goBack(): void {
    this.router.navigate(['/feature/pm/project']);
  }

  goToAdd(): void {
    this.router.navigate(['/feature/pm/delivery/new']);
  }

  goToView(id?: string): void {
    if (!id) return;
    this.router.navigate(['/feature/pm/delivery', id, 'view']);
  }

  goToEdit(id?: string): void {
    if (!id) return;
    this.router.navigate(['/feature/pm/delivery', id, 'edit']);
  }

  printDocument(item: PmDeliveryModel): void {
    if (!item.id) {
      this.dialog.warn(this.translate.instant('PMDT14_NO_DELIVERY_ID'), this.translate.instant('PMDT14_PRINT_FAILED_TITLE'));
      return;
    }

    this.isLoading.set(true);
    const url = `${environment.apiBaseUrl}/api/pm/delivery/${item.id}/export-pdf`;
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
            a.target = '_blank';
            a.click();
          }
        },
        error: (err) => {
          console.error('Print delivery error:', err);
          this.dialog.error(this.translate.instant('PMDT14_PRINT_ERROR_TITLE'), this.translate.instant('PMDT14_JASPER_ERROR'));
        },
      });
  }

  onDelete(id: string | undefined, grid: SicGridPanelComponent): void {
    if (!id) return;
    this.dialog.confirm(this.translate.instant('PMDT14_CONFIRM_DELETE_TITLE'), this.translate.instant('PMDT14_CONFIRM_DELETE_MSG')).then((confirmed: boolean) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success(this.translate.instant('PMDT14_SUCCESS_TITLE'), this.translate.instant('PMDT14_DELETE_SUCCESS_MSG'));
            grid.reload();
          },
          error: (err) => {
            this.dialog.error(this.translate.instant('PMDT14_ERROR_TITLE'), err.message || this.translate.instant('PMDT14_DELETE_FAILED_MSG'));
          },
        });
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      PREPARING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      READY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      DELIVERED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      CONFIRMED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      CHANGED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      DRAFT: this.translate.instant('PMDT14_STATUS_DRAFT'),
      PREPARING: this.translate.instant('PMDT14_STATUS_PREPARING'),
      READY: this.translate.instant('PMDT14_STATUS_READY'),
      DELIVERED: this.translate.instant('PMDT14_STATUS_DELIVERED'),
      CONFIRMED: this.translate.instant('PMDT14_STATUS_CONFIRMED'),
      CHANGED: this.translate.instant('PMDT14_STATUS_CHANGED'),
    };
    return map[status] || status;
  }

  getApprovalStatusClass(status?: string): string {
    if (!status) return 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20';
    const s = status.toUpperCase();
    const map: Record<string, string> = {
      DRAFT: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
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
      DRAFT: this.translate.instant('PMDT14_STATUS_DRAFT'),
      PENDING: this.translate.instant('PMDT14_APPROVAL_PENDING'),
      APPROVED: this.translate.instant('PMDT14_APPROVAL_APPROVED'),
      REJECTED: this.translate.instant('PMDT14_APPROVAL_REJECTED'),
      NEED_REVISION: this.translate.instant('PMDT14_APPROVAL_REVISION'),
      CANCELLED: this.translate.instant('PMDT14_APPROVAL_CANCELLED'),
    };
    return status ? map[status.toUpperCase()] || status : '-';
  }
}

export default Pmdt14Component;