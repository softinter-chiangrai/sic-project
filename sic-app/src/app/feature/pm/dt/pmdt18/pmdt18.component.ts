import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, httpResource } from '@angular/common/http';
import { finalize } from 'rxjs';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { Pmdt18AService } from './pmdt18A/pmdt18A.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { ApprovalService } from '../pmdt03/approval.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';

import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { RecentItemsService } from '../../../../core/services/recent-items.service';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pmdt18',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicTableActionsComponent, SicDatePipe, SicComboboxComponent, SicGridPanelComponent, SicGridPanelTemplate, TranslateModule],
  templateUrl: './pmdt18.component.html',
  styleUrls: ['./pmdt18.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt18Component implements OnInit {
  private translate = inject(TranslateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(Pmdt18AService);
  private dialog = inject(DialogService);
  private http = inject(HttpClient);
  private approvalService = inject(ApprovalService);
  private recentItems = inject(RecentItemsService);
  isLoading = signal(false);

  approvalStatusMap = signal<Record<string, string>>({});

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');

  renewalsResource = httpResource<any>(() => {
    const params = new URLSearchParams();
    params.set('page', String(this.currentPage()));
    params.set('size', String(this.pageSize()));
    if (this.searchTerm().trim()) params.set('keyword', this.searchTerm().trim());
    if (this.filterStatus() !== 'all') params.set('status', this.filterStatus());
    return `${apiBaseUrl}/api/pm/ma-renewals/paging?${params.toString()}`;
  });

  @ViewChild('grid') gridRef?: SicGridPanelComponent;

  gridConfig: SicGridPanelConfig = {
    id: 'id',
    selectable: false,
    showToolbar: false,
    pageSize: this.pageSize(),
    column: [
      { label: this.translate.instant('PMDT18_COL_RENEWAL_NO'), name: 'renewalNo', type: 'code', minWidth: 140 },
      { label: this.translate.instant('PMDT18_COL_CONTRACT_REF'), name: 'contractNo', type: 'contractText', minWidth: 130 },
      { label: this.translate.instant('PMDT18_COL_CUSTOMER_PROJECT'), name: 'customerName', type: 'customerInfo', minWidth: 160 },
      { label: this.translate.instant('PMDT18_COL_NEW_TERM'), name: 'newStartDate', type: 'dateRangeText', minWidth: 150 },
      { label: this.translate.instant('PMDT18_COL_PROPOSED_AMOUNT'), name: 'proposedAmount', type: 'amountText', align: 'right', minWidth: 120 },
      { label: this.translate.instant('PMDT18_COL_STATUS'), name: 'status', type: 'statusBadge', align: 'center', minWidth: 110 },
      { label: this.translate.instant('PMDT18_COL_APPROVAL'), name: 'approvalStatus', type: 'approvalBadge', align: 'center', minWidth: 120 },
      { label: this.translate.instant('PMDT18_COL_ACTIONS'), name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 100 },
    ],
  };

  constructor() {
    effect(() => {
      const res = this.renewalsResource.value();
      const content = res?.data;
      if (content && Array.isArray(content)) {
        this.loadApprovalStatuses(content);
        this.gridRef?.setRows(content as unknown as SicGridRowData[], { totalElements: res?.pageable?.totalElements || content.length });
      }
    });
  }

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    this.currentPage.set(request.pageNumber);
    this.syncFiltersToUrl();
    const res = this.renewalsResource.value();
    if (res?.data) {
      grid.setRows(res.data as unknown as SicGridRowData[], { totalElements: res.pageable?.totalElements || res.data.length }, request.requestId);
    }
  }

  loadApprovalStatuses(items: any[]): void {
    items.forEach((item) => {
      if (!item.id) return;
      this.approvalService.getDocumentStatus('MA_RENEWAL', item.id).subscribe({
        next: (approval) => {
          this.approvalStatusMap.update((map) => ({ ...map, [item.id]: approval.status }));
        },
        error: () => {
          // No approval status
        },
      });
    });
  }

  totalItems = computed(() => this.renewalsResource.value()?.pageable?.totalElements || 0);

  ngOnInit() {
    const qp = this.route.snapshot.queryParams;
    if (qp['q'] !== undefined) this.searchTerm.set(qp['q']);
    if (qp['status'] !== undefined) this.filterStatus.set(qp['status']);
    if (qp['page'] !== undefined) this.currentPage.set(+qp['page'] || 1);
  }

  // ===== URL State Sync =====
  private syncFiltersToUrl(): void {
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

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.syncFiltersToUrl();
    this.gridRef?.reload();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.syncFiltersToUrl();
    this.gridRef?.reload();
  }

  readonly statusOptions = [
    { value: 'DRAFT', text: this.translate.instant('PMDT18_STATUS_DRAFT') },
    { value: 'PROPOSED', text: this.translate.instant('PMDT18_STATUS_PROPOSED') },
    { value: 'CONFIRMED', text: this.translate.instant('PMDT18_STATUS_CONFIRMED') },
    { value: 'REJECTED', text: this.translate.instant('PMDT18_STATUS_REJECTED') },
    { value: 'EXPIRED', text: this.translate.instant('PMDT18_STATUS_EXPIRED') },
  ];

  onFilterChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.currentPage.set(1);
    this.syncFiltersToUrl();
    this.gridRef?.reload();
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/renewal/new']);
  }

  goToView(id: string) {
    const renewal = (this.renewalsResource.value()?.data || []).find((item: any) => item.id === id);
    if (renewal) {
      this.recentItems.record({
        id,
        label: renewal.renewalNo,
        type: 'renewal',
        path: `/feature/pm/renewal/${id}/view`,
        icon: 'bi-arrow-repeat',
      });
    }
    this.router.navigate(['/feature/pm/renewal', id, 'view']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/renewal', id, 'edit']);
  }

  printRenewal(item: any) {
    if (!item.id) {
      this.dialog.warn(
        this.translate.instant('PMDT18_RENEWAL_ID_NOT_FOUND_TITLE'),
        this.translate.instant('PMDT18_PRINT_FAILED_MSG'),
      );
      return;
    }

    this.isLoading.set(true);
    const url = `${apiBaseUrl}/api/pm/renewals/${item.id}/export-pdf`;
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
          console.error('Print renewal error:', err);
          this.dialog.error(
            this.translate.instant('PMDT18_PRINT_DOC_FAILED_TITLE'),
            this.translate.instant('PMDT18_JASPER_REPORT_FAILED_MSG'),
          );
        },
      });
  }

  deleteRenewal(id: string) {
    this.dialog.confirm(
      this.translate.instant('PMDT18_CONFIRM_DELETE_TITLE'),
      this.translate.instant('PMDT18_CONFIRM_DELETE_MSG'),
    ).then((confirmed) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success(this.translate.instant('PMDT18_SUCCESS_TITLE'), this.translate.instant('PMDT18_DELETE_SUCCESS_MSG'));
            this.renewalsResource.reload();
          },
          error: (err) => {
            this.dialog.error(this.translate.instant('PMDT18_ERROR_TITLE'), err.message || this.translate.instant('PMDT18_DELETE_FAILED_MSG'));
          },
        });
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      PROPOSED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      CONFIRMED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold',
      REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      EXPIRED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      DRAFT: this.translate.instant('PMDT18_STATUS_DRAFT'),
      PROPOSED: this.translate.instant('PMDT18_STATUS_PROPOSED'),
      CONFIRMED: this.translate.instant('PMDT18_STATUS_CONFIRMED'),
      REJECTED: this.translate.instant('PMDT18_STATUS_REJECTED'),
      EXPIRED: this.translate.instant('PMDT18_STATUS_EXPIRED_CONTRACT'),
    };
    return map[status] || status || '-';
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
      PENDING: this.translate.instant('PMDT18_APPR_PENDING'),
      APPROVED: this.translate.instant('PMDT18_APPR_APPROVED'),
      REJECTED: this.translate.instant('PMDT18_APPR_REJECTED'),
      NEED_REVISION: this.translate.instant('PMDT18_APPR_NEED_REVISION'),
      CANCELLED: this.translate.instant('PMDT18_APPR_CANCELLED'),
    };
    return status ? map[status.toUpperCase()] || status : '-';
  }
}

export default Pmdt18Component;