import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { ApprovalService } from './approval.service';
import type { Approval, ApprovalSearchParams } from './approval.model';
import type { PaginationResponse } from '../../../../core/model/pagination.model';


// ===== Interface สำหรับแสดงในตาราง (map จาก Approval) =====
interface ApprovalItem {
  id: string;
  documentType: string;
  documentCode: string;
  title: string;
  projectId: string;
  projectName: string;
  requester: string;
  requestedDate: string;
  dueDate?: string;
  approver: string;
  status: string; // ใช้ string เพื่อให้ getStatusClass ทำงาน
  comment?: string;
  attachments?: string[];
  isActive: boolean;
}

@Component({
  selector: 'app-pmdt03',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmdt03.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt03Component implements OnInit {
  private router = inject(Router);
  private approvalService = inject(ApprovalService);

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

  // ===== Options (คงเดิม) =====
  documentTypes = [
    'REQUIREMENT',
    'DFD',
    'ER',
    'SPECIFICATION',
    'CHANGE_REQUEST',
    'TEST_PLAN',
    'UAT',
    'DELIVERY',
    'INVOICE',
    'MA_RENEWAL',
  ];

  statusOptions = ['PENDING', 'APPROVED', 'REJECTED', 'NEED_REVISION', 'CANCELLED'];

  // projectOptions ควรโหลดจาก API จริง (แต่ถ้ายังไม่มีให้ใช้ mock หรือลบออก)
  projectOptions = [
    { id: '1', name: 'ระบบ CRM' },
    { id: '2', name: 'ระบบ HR' },
  ];

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.loadApprovals();
  }

  // ===== Load Data =====
  loadApprovals(): void {
    this.isLoading.set(true);

    const params: ApprovalSearchParams = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize(),
      keyword: this.searchTerm() || undefined,
      documentType: this.filterType() === 'all' ? undefined : this.filterType(),
      status: this.filterStatus() === 'all' ? undefined : this.filterStatus(),
      sorts: [{ field: this.sortBy(), descending: this.sortDir() === 'desc' }],
    };

    this.approvalService
      .search(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: PaginationResponse<Approval>) => {
          this.totalElements.set(response.pageable.totalElements);
          this.approvals.set(response.data.map((approval) => this.mapApprovalToItem(approval)));
        },
        error: (error) => {
          console.error('Load approvals error:', error);
          this.approvals.set([]);
          this.totalElements.set(0);
        },
      });
  }

  // ===== Mapping =====
  private mapApprovalToItem(approval: Approval): ApprovalItem {
    return {
      id: approval.id,
      documentType: approval.documentType,
      documentCode: approval.documentCode,
      title: approval.documentTitle,
      projectId: '', // ยังไม่มีจาก API
      projectName: '-', // ยังไม่มีจาก API
      requester: approval.requestedByName,
      requestedDate: approval.requestedDate,
      dueDate: approval.currentStep?.timeoutDays
        ? new Date(Date.now() + approval.currentStep.timeoutDays * 86400000).toISOString()
        : undefined,
      approver: approval.currentStep?.approverName || approval.finalApproverName || '-',
      status: approval.status,
      comment: approval.comment || '',
      attachments: [],
      isActive: true,
    };
  }

  // ===== Actions (ปรับให้เรียก loadApprovals) =====
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

  onFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
    this.loadApprovals();
  }

  onTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterType.set(select.value);
    this.currentPage.set(1);
    this.loadApprovals();
  }

  onProjectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterProject.set(select.value);
    this.currentPage.set(1);
    // ถ้าต้องการกรองตาม projectId ต้องเพิ่มใน params (backend ต้องรองรับ)
    // ปัจจุบันยังไม่มีใน ApprovalSearchParams จึงยังไม่ทำงาน
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

  // ===== Utility (คงเดิม) =====
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
      DFD: 'bi-diagram-3',
      ER: 'bi-table',
      SPECIFICATION: 'bi-file-text',
      CHANGE_REQUEST: 'bi-arrow-left-right',
      TEST_PLAN: 'bi-clipboard-data',
      UAT: 'bi-check2-all',
      DELIVERY: 'bi-box-seam',
      INVOICE: 'bi-receipt',
      MA_RENEWAL: 'bi-clock-history',
    };
    return map[type] || 'bi-file-earmark';
  }
}

