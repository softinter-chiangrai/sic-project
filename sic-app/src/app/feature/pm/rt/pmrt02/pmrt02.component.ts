// src/app/feature/pm/rt/pmrt02/pmrt02.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { DialogService } from '../../../../core/services/dialog.service';
import { PmCustomerProject, Pmrt02Service } from './pmrt02.service';
import { CustomerStateService } from '../pmrt01/customer-state.service';

@Component({
  selector: 'app-pmrt02',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt02.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt02Component implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(Pmrt02Service);
  private dialog = inject(DialogService);
  private customerState = inject(CustomerStateService);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterPriority = signal('all');
  protected filterCustomerId = signal<string | null>(null);
  protected filterCustomerName = signal<string>('');
  // ✅ เพิ่ม state สำหรับ Date Filter
  protected filterStartDate = signal<string>('');
  protected filterEndDate = signal<string>('');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('projectCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);
  protected projects = signal<PmCustomerProject[]>([]);
  protected totalItems = signal(0);

  // ===== Computed =====
  protected totalPages = computed(() => {
    const total = this.totalItems();
    const size = this.pageSize();
    return total > 0 ? Math.ceil(total / size) : 1;
  });
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

  // ===== Options =====
  statusOptions = [
    'Prospect',
    'Contract Drafting',
    'Contract Signed',
    'Requirement Gathering',
    'Requirement Approval',
    'System Analysis',
    'DFD Design',
    'ER Design',
    'Specification Design',
    'Specification Approval',
    'Planning',
    'Development',
    'Internal Testing',
    'UAT',
    'Bug Fixing',
    'Ready for Delivery',
    'Delivered',
    'Invoicing',
    'Closed',
    'MA Active',
  ];
  priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  // ===== Lifecycle =====
  ngOnInit() {
  // ✅ ใช้ทั้ง queryParams และ Service
  this.route.queryParams.subscribe((params) => {
    let customerId = params['customerId'] || this.customerState.getCustomerId();
    let customerName = params['customerName'] || this.customerState.getCustomerName();

    if (!customerId) {
      this.dialog.warn('กรุณาเลือกลูกค้าก่อน', 'ไม่พบข้อมูลลูกค้า');
      this.router.navigate(['/feature/pm/pmrt01']);
      return;
    }

    // ✅ เก็บไว้ใน Service (เผื่อ refresh)
    this.customerState.setCustomer(customerId, customerName);
    this.filterCustomerId.set(customerId);
    this.filterCustomerName.set(customerName);
    this.loadProjects();
  });
}

  // ===== Load Data =====
  loadProjects() {
    this.isLoading.set(true);
    // ✅ ส่ง page = currentPage() (เริ่มที่ 1) แทน currentPage() - 1
    const page = this.currentPage();

    this.service
      .getProjects({
        customerId: this.filterCustomerId() || undefined,
        keyword: this.searchTerm() || undefined,
        startDate: this.filterStartDate() || undefined,
        endDate: this.filterEndDate() || undefined,
        page: page, // ✅ 1-based
        size: this.pageSize(),
        sortBy: this.sortBy(),
        sortDir: this.sortDir(),
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.projects.set(response.data || []);
          this.totalItems.set(response.pageable?.totalElements || 0);
          if (this.filterCustomerId() && !this.filterCustomerName()) {
            const first = response.data?.[0];
            if (first?.customerName) {
              this.filterCustomerName.set(first.customerName);
            }
          }
        },
        error: (err) => {
          console.error('Load projects error:', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาด');
          this.projects.set([]);
          this.totalItems.set(0);
        },
      });
  }

  // ===== Event Handlers =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadProjects();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadProjects();
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
    this.loadProjects();
  }

  onPriorityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterPriority.set(select.value);
    this.currentPage.set(1);
    this.loadProjects();
  }

  // ✅ Date Filter Handlers
  onStartDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filterStartDate.set(input.value);
    this.currentPage.set(1);
    this.loadProjects();
  }

  onEndDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filterEndDate.set(input.value);
    this.currentPage.set(1);
    this.loadProjects();
  }

  onSortChange(field: string) {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
    this.loadProjects();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadProjects();
  }

  // ===== Navigation =====
  goToAdd() {
    const customerId = this.filterCustomerId();
    if (customerId) {
      this.router.navigate(['/feature/pm/pmrt02/new'], { queryParams: { customerId } });
    } else {
      this.router.navigate(['/feature/pm/pmrt02/new']);
    }
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/pmrt02', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/pmrt03', id]);
  }

  goBackToCustomer() {
    this.router.navigate(['/feature/pm/pmrt01']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Prospect: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'Contract Drafting':
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Contract Signed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Requirement Gathering':
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Requirement Approval':
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'System Analysis': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'DFD Design': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'ER Design': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'Specification Design': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      'Specification Approval': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      Planning: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
      Development: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Internal Testing':
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      UAT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Bug Fixing': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Ready for Delivery': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Invoicing: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      Closed: 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'MA Active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || map['Prospect'];
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      Low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[priority] || map['Low'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Prospect: 'โอกาส',
      'Contract Drafting': 'ร่างสัญญา',
      'Contract Signed': 'เซ็นสัญญา',
      'Requirement Gathering': 'เก็บ Requirement',
      'Requirement Approval': 'อนุมัติ Requirement',
      'System Analysis': 'วิเคราะห์ระบบ',
      'DFD Design': 'ออกแบบ DFD',
      'ER Design': 'ออกแบบ ER',
      'Specification Design': 'ออกแบบ Spec',
      'Specification Approval': 'อนุมัติ Spec',
      Planning: 'วางแผน',
      Development: 'พัฒนา',
      'Internal Testing': 'ทดสอบภายใน',
      UAT: 'ทดสอบ UAT',
      'Bug Fixing': 'แก้ไข Bug',
      'Ready for Delivery': 'พร้อมส่งมอบ',
      Delivered: 'ส่งมอบแล้ว',
      Invoicing: 'ออก Invoice',
      Closed: 'ปิดโครงการ',
      'MA Active': 'อยู่ใน MA',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  getProgress(used: number, budget: number): number {
    if (budget === 0) return 0;
    return Math.min(Math.round((used / budget) * 100), 100);
  }
}
