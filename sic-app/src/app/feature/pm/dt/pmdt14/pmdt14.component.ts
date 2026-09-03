import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment';

import { Pmdt14AService } from './pmdt14A/pmdt14A.service';
import { PmDeliveryModel } from './pmdt14A/pmdt14A.model';
import { DialogService } from '../../../../core/services/dialog.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicDatePipe } from '../../../../core/pipes/sic-date.pipe';
import { ApprovalService } from '../pmdt03/approval.service';

import { FormsModule } from '@angular/forms';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';

@Component({
  selector: 'app-pmdt14',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicTableActionsComponent, SicDatePipe, SicComboboxComponent],
  templateUrl: './pmdt14.component.html',
  styleUrls: ['./pmdt14.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt14Component implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt14AService);
  private readonly dialog = inject(DialogService);
  private readonly http = inject(HttpClient);
  private readonly approvalService = inject(ApprovalService);

  deliveries = signal<PmDeliveryModel[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  page = signal(0);
  size = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');

  protected Math = Math;

  filteredDeliveries = computed(() => {
    let list = this.deliveries();
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.filterStatus();

    if (term) {
      list = list.filter(
        (d) =>
          d.deliveryCode?.toLowerCase().includes(term) ||
          d.deliveryTitle?.toLowerCase().includes(term) ||
          d.deliveryType?.toLowerCase().includes(term)
      );
    }
    if (status !== 'all') {
      list = list.filter((d) => d.status === status);
    }
    return list;
  });

  totalPages = computed(() => Math.ceil(this.totalElements() / this.size()) || 1);

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.page();
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

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getPaging({ page: this.page(), size: this.size() }).subscribe({
      next: (res) => {
        const items = res.content || [];
        this.deliveries.set(items);
        this.totalElements.set(res.totalElements || 0);
        this.isLoading.set(false);
        this.loadApprovalStatuses(items);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  loadApprovalStatuses(deliveries: PmDeliveryModel[]): void {
    deliveries.forEach((delivery) => {
      if (!delivery.id) return;
      this.approvalService.getDocumentStatus('DELIVERY', delivery.id).subscribe({
        next: (approval) => {
          this.deliveries.update((list) =>
            list.map((item) =>
              item.id === delivery.id ? { ...item, approvalStatus: approval.status } : item
            )
          );
        },
        error: () => {
          // No approval status or not submitted yet
        },
      });
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  readonly statusOptions = [
    { value: 'DRAFT', text: 'ร่าง (Draft)' },
    { value: 'PREPARING', text: 'กำลังเตรียมงาน' },
    { value: 'READY', text: 'พร้อมส่งมอบ' },
    { value: 'DELIVERED', text: 'ส่งมอบแล้ว' },
    { value: 'CONFIRMED', text: 'ลูกค้ายืนยันรับมอบแล้ว' },
  ];

  onFilterChange(value: any): void {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
  }

  onPageChange(p: number): void {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.loadData();
  }

  goToAdd(): void {
    this.router.navigate(['/feature/pm/delivery/new']);
  }

  goToView(id: string): void {
    this.router.navigate(['/feature/pm/delivery', id, 'view']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/feature/pm/delivery', id, 'edit']);
  }

  printDocument(item: PmDeliveryModel): void {
    if (!item.id) {
      this.dialog.warn('ไม่พบรหัสเอกสารส่งมอบ', 'ไม่สามารถพิมพ์เอกสารได้');
      return;
    }

    this.isLoading.set(true);
    const url = `${environment.apiBaseUrl}/api/pm/delivery/${item.id}/export-pdf`;
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
          console.error('Print delivery error:', err);
          this.dialog.error('พิมพ์เอกสารไม่สำเร็จ', 'ไม่สามารถสร้างรายงาน Jasper Report ได้');
        },
      });
  }

  onDelete(id: string): void {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบเอกสารส่งมอบนี้ใช่หรือไม่?').then((confirmed: boolean) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'ลบเอกสารส่งมอบเรียบร้อย');
            this.loadData();
          },
          error: (err) => {
            this.dialog.error('ข้อผิดพลาด', err.message || 'ไม่สามารถลบข้อมูลได้');
          },
        });
      }
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      PREPARING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      READY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      DELIVERED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      CONFIRMED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'ร่าง (Draft)',
      PREPARING: 'กำลังเตรียมงาน',
      READY: 'พร้อมส่งมอบ',
      DELIVERED: 'ส่งมอบแล้ว',
      CONFIRMED: 'ลูกค้ายืนยันรับมอบแล้ว',
    };
    return map[status] || status;
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
      PENDING: 'รออนุมัติ',
      APPROVED: 'อนุมัติแล้ว',
      REJECTED: 'ปฏิเสธ',
      NEED_REVISION: 'ต้องแก้ไข',
      CANCELLED: 'ยกเลิก',
    };
    return status ? map[status.toUpperCase()] || status : '-';
  }
}

export default Pmdt14Component;