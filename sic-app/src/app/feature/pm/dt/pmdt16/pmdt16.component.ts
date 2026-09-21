import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, httpResource } from '@angular/common/http';
import { finalize } from 'rxjs';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { Pmdt16AService } from './pmdt16A/pmdt16A.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';
import { ApprovalService } from '../pmdt03/approval.service';

import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicPaginationComponent } from '../../../../core/component/sic-pagination/sic-pagination.component';
import { RecentItemsService } from '../../../../core/services/recent-items.service';
import { HttpParams } from '@angular/common/http';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pmdt16',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicTableActionsComponent, SicDatePipe, SicComboboxComponent, SicGridPanelComponent, SicGridPanelTemplate, TranslateModule],
  templateUrl: './pmdt16.component.html',
  styleUrls: ['./pmdt16.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt16Component implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(Pmdt16AService);
  private dialog = inject(DialogService);
  private http = inject(HttpClient);
  private approvalService = inject(ApprovalService);
  private customerState = inject(CustomerStateService);
  private recentItems = inject(RecentItemsService);
  private translate = inject(TranslateService);
  isLoading = signal(false);

  approvalStatusMap = signal<Record<string, string>>({});

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');
  filterProjectId = signal<string | null>(null);

  invoicesResource = httpResource<any>(() => {
    const projectId = this.filterProjectId();
    let url = `${apiBaseUrl}/api/pm/invoices/paging?page=${this.currentPage()}&size=${this.pageSize()}`;
    if (projectId) {
      url += `&projectId=${projectId}`;
    }
    const keyword = this.searchTerm().trim();
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    if (this.filterStatus() !== 'all') {
      url += `&paymentStatus=${this.filterStatus()}`;
    }
    return url;
  });

  @ViewChild('grid') gridRef?: SicGridPanelComponent;

  gridConfig = computed<SicGridPanelConfig>(() => {
    const visible = this.visibleColumns();
    return {
      id: 'id',
      selectable: true,
      showToolbar: false,
      pageSize: this.pageSize(),
      column: [
        { label: this.translate.instant('PMDT16_COL_INVOICE_NO'), name: 'invoiceNo', type: 'code', width: 160 },
        { label: this.translate.instant('PMDT16_COL_CUSTOMER_PROJECT'), name: 'customerName', type: 'customerInfo', width: 240 },
        { label: this.translate.instant('PMDT16_COL_BILLING_TYPE'), name: 'billingType', type: 'text', hidden: !visible.has('billingType'), width: 120 },
        { label: this.translate.instant('PMDT16_COL_DUE_DATE'), name: 'dueDate', type: 'dateText', hidden: !visible.has('dueDate'), width: 120 },
        { label: this.translate.instant('PMDT16_COL_TOTAL_AMOUNT'), name: 'totalAmount', type: 'amountText', align: 'right', width: 130 },
        { label: this.translate.instant('PMDT16_COL_PAID_AMOUNT'), name: 'paidAmount', type: 'paidAmountText', hidden: !visible.has('paidAmount'), align: 'right', width: 130 },
        { label: this.translate.instant('PMDT16_COL_STATUS'), name: 'paymentStatus', type: 'statusBadge', align: 'center', width: 120 },
        { label: this.translate.instant('PMDT16_COL_APPROVAL'), name: 'approvalStatus', type: 'approvalBadge', hidden: !visible.has('approvalStatus'), align: 'center', width: 130 },
        { label: this.translate.instant('PMDT16_COL_ACTIONS'), name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, width: 120 },
      ],
    };
  });

  // ===== Column Visibility =====
  private readonly COLUMN_STORAGE_KEY = 'pmdt16.visibleColumns';
  get allColumns(): { key: string; label: string }[] {
    return [
      { key: 'billingType', label: this.translate.instant('PMDT16_COL_BILLING_TYPE') },
      { key: 'dueDate', label: this.translate.instant('PMDT16_COL_DUE_DATE') },
      { key: 'paidAmount', label: this.translate.instant('PMDT16_COL_PAID_AMOUNT') },
      { key: 'approvalStatus', label: this.translate.instant('PMDT16_COL_APPROVAL') },
    ];
  }
  visibleColumns = signal<Set<string>>(this.loadVisibleColumns());
  showColumnMenu = signal(false);

  constructor() {
    effect(() => {
      const err = this.invoicesResource.error();
      if (err) {
        const msg = (err as any)?.error?.message || this.translate.instant('PMDT16_LOAD_ERROR');
        this.gridRef?.setRows([], { totalElements: 0 });
        this.gridRef?.setLoadError(msg);
        this.dialog.error(this.translate.instant('PMDT16_LOAD_ERROR'), msg);
      }
    });

    effect(() => {
      const res = this.invoicesResource.value();
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
    // httpResource() รีเฟรชอัตโนมัติเมื่อ currentPage เปลี่ยน — ถ้ามีค่าอยู่แล้ว (mount ครั้งแรก) ส่งเข้า grid ทันที
    const res = this.invoicesResource.value();
    if (res?.data) {
      grid.setRows(res.data as unknown as SicGridRowData[], { totalElements: res.pageable?.totalElements || res.data.length }, request.requestId);
    }
  }

  loadApprovalStatuses(items: any[]): void {
    items.forEach((item) => {
      if (!item.id) return;
      this.approvalService.getDocumentStatus('INVOICE', item.id).subscribe({
        next: (approval) => {
          this.approvalStatusMap.update((map) => ({ ...map, [item.id]: approval.status }));
        },
        error: () => {
          // No approval status
        },
      });
    });
  }

  totalItems = computed(() => this.invoicesResource.value()?.pageable?.totalElements || 0);

  // การกรอง keyword/สถานะ ทำที่ Backend แล้ว (ผ่าน invoicesResource) เพื่อให้ pagination/export ถูกต้องตามชุดข้อมูลที่กรองจริง
  filteredInvoices = computed(() => this.invoicesResource.value()?.data || []);

  // guard: ป้องกัน reload ซ้ำซ้อนเมื่อ navigation เกิดจาก syncFiltersToUrl() เอง
  private syncingUrl = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (this.syncingUrl) {
        this.syncingUrl = false;
        return;
      }

      if (params['q'] !== undefined) this.searchTerm.set(params['q']);
      if (params['status'] !== undefined) this.filterStatus.set(params['status']);
      if (params['page'] !== undefined) this.currentPage.set(+params['page'] || 1);

      const projectId = params['projectId'] || null;
      this.filterProjectId.set(projectId);
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
        page: this.currentPage() > 1 ? this.currentPage() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.syncFiltersToUrl();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.syncFiltersToUrl();
  }

  get statusOptions() {
    return [
      { value: 'UNPAID', text: this.translate.instant('PMDT16_STATUS_OPT_UNPAID') },
      { value: 'PARTIAL', text: this.translate.instant('PMDT16_STATUS_OPT_PARTIAL') },
      { value: 'PAID', text: this.translate.instant('PMDT16_STATUS_OPT_PAID') },
      { value: 'OVERDUE', text: this.translate.instant('PMDT16_STATUS_OPT_OVERDUE') },
    ];
  }

  onFilterChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.syncFiltersToUrl();
  }

  // ===== Preset Tabs (reuse filterStatus โดยตรง) =====
  setPreset(status: string): void {
    this.filterStatus.set(status);
    this.syncFiltersToUrl();
    // รีเซ็ต grid กลับหน้า 1 — goToPage(1) เป็น no-op เงียบๆ ถ้าอยู่หน้า 1 อยู่แล้ว ต้อง reload() เอง
    if (this.gridRef?.currentPage === 1) {
      this.gridRef?.reload();
    } else {
      this.gridRef?.goToPage(1);
    }
  }

  // ===== Bulk Selection — ใช้ selection ในตัวของ grid =====
  bulkExportPdf(): void {
    const ids = Array.from(this.gridRef?.selectedRowIds ?? []) as string[];
    if (ids.length === 0) return;

    this.isLoading.set(true);
    let remaining = ids.length;
    ids.forEach((id) => {
      const url = `${apiBaseUrl}/api/pm/invoices/${id}/export-pdf`;
      this.http.get(url, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const pdfUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          const a = document.createElement('a');
          a.href = pdfUrl;
          a.download = `invoice-${id}.pdf`;
          a.click();
          URL.revokeObjectURL(pdfUrl);
        },
        error: () => {
          this.dialog.error(this.translate.instant('PMDT16_EXPORT_ERROR_TITLE'), `${this.translate.instant('PMDT16_EXPORT_ONE_ERROR_MSG_PREFIX')} ${id} ${this.translate.instant('PMDT16_EXPORT_ONE_ERROR_MSG_SUFFIX')}`);
        },
        complete: () => {
          remaining -= 1;
          if (remaining === 0) {
            this.isLoading.set(false);
            this.gridRef?.reload();
          }
        },
      });
    });
  }

  // ===== Column Visibility =====
  private loadVisibleColumns(): Set<string> {
    try {
      const raw = localStorage.getItem(this.COLUMN_STORAGE_KEY);
      if (raw) return new Set(JSON.parse(raw));
    } catch { /* ignore */ }
    return new Set(this.allColumns.map((c) => c.key));
  }

  toggleColumn(key: string): void {
    this.visibleColumns.update((set) => {
      const next = new Set(set);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    try {
      localStorage.setItem(this.COLUMN_STORAGE_KEY, JSON.stringify(Array.from(this.visibleColumns())));
    } catch { /* ignore */ }
  }

  isColumnVisible(key: string): boolean {
    return this.visibleColumns().has(key);
  }

  // ===== Export CSV (ตามตัวกรองปัจจุบันทั้งหมด ไม่ใช่แค่หน้าปัจจุบัน) =====
  exportCsv(): void {
    this.isLoading.set(true);

    let params = new HttpParams().set('page', '1').set('size', '1000');
    const projectId = this.filterProjectId();
    if (projectId) params = params.set('projectId', projectId);
    const keyword = this.searchTerm();
    if (keyword) params = params.set('keyword', keyword);
    if (this.filterStatus() !== 'all') params = params.set('paymentStatus', this.filterStatus());

    this.http
      .get<any>(`${apiBaseUrl}/api/pm/invoices/paging`, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => this.downloadCsv(res.data || []),
        error: () => this.dialog.error(this.translate.instant('PMDT16_EXPORT_ERROR_TITLE'), this.translate.instant('PMDT16_EXPORT_ALL_ERROR_MSG')),
      });
  }

  private downloadCsv(items: any[]): void {
    const headers = [
      this.translate.instant('PMDT16_COL_INVOICE_NO'),
      this.translate.instant('PMDT16_CSV_CUSTOMER'),
      this.translate.instant('PMDT16_CSV_PROJECT'),
      this.translate.instant('PMDT16_COL_BILLING_TYPE'),
      this.translate.instant('PMDT16_COL_DUE_DATE'),
      this.translate.instant('PMDT16_COL_TOTAL_AMOUNT'),
      this.translate.instant('PMDT16_COL_PAID_AMOUNT'),
      this.translate.instant('PMDT16_COL_STATUS'),
    ];
    const rows = items.map((i) => [
      i.invoiceNo, i.customerName || '', i.projectName || '', i.billingType || '',
      i.dueDate || '', String(i.totalAmount ?? ''), String(i.paidAmount ?? ''), this.getStatusText(i.paymentStatus),
    ]);
    const csvLines = [headers, ...rows].map((r) =>
      r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','),
    );
    const csvContent = '﻿' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  goToAdd() {
    const projectId = this.filterProjectId();
    this.router.navigate(['/feature/pm/invoice/new'], {
      queryParams: projectId ? { projectId } : {},
    });
  }

  goToView(id: string) {
    const invoice = (this.invoicesResource.value()?.data || []).find((item: any) => item.id === id);
    if (invoice) {
      this.recentItems.record({
        id,
        label: invoice.invoiceNo,
        type: 'invoice',
        path: `/feature/pm/invoice/${id}/view`,
        icon: 'bi-receipt',
      });
    }
    this.router.navigate(['/feature/pm/invoice', id, 'view']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/invoice', id, 'edit']);
  }

  printInvoice(item: any) {
    if (!item.id) {
      this.dialog.warn(this.translate.instant('PMDT16_NO_INVOICE_ID_TITLE'), this.translate.instant('PMDT16_NO_INVOICE_ID_MSG'));
      return;
    }

    this.isLoading.set(true);
    const url = `${apiBaseUrl}/api/pm/invoices/${item.id}/export-pdf`;
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
          console.error('Print invoice error:', err);
          this.dialog.error(this.translate.instant('PMDT16_PRINT_ERROR_TITLE'), this.translate.instant('PMDT16_PRINT_ERROR_MSG'));
        },
      });
  }

  deleteInvoice(id: string) {
    this.dialog.confirm(this.translate.instant('PMDT16_DELETE_CONFIRM_TITLE'), this.translate.instant('PMDT16_DELETE_CONFIRM_MSG')).then((confirmed) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success(this.translate.instant('PMDT16_DELETE_SUCCESS_TITLE'), this.translate.instant('PMDT16_DELETE_SUCCESS_MSG'));
            this.invoicesResource.reload();
          },
          error: (err) => {
            this.dialog.error(this.translate.instant('PMDT16_LOAD_ERROR_TITLE'), err.message || this.translate.instant('PMDT16_DELETE_FAILED_MSG'));
          },
        });
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      UNPAID: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      OVERDUE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return map[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      UNPAID: this.translate.instant('PMDT16_STATUS_TEXT_UNPAID'),
      PARTIAL: this.translate.instant('PMDT16_STATUS_TEXT_PARTIAL'),
      PAID: this.translate.instant('PMDT16_STATUS_TEXT_PAID'),
      OVERDUE: this.translate.instant('PMDT16_STATUS_TEXT_OVERDUE'),
    };
    return map[status] || status || '-';
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
      CHANGED: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    };
    return map[s] || 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20';
  }

  getApprovalStatusText(status?: string): string {
    const map: Record<string, string> = {
      DRAFT: this.translate.instant('PMDT16_APPROVAL_DRAFT'),
      PENDING: this.translate.instant('PMDT16_APPROVAL_PENDING'),
      APPROVED: this.translate.instant('PMDT16_APPROVAL_APPROVED'),
      REJECTED: this.translate.instant('PMDT16_APPROVAL_REJECTED'),
      NEED_REVISION: this.translate.instant('PMDT16_APPROVAL_NEED_REVISION'),
      CANCELLED: this.translate.instant('PMDT16_APPROVAL_CANCELLED'),
      CHANGED: this.translate.instant('PMDT16_APPROVAL_CHANGED'),
    };
    return status ? map[status.toUpperCase()] || status : '-';
  }
}

export default Pmdt16Component;