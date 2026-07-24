// src/app/feature/pm/dt/pmdt08/pmdt08.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { Pmdt08Service } from './pmdt08.service';
import { SpecificationModel } from './pmdt08.model';
import { PaginationResponse } from '../../../../core/model/pagination.model';

@Component({
  selector: 'app-pmdt08',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmdt08.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt08Component implements OnInit {
  private service = inject(Pmdt08Service);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);

  isLoading = signal(false);
  specs = signal<SpecificationModel[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');
  filterProjectId = signal<string | null>(null);

  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
  hasPrevious = computed(() => this.currentPage() > 1);
  hasNext = computed(() => this.currentPage() < this.totalPages());
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
    this.route.queryParams.subscribe(params => {
      if (params['projectId']) {
        this.filterProjectId.set(params['projectId']);
      }
      this.loadData();
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    const params = {
      projectId: this.filterProjectId() || undefined,
      keyword: this.searchTerm() || undefined,
      status: this.filterStatus() === 'all' ? undefined : this.filterStatus(),
      page: this.currentPage() - 1,
      size: this.pageSize(),
      sortBy: 'createdDate',
      sortDir: 'desc',
    };
    this.service.search(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: PaginationResponse<SpecificationModel>) => {
          this.specs.set(res.data);
          this.totalItems.set(res.pageable.totalElements);
        },
        error: () => {
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดข้อมูลได้');
          this.specs.set([]);
          this.totalItems.set(0);
        },
      });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadData();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadData();
  }

  onFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
    this.loadData();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadData();
  }

  goToAdd(): void {
    const projectId = this.filterProjectId();
    if (projectId) {
      this.navigation.navigate(['/feature/pm/pmdt08A/new'], { queryParams: { projectId } });
    } else {
      this.navigation.navigate(['/feature/pm/pmdt08A/new']);
    }
  }

  goToEdit(id: string): void {
    this.navigation.navigate(['/feature/pm/pmdt08A', id, 'edit']);
  }

  deleteSpec(id: string): void {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบ Specification นี้ใช่หรือไม่?')
      .then((ok) => {
        if (ok) {
          this.service.delete(id).subscribe({
            next: () => {
              this.dialog.success('ลบสำเร็จ', 'Specification ถูกลบแล้ว');
              this.loadData();
            },
            error: (err) => {
              this.dialog.error('ลบไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
            },
          });
        }
      });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      Review: 'ตรวจสอบ',
      Approved: 'อนุมัติ',
      Rejected: 'ปฏิเสธ',
    };
    return map[status] || status;
  }
}