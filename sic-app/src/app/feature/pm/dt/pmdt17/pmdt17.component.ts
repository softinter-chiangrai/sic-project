import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, httpResource } from '@angular/common/http';
import { finalize } from 'rxjs';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { Pmdt17AService } from './pmdt17A/pmdt17A.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { ApprovalService } from '../pmdt03/approval.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';

import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDrawerComponent } from '../../../../core/component/sic-drawer/sic-drawer.component';
import { RecentItemsService } from '../../../../core/services/recent-items.service';
import { HttpParams } from '@angular/common/http';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';

@Component({
  selector: 'app-pmdt17',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SicTableActionsComponent,
    SicComboboxComponent,
    SicGridPanelComponent,
    SicGridPanelTemplate,
    SicDrawerComponent,
  ],
  templateUrl: './pmdt17.component.html',
  styleUrls: ['./pmdt17.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt17Component implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(Pmdt17AService);
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

  // ===== Quick View Drawer =====
  showDrawer = signal(false);
  selectedTicket = signal<any | null>(null);

  ticketsResource = httpResource<any>(() => {
    let url = `${apiBaseUrl}/api/pm/ma-tickets/paging?page=${this.currentPage()}&size=${this.pageSize()}`;
    const keyword = this.searchTerm().trim();
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    if (this.filterStatus() !== 'all') url += `&status=${this.filterStatus()}`;
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
        { label: 'เลขที่ Ticket', name: 'ticketNo', type: 'code', minWidth: 130 },
        { label: 'หัวข้อปัญหา', name: 'title', type: 'titleTruncate', minWidth: 180 },
        { label: 'ลูกค้า / โครงการ', name: 'customerName', type: 'customerInfo', minWidth: 150 },
        { label: 'ประเภท', name: 'ticketType', type: 'typeText', hidden: !visible.has('ticketType'), minWidth: 100 },
        { label: 'ความรุนแรง', name: 'severity', type: 'severityBadge', hidden: !visible.has('severity'), align: 'center', minWidth: 110 },
        { label: 'สถานะ', name: 'status', type: 'statusBadge', align: 'center', minWidth: 110 },
        { label: 'การอนุมัติ', name: 'approvalStatus', type: 'approvalBadge', hidden: !visible.has('approvalStatus'), align: 'center', minWidth: 120 },
        { label: 'ผู้รับผิดชอบ', name: 'assignedTo', type: 'assignedText', hidden: !visible.has('assignedTo'), minWidth: 130 },
        { label: 'จัดการ', name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 100 },
      ],
    };
  });

  // ===== Column Visibility =====
  private readonly COLUMN_STORAGE_KEY = 'pmdt17.visibleColumns';
  readonly allColumns: { key: string; label: string }[] = [
    { key: 'ticketType', label: 'ประเภท' },
    { key: 'severity', label: 'ความรุนแรง' },
    { key: 'approvalStatus', label: 'การอนุมัติ' },
    { key: 'assignedTo', label: 'ผู้รับผิดชอบ' },
  ];
  visibleColumns = signal<Set<string>>(this.loadVisibleColumns());
  showColumnMenu = signal(false);

  constructor() {
    effect(() => {
      const res = this.ticketsResource.value();
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
    const res = this.ticketsResource.value();
    if (res?.data) {
      grid.setRows(res.data as unknown as SicGridRowData[], { totalElements: res.pageable?.totalElements || res.data.length }, request.requestId);
    }
  }

  loadApprovalStatuses(items: any[]): void {
    items.forEach((item) => {
      if (!item.id) return;
      this.approvalService.getDocumentStatus('MA_TICKET', item.id).subscribe({
        next: (approval) => {
          this.approvalStatusMap.update((map) => ({ ...map, [item.id]: approval.status }));
        },
        error: () => {
          // No approval status
        },
      });
    });
  }

  totalItems = computed(() => this.ticketsResource.value()?.pageable?.totalElements || 0);

  // การกรอง keyword/สถานะ ทำที่ Backend แล้ว (ผ่าน ticketsResource) เพื่อให้ pagination/export ถูกต้องตามชุดข้อมูลที่กรองจริง
  filteredTickets = computed(() => this.ticketsResource.value()?.data || []);

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
    this.syncFiltersToUrl();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.syncFiltersToUrl();
  }

  readonly statusOptions = [
    { value: 'OPEN', text: 'เปิดตั๋ว' },
    { value: 'IN_PROGRESS', text: 'กำลังดำเนินการ' },
    { value: 'WAITING_CUSTOMER', text: 'รอลูกค้าตอบกลับ' },
    { value: 'RESOLVED', text: 'แก้ไขแล้ว' },
    { value: 'CHANGED', text: 'แก้ไขหลังอนุมัติ' },
    { value: 'CLOSED', text: 'ปิดตั๋ว' },
  ];

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
      const url = `${apiBaseUrl}/api/pm/ma-tickets/${id}/export-pdf`;
      this.http.get(url, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const pdfUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          const a = document.createElement('a');
          a.href = pdfUrl;
          a.download = `ma-ticket-${id}.pdf`;
          a.click();
          URL.revokeObjectURL(pdfUrl);
        },
        error: () => {
          this.dialog.error('ส่งออกไม่สำเร็จ', `ไม่สามารถส่งออกตั๋ว MA รหัส ${id} ได้`);
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
    const keyword = this.searchTerm();
    if (keyword) params = params.set('keyword', keyword);
    if (this.filterStatus() !== 'all') params = params.set('status', this.filterStatus());

    this.http
      .get<any>(`${apiBaseUrl}/api/pm/ma-tickets/paging`, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => this.downloadCsv(res.data || []),
        error: () => this.dialog.error('ส่งออกไม่สำเร็จ', 'ไม่สามารถส่งออกรายการตั๋ว MA ได้'),
      });
  }

  private downloadCsv(items: any[]): void {
    const headers = ['เลขที่ Ticket', 'หัวข้อปัญหา', 'ลูกค้า', 'โครงการ', 'ประเภท', 'ความรุนแรง', 'สถานะ', 'ผู้รับผิดชอบ'];
    const rows = items.map((i) => [
      i.ticketNo, i.title || '', i.customerName || '', i.projectName || '',
      i.ticketType || '', i.severity || '', this.getStatusText(i.status), i.assignedTo || '',
    ]);
    const csvLines = [headers, ...rows].map((r) =>
      r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','),
    );
    const csvContent = '﻿' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ma-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  openQuickView(item: any): void {
    this.selectedTicket.set(item);
    this.showDrawer.set(true);
  }

  closeQuickView(): void {
    this.showDrawer.set(false);
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/ma-ticket/new']);
  }

  goToView(id: string) {
    const ticket = (this.ticketsResource.value()?.data || []).find((item: any) => item.id === id) || this.selectedTicket();
    if (ticket) {
      this.recentItems.record({
        id,
        label: ticket.ticketNo,
        type: 'ma-ticket',
        path: `/feature/pm/ma-ticket/${id}/view`,
        icon: 'bi-headset',
      });
    }
    this.router.navigate(['/feature/pm/ma-ticket', id, 'view']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/ma-ticket', id, 'edit']);
  }

  printTicket(item: any) {
    if (!item.id) {
      this.dialog.warn('ไม่พบรหัสตั๋ว MA', 'ไม่สามารถพิมพ์เอกสารได้');
      return;
    }

    this.isLoading.set(true);
    const url = `${apiBaseUrl}/api/pm/ma-tickets/${item.id}/export-pdf`;
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
          console.error('Print ticket error:', err);
          this.dialog.error('พิมพ์เอกสารไม่สำเร็จ', 'ไม่สามารถสร้างรายงาน Jasper Report ได้');
        },
      });
  }

  deleteTicket(id: string) {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบตั๋ว MA นี้ใช่หรือไม่?').then((confirmed) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'ลบตั๋ว MA เรียบร้อยแล้ว');
            this.ticketsResource.reload();
          },
          error: (err) => {
            this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถลบข้อมูลได้');
          },
        });
      }
    });
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 font-bold border border-rose-500/20',
      HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[severity] || 'bg-gray-100 text-gray-600';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      WAITING_CUSTOMER: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      CHANGED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      CLOSED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      OPEN: 'เปิดตั๋ว',
      IN_PROGRESS: 'กำลังดำเนินการ',
      WAITING_CUSTOMER: 'รอลูกค้าตอบกลับ',
      RESOLVED: 'แก้ไขแล้ว',
      CHANGED: 'แก้ไขหลังอนุมัติ',
      CLOSED: 'ปิดตั๋ว',
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
    };
    return map[s] || 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20';
  }

  getApprovalStatusText(status?: string): string {
    const map: Record<string, string> = {
      DRAFT: 'ฉบับร่าง',
      PENDING: 'รออนุมัติ',
      APPROVED: 'อนุมัติแล้ว',
      REJECTED: 'ปฏิเสธ',
      NEED_REVISION: 'ต้องแก้ไข',
      CANCELLED: 'ยกเลิก',
    };
    return status ? map[status.toUpperCase()] || status : '-';
  }
}

export default Pmdt17Component;