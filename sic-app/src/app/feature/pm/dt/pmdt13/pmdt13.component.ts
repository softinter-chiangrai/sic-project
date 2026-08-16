// src/app/feature/pm/dt/pmdt13/pmdt13.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { PmTestCaseModel } from './pmdt13.model';
import { Pmdt13Service } from './pmdt13.service';

@Component({
  selector: 'app-pmdt13',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmdt13.component.html',
  styleUrls: ['./pmdt13.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt13Component implements OnInit {
  private router = inject(Router);
  private service = inject(Pmdt13Service);
  private customerState = inject(CustomerStateService);
  private dialog = inject(DialogService);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterPriority = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('testCaseCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected testCases = signal<PmTestCaseModel[]>([]);
  protected totalElements = signal(0);

  // ===== Computed =====
  protected filteredTestCases = computed(() => {
    let result = this.testCases();

    const status = this.filterStatus();
    const priority = this.filterPriority();

    if (status !== 'all') {
      result = result.filter((t) => (t.testStatus || '').toLowerCase() === status.toLowerCase());
    }

    if (priority !== 'all') {
      result = result.filter((t) => (t.priority || '').toLowerCase() === priority.toLowerCase());
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    return [...result].sort((a, b) => {
      const aVal = a[sortField as keyof PmTestCaseModel] ?? '';
      const bVal = b[sortField as keyof PmTestCaseModel] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  });

  protected totalItems = computed(() => this.totalElements());
  protected totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()) || 1);
  protected hasPrevious = computed(() => this.currentPage() > 1);
  protected hasNext = computed(() => this.currentPage() < this.totalPages());

  protected pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: Math.min(total, 5) }, (_, i) => {
      const page = this.currentPage() + i - Math.floor(Math.min(total, 5) / 2);
      if (page < 1) return i + 1;
      if (page > total) return total - Math.min(total, 5) + i + 1;
      return page;
    });
  });

  protected Math = Math;

  // ===== Options =====
  statusOptions = ['Pass', 'Fail', 'Blocked', 'Pending'];
  priorityOptions = ['High', 'Medium', 'Low'];

  // ===== Lifecycle =====
  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    const projectId = this.customerState.getProjectId();
    const page = this.currentPage() - 1;
    const size = this.pageSize();
    const keyword = this.searchTerm().trim();
    const sortDir = this.sortDir().toUpperCase();

    this.service
      .getTestCases(projectId, keyword, page, size, 'createdDate', sortDir)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          if (res && res.content) {
            this.testCases.set(res.content);
            this.totalElements.set(res.totalElements || res.content.length);
          } else if (Array.isArray(res)) {
            this.testCases.set(res);
            this.totalElements.set(res.length);
          } else {
            this.testCases.set([]);
            this.totalElements.set(0);
          }
        },
        error: (err) => {
          console.error('Failed to load test cases:', err);
          this.testCases.set([]);
          this.totalElements.set(0);
        },
      });
  }

  // ===== Actions =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadData();
  }

  onFilterStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
  }

  onFilterPriorityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterPriority.set(select.value);
  }

  onSortChange(field: string) {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadData();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadData();
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/test-case/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/test-case', id, 'edit']);
  }

  goToExecute(id: string) {
    this.router.navigate(['/feature/pm/test-execution', id]);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/test-case', id, 'view']);
  }

  deleteTestCase(id: string) {
    this.dialog.confirm('ยืนยันการลบ', 'ต้องการลบ Test Case นี้ใช่หรือไม่?').then((ok) => {
      if (ok) {
        this.service.deleteTestCase(id).subscribe({
          next: () => {
            this.dialog.success('ลบสำเร็จ', 'ข้อมูล Test Case ถูกลบเรียบร้อย');
            this.loadData();
          },
          error: (err) => {
            this.dialog.error('ลบไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการลบ');
          },
        });
      }
    });
  }

  // ===== Utility =====
  getStatusClass(status?: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pass':
      case 'passed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'fail':
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'blocked':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  }

  getStatusText(status?: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pass':
      case 'passed':
        return 'ผ่าน';
      case 'fail':
      case 'failed':
        return 'ไม่ผ่าน';
      case 'blocked':
        return 'ติดปัญหา';
      case 'pending':
      default:
        return 'รอทดสอบ';
    }
  }

  getStatusIcon(status?: string): string {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pass':
      case 'passed':
        return 'bi-check2-circle text-emerald-500';
      case 'fail':
      case 'failed':
        return 'bi-x-circle text-red-500';
      case 'blocked':
        return 'bi-exclamation-triangle text-yellow-500';
      case 'pending':
      default:
        return 'bi-clock text-gray-400';
    }
  }

  getPriorityClass(priority?: string): string {
    const p = (priority || '').toLowerCase();
    switch (p) {
      case 'high':
      case 'critical':
        return 'text-red-600 font-semibold';
      case 'medium':
        return 'text-amber-600 font-medium';
      case 'low':
        return 'text-emerald-600';
      default:
        return 'text-gray-500';
    }
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
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
}

export default Pmdt13Component;