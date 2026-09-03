import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { SicButtonComponent } from '../../../../core/component/sic-button/sic-button.component';
import { DialogService } from '../../../../core/services/dialog.service';
import { ApprovalFlow } from './burt06.model';
import { Burt06Service } from './burt06.service';


import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicStripHtmlPipe } from '../../../../core/pipes/sic-strip-html.pipe';

@Component({
  selector: 'app-burt06',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicButtonComponent, SicComboboxComponent, SicStripHtmlPipe],
  templateUrl: './burt06.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './burt06.component.css',
})
export class Burt06Component implements OnInit {
  private service = inject(Burt06Service);
  private dialog = inject(DialogService);
  private router = inject(Router);

  isLoading = signal(false);
  flows = signal<ApprovalFlow[]>([]);

  // Pagination & Filtering state
  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');
  filterDocumentType = signal('all');
  sortBy = signal('flowCode');
  sortDir = signal<'asc' | 'desc'>('asc');

  documentTypeMap: Record<string, string> = {
    REQUIREMENT: 'Requirement',
    SPECIFICATION: 'Specification',
    DFD: 'DFD',
    ER: 'ER Diagram',
    DELIVERY: 'Delivery',
    INVOICE: 'Invoice',
    MA_RENEWAL: 'MA Renewal',
    CONTRACT: 'Contract',
    CHANGE_REQUEST: 'Change Request',
    TEST_PLAN: 'Test Plan',
    UAT: 'UAT',
    USER_MANUAL: 'User Manual',
  };

  readonly statusSelectOptions = [
    { value: 'active', text: 'ใช้งาน (Active)' },
    { value: 'inactive', text: 'ไม่ใช้งาน (Inactive)' },
  ];

  docTypeSelectOptions = computed(() => {
    return Object.entries(this.documentTypeMap).map(([key, label]) => ({
      value: key,
      text: label,
    }));
  });

  // Filtered list
  filteredFlows = computed(() => {
    let list = this.flows();
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      list = list.filter(
        (f) =>
          f.flowCode.toLowerCase().includes(term) ||
          f.flowName.toLowerCase().includes(term) ||
          (f.description && f.description.toLowerCase().includes(term)),
      );
    }

    const status = this.filterStatus();
    if (status === 'active') list = list.filter((f) => f.active);
    if (status === 'inactive') list = list.filter((f) => !f.active);

    const docType = this.filterDocumentType();
    if (docType !== 'all') {
      list = list.filter((f) => f.documentType === docType);
    }

    const by = this.sortBy();
    const dir = this.sortDir();
    list = [...list].sort((a, b) => {
      const va = String(a[by as keyof ApprovalFlow] ?? '');
      const vb = String(b[by as keyof ApprovalFlow] ?? '');
      return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

    return list;
  });

  // Total items & pages
  totalItems = computed(() => this.filteredFlows().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()) || 1);
  hasPrevious = computed(() => this.currentPage() > 1);
  hasNext = computed(() => this.currentPage() < this.totalPages());

  // Paginated slice
  paginatedFlows = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredFlows().slice(start, start + this.pageSize());
  });

  // Page numbers for pagination UI
  pageNumbers = computed(() => {
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

  Math = Math;

  ngOnInit(): void {
    this.loadFlows();
  }

  loadFlows(): void {
    this.isLoading.set(true);
    this.service.getFlows()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.flows.set(data),
        error: () => this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการ Approval Flow'),
      });
  }

  openCreateForm(): void {
    this.router.navigate(['/feature/bu/approval-flow/new']);
  }

  openEditForm(flow: ApprovalFlow): void {
    this.router.navigate(['/feature/bu/approval-flow', flow.id, 'edit']);
  }

  deleteFlow(flow: ApprovalFlow): void {
    this.dialog.confirm(
      'ยืนยันการลบ',
      `คุณต้องการลบ Approval Flow "${flow.flowName}" (${flow.flowCode}) ใช่หรือไม่?`
    ).then((confirmed) => {
      if (confirmed && flow.id) {
        this.isLoading.set(true);
        this.service.deleteFlow(flow.id)
          .pipe(finalize(() => this.isLoading.set(false)))
          .subscribe({
            next: () => {
              this.flows.update((list) => list.filter((f) => f.id !== flow.id));
              this.dialog.success('ลบสำเร็จ', `ลบ Flow "${flow.flowName}" เรียบร้อย`);
            },
            error: (err) => {
              this.dialog.error('ลบไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
            },
          });
      }
    });
  }

  // ===== Search, Sort, Filter & Pagination Handlers =====
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  onFilterStatusChange(value: any): void {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.currentPage.set(1);
  }

  onFilterDocTypeChange(value: any): void {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterDocumentType.set(val || 'all');
    this.currentPage.set(1);
  }

  onSortChange(field: string): void {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  getApprovalModeText(mode: string): string {
    const map: Record<string, string> = {
      CHAIN: 'เรียงลำดับ',
      PARALLEL: 'พร้อมกัน',
      ANY: 'ใครก็ได้',
      SINGLE: 'คนเดียว',
    };
    return map[mode] || mode;
  }

  getDocumentTypeText(type: string): string {
    return this.documentTypeMap[type] || type;
  }

  getStatusClass(isActive: boolean): string {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'ใช้งาน' : 'ไม่ใช้งาน';
  }
}