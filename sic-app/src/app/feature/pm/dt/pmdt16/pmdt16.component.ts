import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, httpResource } from '@angular/common/http';
import { finalize } from 'rxjs';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { Pmdt16AService } from './pmdt16A/pmdt16A.service';
import { DialogService } from '../../../../core/services/dialog.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';
import { ApprovalService } from '../pmdt03/approval.service';

import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';

@Component({
  selector: 'app-pmdt16',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicTableActionsComponent, SicDatePipe, SicComboboxComponent],
  templateUrl: './pmdt16.component.html',
  styleUrls: ['./pmdt16.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt16Component implements OnInit {
  private router = inject(Router);
  private service = inject(Pmdt16AService);
  private dialog = inject(DialogService);
  private http = inject(HttpClient);
  private approvalService = inject(ApprovalService);
  isLoading = signal(false);

  approvalStatusMap = signal<Record<string, string>>({});

  currentPage = signal(0);
  pageSize = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');

  protected Math = Math;

  invoicesResource = httpResource<any>(
    () => `${apiBaseUrl}/api/pm/invoices/paging?page=${this.currentPage()}&size=${this.pageSize()}`
  );

  constructor() {
    effect(() => {
      const res = this.invoicesResource.value();
      const content = res?.content;
      if (content && Array.isArray(content)) {
        this.loadApprovalStatuses(content);
      }
    });
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

  totalItems = computed(() => this.invoicesResource.value()?.totalElements || 0);

  filteredInvoices = computed(() => {
    const res = this.invoicesResource.value();
    let list: any[] = res?.content || [];
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.filterStatus();

    if (term) {
      list = list.filter(
        (item) =>
          item.invoiceNo?.toLowerCase().includes(term) ||
          item.customerName?.toLowerCase().includes(term) ||
          item.projectName?.toLowerCase().includes(term) ||
          item.billingType?.toLowerCase().includes(term)
      );
    }
    if (status !== 'all') {
      list = list.filter((item) => item.paymentStatus === status);
    }
    return list;
  });

  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()) || 1);

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const range = 5;
    let start = Math.max(0, current - Math.floor(range / 2));
    let end = Math.min(total - 1, start + range - 1);
    if (end - start < range - 1) {
      start = Math.max(0, end - range + 1);
    }
    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  ngOnInit() {}

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch() {
    this.searchTerm.set('');
  }

  readonly statusOptions = [
    { value: 'UNPAID', text: 'รอชำระ (Unpaid)' },
    { value: 'PARTIAL', text: 'ชำระบางส่วน (Partial)' },
    { value: 'PAID', text: 'ชำระครบแล้ว (Paid)' },
    { value: 'OVERDUE', text: 'เกินกำหนด (Overdue)' },
  ];

  onFilterChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
  }

  onPageChange(page: number) {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/invoice/new']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/invoice', id, 'view']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/invoice', id, 'edit']);
  }

  printInvoice(item: any) {
    if (!item.id) {
      this.dialog.warn('ไม่พบรหัสใบแจ้งหนี้', 'ไม่สามารถพิมพ์เอกสารได้');
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
          this.dialog.error('พิมพ์เอกสารไม่สำเร็จ', 'ไม่สามารถสร้างรายงาน Jasper Report ได้');
        },
      });
  }

  deleteInvoice(id: string) {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบใบแจ้งหนี้นี้ใช่หรือไม่?').then((confirmed) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'ลบใบแจ้งหนี้เรียบร้อยแล้ว');
            this.invoicesResource.reload();
          },
          error: (err) => {
            this.dialog.error('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถลบข้อมูลได้');
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
      UNPAID: 'รอชำระเงิน',
      PARTIAL: 'ชำระบางส่วน',
      PAID: 'ชำระครบแล้ว',
      OVERDUE: 'เกินกำหนดชำระ',
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

export default Pmdt16Component;