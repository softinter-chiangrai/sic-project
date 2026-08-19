import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { Pmdt14AService } from './pmdt14A/pmdt14A.service';
import { PmDeliveryModel } from './pmdt14A/pmdt14A.model';
import { DialogService } from '../../../../core/services/dialog.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';

@Component({
  selector: 'app-pmdt14',
  standalone: true,
  imports: [CommonModule, RouterModule, SicTableActionsComponent],
  templateUrl: './pmdt14.component.html',
  styleUrls: ['./pmdt14.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt14Component implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt14AService);
  private readonly dialog = inject(DialogService);

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
        this.deliveries.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  onFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
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
}

export default Pmdt14Component;