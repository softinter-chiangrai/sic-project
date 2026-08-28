import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, httpResource } from '@angular/common/http';
import { finalize } from 'rxjs';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { Pmdt17AService } from './pmdt17A/pmdt17A.service';
import { DialogService } from '../../../../core/services/dialog.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';

import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';

@Component({
  selector: 'app-pmdt17',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicTableActionsComponent, SicComboboxComponent],
  templateUrl: './pmdt17.component.html',
  styleUrls: ['./pmdt17.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt17Component implements OnInit {
  private router = inject(Router);
  private service = inject(Pmdt17AService);
  private dialog = inject(DialogService);
  private http = inject(HttpClient);
  isLoading = signal(false);

  currentPage = signal(0);
  pageSize = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');

  protected Math = Math;

  ticketsResource = httpResource<any>(
    () => `${apiBaseUrl}/api/pm/ma-tickets/paging?page=${this.currentPage()}&size=${this.pageSize()}`
  );

  totalItems = computed(() => this.ticketsResource.value()?.totalElements || 0);

  filteredTickets = computed(() => {
    const res = this.ticketsResource.value();
    let list: any[] = res?.content || [];
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.filterStatus();

    if (term) {
      list = list.filter(
        (item) =>
          item.ticketNo?.toLowerCase().includes(term) ||
          item.title?.toLowerCase().includes(term) ||
          item.customerName?.toLowerCase().includes(term) ||
          item.projectName?.toLowerCase().includes(term) ||
          item.assignedTo?.toLowerCase().includes(term)
      );
    }
    if (status !== 'all') {
      list = list.filter((item) => item.status === status);
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
    { value: 'OPEN', text: 'เปิดตั๋ว (Open)' },
    { value: 'IN_PROGRESS', text: 'กำลังดำเนินการ (In Progress)' },
    { value: 'WAITING_CUSTOMER', text: 'รอลูกค้าตอบกลับ (Waiting)' },
    { value: 'RESOLVED', text: 'แก้ไขแล้ว (Resolved)' },
    { value: 'CLOSED', text: 'ปิดตั๋ว (Closed)' },
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
    this.router.navigate(['/feature/pm/ma-ticket/new']);
  }

  goToView(id: string) {
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
      CLOSED: 'ปิดตั๋ว',
    };
    return map[status] || status || '-';
  }
}

export default Pmdt17Component;