import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { DialogService } from '../../../../core/services/dialog.service';
import type { PaginationResponse } from '../../../../core/model/pagination.model';
import { ApprovalService } from './approval.service';
import type { Approval } from './approval.model';
import { ApprovalItem } from './pmdt03.model';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicPaginationComponent } from '../../../../core/component/sic-pagination/sic-pagination.component';
import { SicSkeletonComponent } from 'sic-ng';

@Component({
  selector: 'app-pmdt03',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicComboboxComponent, SicPaginationComponent, SicSkeletonComponent],
  templateUrl: './pmdt03.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt03Component implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private approvalService = inject(ApprovalService);
  private dialog = inject(DialogService);
  private authService = inject(AuthService);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterType = signal('all');
  protected filterStatus = signal('all');
  protected filterProject = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('requestedDate');
  protected sortDir = signal<'asc' | 'desc'>('desc');
  protected isLoading = signal(false);
  protected viewMode = signal<'pending' | 'myRequests' | 'approvedHistory'>('pending');

  // ===== Data =====
  protected approvals = signal<ApprovalItem[]>([]);
  protected totalElements = signal(0);

  // ===== Bulk Selection (เฉพาะแท็บ "รอฉันอนุมัติ" เท่านั้น) =====
  protected selectedIds = signal<Set<string>>(new Set());
  protected isBulkActing = signal(false);

  // ===== Column Visibility =====
  private readonly COLUMN_STORAGE_KEY = 'pmdt03.visibleColumns';
  protected readonly allColumns: { key: string; label: string }[] = [
    { key: 'projectName', label: 'โครงการ' },
    { key: 'requester', label: 'ผู้ขอ' },
    { key: 'requestedDate', label: 'วันที่ขอ' },
  ];
  protected visibleColumns = signal<Set<string>>(this.loadVisibleColumns());
  protected showColumnMenu = signal(false);

  // guard: ป้องกัน loadApprovals() ซ้ำซ้อนเมื่อ navigation เกิดจาก syncFiltersToUrl() เอง
  private syncingUrl = false;
  // guard: ข้าม effect รอบแรกตอนสร้าง component เพราะ ngOnInit (queryParams) จะเป็นผู้ trigger การโหลดข้อมูลครั้งแรกแทน
  // เพื่อให้ค่าที่อ่านจาก query params (page/filters) ไม่ถูก effect รอบแรกเขียนทับ
  private viewModeInitialized = false;

  // ===== Computed =====
  protected totalItems = computed(() => this.totalElements());

  protected paginatedApprovals = computed(() => this.approvals());

  protected totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // ===== Options =====
  readonly documentTypeOptions = [
    { value: 'REQUIREMENT', text: 'REQUIREMENT' },
    { value: 'SPECIFICATION', text: 'SPECIFICATION' },
    { value: 'DIAGRAM', text: 'DIAGRAM' },
    { value: 'DESIGN_REVIEW', text: 'DESIGN_REVIEW' },
    { value: 'CHANGE_REQUEST', text: 'CHANGE_REQUEST' },
    { value: 'TEST_PLAN', text: 'TEST_PLAN' },
    { value: 'UAT', text: 'UAT' },
    { value: 'DELIVERY', text: 'DELIVERY' },
    { value: 'INVOICE', text: 'INVOICE' },
    { value: 'MA_RENEWAL', text: 'MA_RENEWAL' },
    { value: 'CONTRACT', text: 'CONTRACT' },
    { value: 'USER_MANUAL', text: 'USER_MANUAL' },
    { value: 'PROJECT', text: 'PROJECT' },
  ];

  readonly statusSelectOptions = [
    { value: 'PENDING', text: 'รอดำเนินการ' },
    { value: 'APPROVED', text: 'อนุมัติ' },
    { value: 'REJECTED', text: 'ไม่อนุมัติ' },
    { value: 'NEED_REVISION', text: 'ขอให้แก้ไข' },
    { value: 'CANCELLED', text: 'ยกเลิก' },
  ];

  readonly projectSelectOptions = [
    { value: '1', text: 'ระบบ CRM' },
    { value: '2', text: 'ระบบ HR' },
  ];

  documentTypes = [
    'REQUIREMENT',
    'SPECIFICATION',
    'DIAGRAM',
    'DESIGN_REVIEW',
    'CHANGE_REQUEST',
    'TEST_PLAN',
    'UAT',
    'DELIVERY',
    'INVOICE',
    'MA_RENEWAL',
    'CONTRACT',
    'USER_MANUAL',
  ];

  statusOptions = ['PENDING', 'APPROVED', 'REJECTED', 'NEED_REVISION', 'CANCELLED'];

  projectOptions = [
    { id: '1', name: 'ระบบ CRM' },
    { id: '2', name: 'ระบบ HR' },
  ];

  // ===== Lifecycle =====
  constructor() {
    effect(() => {
      this.viewMode(); // trigger เมื่อ viewMode เปลี่ยน
      if (!this.viewModeInitialized) {
        // ข้ามรอบแรก: ngOnInit จะอ่าน query params แล้ว trigger การโหลดข้อมูลครั้งแรกเอง
        this.viewModeInitialized = true;
        return;
      }
      this.currentPage.set(1);
      this.selectedIds.set(new Set());
      this.loadApprovals();
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (this.syncingUrl) {
        this.syncingUrl = false;
        return;
      }

      if (params['q'] !== undefined) this.searchTerm.set(params['q']);
      if (params['status'] !== undefined) this.filterStatus.set(params['status']);
      if (params['type'] !== undefined) this.filterType.set(params['type']);
      if (params['project'] !== undefined) this.filterProject.set(params['project']);
      if (params['page'] !== undefined) this.currentPage.set(+params['page'] || 1);

      this.loadApprovals();
    });
  }

  // ===== Load Data =====
  loadApprovals(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.dialog.error('ไม่พบข้อมูลผู้ใช้', 'กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    this.isLoading.set(true);

    const page = this.currentPage() - 1; // backend ใช้ 0-based
    const size = this.pageSize();

    const keyword = this.searchTerm().trim() || undefined;
    const documentType = this.filterType() !== 'all' ? this.filterType() : undefined;
    const status = this.filterStatus() !== 'all' ? this.filterStatus() : undefined;

    let request$;
    if (this.viewMode() === 'pending') {
      request$ = this.approvalService.getPending(page, size, { keyword, documentType });
    } else if (this.viewMode() === 'approvedHistory') {
      request$ = this.approvalService.getApprovedHistory(page, size, { keyword, documentType, status });
    } else {
      request$ = this.approvalService.getMyRequests(page, size, { keyword, documentType, status });
    }

    request$
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: PaginationResponse<Approval>) => {
          this.totalElements.set(response.pageable.totalElements);
          this.approvals.set(response.data.map((approval) => this.mapApprovalToItem(approval)));
        },
        error: (error: any) => {
          console.error('Load approvals error:', error);
          this.approvals.set([]);
          this.totalElements.set(0);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการอนุมัติได้');
        },
      });
  }

  // ===== Mapping =====
  private mapApprovalToItem(approval: Approval): ApprovalItem {
    const approverName =
      approval.currentStep?.approverName ||
      approval.finalApproverName ||
      (approval.steps && approval.steps.length > 0
        ? approval.steps
            .filter((s) => s.approverName)
            .map((s) => s.approverName)
            .join(', ')
        : null) ||
      '-';

    return {
      id: approval.id,
      documentType: approval.documentType,
      documentCode: approval.documentCode,
      title: approval.documentTitle,
      projectId: approval.projectId || '',
      projectName: approval.projectName || '-',
      requester: approval.requestedByName,
      requestedDate: approval.requestedDate,
      dueDate: approval.currentStep?.timeoutDays
        ? new Date(Date.now() + approval.currentStep.timeoutDays * 86400000).toISOString()
        : undefined,
      approver: approverName,
      status: approval.status,
      comment: approval.comment || '',
      attachments: [],
      isActive: true,
    };
  }

  // ===== URL State Sync =====
  private syncFiltersToUrl(): void {
    this.syncingUrl = true;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchTerm() || null,
        status: this.filterStatus() !== 'all' ? this.filterStatus() : null,
        type: this.filterType() !== 'all' ? this.filterType() : null,
        project: this.filterProject() !== 'all' ? this.filterProject() : null,
        page: this.currentPage() > 1 ? this.currentPage() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // ===== Actions =====
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.syncFiltersToUrl();
    this.loadApprovals();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.syncFiltersToUrl();
    this.loadApprovals();
  }

  onFilterChange(value: any): void {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.currentPage.set(1);
    this.syncFiltersToUrl();
    this.loadApprovals();
  }

  onTypeChange(value: any): void {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterType.set(val || 'all');
    this.currentPage.set(1);
    this.syncFiltersToUrl();
    this.loadApprovals();
  }

  onProjectChange(value: any): void {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterProject.set(val || 'all');
    this.currentPage.set(1);
    this.syncFiltersToUrl();
    this.loadApprovals();
  }

  onSortChange(field: string): void {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
    this.currentPage.set(1);
    this.loadApprovals();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.syncFiltersToUrl();
    this.loadApprovals();
  }

  goToApproval(id: string): void {
    this.router.navigate(['/feature/pm/approval', id]);
  }

  // ===== Bulk Selection (เฉพาะแท็บ "รอฉันอนุมัติ") =====
  toggleSelect(id: string): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  isAllSelected(): boolean {
    const items = this.paginatedApprovals();
    return items.length > 0 && items.every((i) => this.selectedIds().has(i.id));
  }

  toggleSelectAll(): void {
    this.selectedIds.set(
      this.isAllSelected() ? new Set() : new Set(this.paginatedApprovals().map((i) => i.id)),
    );
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  bulkApprove(): void {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;
    this.dialog.confirm('ยืนยันการอนุมัติ', `คุณต้องการอนุมัติ ${ids.length} รายการที่เลือกใช่หรือไม่?`).then((confirmed) => {
      if (!confirmed) return;
      this.runBulkAction(ids, (id) => this.approvalService.approve(id));
    });
  }

  bulkReject(): void {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;
    this.dialog.confirm('ยืนยันการปฏิเสธ', `คุณต้องการปฏิเสธ ${ids.length} รายการที่เลือกใช่หรือไม่?`).then((confirmed) => {
      if (!confirmed) return;
      this.runBulkAction(ids, (id) => this.approvalService.reject(id));
    });
  }

  private runBulkAction(ids: string[], action: (id: string) => ReturnType<ApprovalService['approve']>): void {
    this.isBulkActing.set(true);
    let remaining = ids.length;
    let failed = 0;
    ids.forEach((id) => {
      action(id).subscribe({
        error: () => { failed += 1; },
        complete: () => {
          remaining -= 1;
          if (remaining === 0) {
            this.isBulkActing.set(false);
            this.clearSelection();
            this.loadApprovals();
            if (failed > 0) {
              this.dialog.error('ดำเนินการไม่สำเร็จบางรายการ', `${failed} รายการดำเนินการไม่สำเร็จ`);
            } else {
              this.dialog.success('สำเร็จ', 'ดำเนินการกับรายการที่เลือกเรียบร้อยแล้ว');
            }
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

  // ===== Export CSV (ตามชุดข้อมูลของแท็บปัจจุบัน) =====
  exportCsv(): void {
    this.isLoading.set(true);
    const size = 1000;
    let request$;
    if (this.viewMode() === 'pending') {
      request$ = this.approvalService.getPending(0, size);
    } else if (this.viewMode() === 'approvedHistory') {
      request$ = this.approvalService.getApprovedHistory(0, size);
    } else {
      request$ = this.approvalService.getMyRequests(0, size);
    }
    request$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (response) => this.downloadCsv(response.data.map((a) => this.mapApprovalToItem(a))),
      error: () => this.dialog.error('ส่งออกไม่สำเร็จ', 'ไม่สามารถส่งออกรายการอนุมัติได้'),
    });
  }

  private downloadCsv(items: ApprovalItem[]): void {
    const headers = ['ประเภท', 'รหัสเอกสาร', 'รายการ', 'โครงการ', 'ผู้ขอ', 'วันที่ขอ', 'สถานะ'];
    const rows = items.map((i) => [
      i.documentType, i.documentCode, i.title, i.projectName || '',
      i.requester || '', i.requestedDate || '', this.getStatusText(i.status),
    ]);
    const csvLines = [headers, ...rows].map((r) =>
      r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','),
    );
    const csvContent = '﻿' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `approvals-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      NEED_REVISION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[status] || map['PENDING'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'รอดำเนินการ',
      APPROVED: 'อนุมัติ',
      REJECTED: 'ไม่อนุมัติ',
      NEED_REVISION: 'ต้องแก้ไข',
      CANCELLED: 'ยกเลิก',
    };
    return map[status] || status;
  }

  isOverdue(dueDate?: string, status?: string): boolean {
    if (!dueDate || status !== 'PENDING') return false;
    return new Date(dueDate).getTime() < Date.now();
  }

  isDueSoon(dueDate?: string, status?: string): boolean {
    if (!dueDate || status !== 'PENDING') return false;
    const diff = new Date(dueDate).getTime() - Date.now();
    return diff > 0 && diff <= 24 * 60 * 60 * 1000;
  }

  formatDate(dateStr: string): string {
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

  getDocumentIcon(type: string): string {
    const map: Record<string, string> = {
      REQUIREMENT: 'bi-clipboard-check',
      SPECIFICATION: 'bi-file-text',
      DIAGRAM: 'bi-diagram-3',
      DFD: 'bi-diagram-3',
      ER: 'bi-table',
      DESIGN_REVIEW: 'bi-palette2',
      CHANGE_REQUEST: 'bi-arrow-left-right',
      TEST_PLAN: 'bi-clipboard-data',
      UAT: 'bi-check2-all',
      DELIVERY: 'bi-box-seam',
      INVOICE: 'bi-receipt',
      MA_RENEWAL: 'bi-clock-history',
      CONTRACT: 'bi-file-earmark-text',
      PROJECT: 'bi-briefcase',
    };
    return map[type] || 'bi-file-earmark';
  }
}