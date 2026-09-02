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
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { DialogService } from '../../../../core/services/dialog.service';
import type { PaginationResponse } from '../../../../core/model/pagination.model';
import { ApprovalService } from './approval.service';
import type { Approval } from './approval.model';
import { ApprovalItem } from './pmdt03.model';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';

@Component({
  selector: 'app-pmdt03',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicComboboxComponent],
  templateUrl: './pmdt03.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt03Component implements OnInit {
  private router = inject(Router);
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

  // ===== Computed =====
  protected totalItems = computed(() => this.totalElements());

  protected paginatedApprovals = computed(() => this.approvals());

  protected totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
  protected hasPrevious = computed(() => this.currentPage() > 1);
  protected hasNext = computed(() => this.currentPage() < this.totalPages());

  protected pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const range = 5;
    let start = Math.max(1, current - Math.floor(range / 2));
    let end = Math.min(total, start + range - 1);
    if (end - start < range - 1) {
      start = Math.max(1, end - range + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  protected Math = Math;

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
      this.currentPage.set(1);
      this.loadApprovals();
    });
  }

  ngOnInit(): void {
    // handled by effect on initialization
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

    let request$;
    if (this.viewMode() === 'pending') {
      request$ = this.approvalService.getPending(page, size);
    } else if (this.viewMode() === 'approvedHistory') {
      request$ = this.approvalService.getApprovedHistory(page, size);
    } else {
      request$ = this.approvalService.getMyRequests(page, size);
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

  // ===== Actions =====
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadApprovals();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadApprovals();
  }

  onFilterChange(value: any): void {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.currentPage.set(1);
    this.loadApprovals();
  }

  onTypeChange(value: any): void {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterType.set(val || 'all');
    this.currentPage.set(1);
    this.loadApprovals();
  }

  onProjectChange(value: any): void {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterProject.set(val || 'all');
    this.currentPage.set(1);
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
    this.loadApprovals();
  }

  goToApproval(id: string): void {
    this.router.navigate(['/feature/pm/approval', id]);
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
    };
    return map[type] || 'bi-file-earmark';
  }
}