import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, httpResource } from '@angular/common/http';
import { finalize } from 'rxjs';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { Pmdt16AService } from './pmdt16A/pmdt16A.service';
import { DialogService } from '../../../../core/services/dialog.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';

@Component({
  selector: 'app-pmdt16',
  standalone: true,
  imports: [CommonModule, RouterModule, SicTableActionsComponent, SicDatePipe],
  templateUrl: './pmdt16.component.html',
  styleUrls: ['./pmdt16.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt16Component implements OnInit {
  private router = inject(Router);
  private service = inject(Pmdt16AService);
  private dialog = inject(DialogService);
  private http = inject(HttpClient);
  isLoading = signal(false);

  currentPage = signal(0);
  pageSize = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');

  protected Math = Math;

  invoicesResource = httpResource<any>(
    () => `${apiBaseUrl}/api/pm/invoices/paging?page=${this.currentPage()}&size=${this.pageSize()}`
  );

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

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
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
}

export default Pmdt16Component;