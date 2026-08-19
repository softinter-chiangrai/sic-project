import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { httpResource } from '@angular/common/http';
import { apiBaseUrl } from '../../../../core/config/api.config';
import { Pmdt18AService } from './pmdt18A/pmdt18A.service';
import { DialogService } from '../../../../core/services/dialog.service';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';

@Component({
  selector: 'app-pmdt18',
  standalone: true,
  imports: [CommonModule, RouterModule, SicTableActionsComponent],
  templateUrl: './pmdt18.component.html',
  styleUrls: ['./pmdt18.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt18Component implements OnInit {
  private router = inject(Router);
  private service = inject(Pmdt18AService);
  private dialog = inject(DialogService);

  currentPage = signal(0);
  pageSize = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');

  protected Math = Math;

  renewalsResource = httpResource<any>(
    () => `${apiBaseUrl}/api/pm/ma-renewals/paging?page=${this.currentPage()}&size=${this.pageSize()}`
  );

  totalItems = computed(() => this.renewalsResource.value()?.totalElements || 0);

  filteredRenewals = computed(() => {
    const res = this.renewalsResource.value();
    let list: any[] = res?.content || [];
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.filterStatus();

    if (term) {
      list = list.filter(
        (item) =>
          item.renewalNo?.toLowerCase().includes(term) ||
          item.contractNo?.toLowerCase().includes(term) ||
          item.customerName?.toLowerCase().includes(term) ||
          item.projectName?.toLowerCase().includes(term)
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

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
  }

  onPageChange(page: number) {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/renewal/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/renewal', id, 'edit']);
  }

  deleteRenewal(id: string) {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบข้อเสนอต่อสัญญานี้ใช่หรือไม่?').then((confirmed) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'ลบข้อเสนอต่อสัญญาเรียบร้อยแล้ว');
            this.renewalsResource.reload();
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
      DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      PROPOSED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      CONFIRMED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold',
      REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      EXPIRED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'ร่างข้อเสนอ',
      PROPOSED: 'เสนอราคาแล้ว',
      CONFIRMED: 'ตกลงต่อสัญญาแล้ว',
      REJECTED: 'ปฏิเสธการต่อสัญญา',
      EXPIRED: 'หมดอายุสัญญา',
    };
    return map[status] || status || '-';
  }
}

export default Pmdt18Component;