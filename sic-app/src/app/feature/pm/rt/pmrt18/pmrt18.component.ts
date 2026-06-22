import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface Delivery {
  id: string;
  deliveryCode: string;
  projectId: string;
  projectName: string;
  customerId: string;
  customerName: string;
  deliveryDate: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Delivered' | 'Rejected';
  checklistPassed: boolean;
  requirementConfirmed: boolean;
  specificationConfirmed: boolean;
  tasksCompleted: boolean;
  testCasesPassed: boolean;
  criticalBugsClosed: boolean;
  userManualReady: boolean;
  releaseNoteReady: boolean;
  pmApproved: boolean;
  attachment?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_DELIVERIES: Delivery[] = [
  {
    id: '1',
    deliveryCode: 'DEL-001',
    projectId: '1',
    projectName: 'ระบบ CRM',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    deliveryDate: '2024-06-30',
    status: 'Approved',
    checklistPassed: true,
    requirementConfirmed: true,
    specificationConfirmed: true,
    tasksCompleted: true,
    testCasesPassed: true,
    criticalBugsClosed: true,
    userManualReady: true,
    releaseNoteReady: true,
    pmApproved: true,
    attachment: 'Delivery_CRM_v1.0.pdf',
    notes: 'ส่งมอบตามข้อกำหนดในสัญญา CT-001',
    isActive: true,
    createdAt: '2024-06-28 09:00:00',
  },
  {
    id: '2',
    deliveryCode: 'DEL-002',
    projectId: '1',
    projectName: 'ระบบ CRM',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    deliveryDate: '2024-07-15',
    status: 'Pending',
    checklistPassed: false,
    requirementConfirmed: true,
    specificationConfirmed: true,
    tasksCompleted: true,
    testCasesPassed: false,
    criticalBugsClosed: false,
    userManualReady: true,
    releaseNoteReady: true,
    pmApproved: false,
    attachment: '',
    notes: 'รอแก้ไข Bug Critical',
    isActive: true,
    createdAt: '2024-07-10 14:00:00',
  },
  {
    id: '3',
    deliveryCode: 'DEL-003',
    projectId: '2',
    projectName: 'ระบบ HR',
    customerId: '2',
    customerName: 'บริษัท ซอฟต์แวร์ จำกัด',
    deliveryDate: '2024-08-31',
    status: 'Draft',
    checklistPassed: false,
    requirementConfirmed: false,
    specificationConfirmed: false,
    tasksCompleted: false,
    testCasesPassed: false,
    criticalBugsClosed: false,
    userManualReady: false,
    releaseNoteReady: false,
    pmApproved: false,
    attachment: '',
    notes: '',
    isActive: true,
    createdAt: '2024-08-15 10:00:00',
  },
];

@Component({
  selector: 'app-pmrt18',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt18.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt18Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterProject = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('deliveryCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected deliveries = signal<Delivery[]>(MOCK_DELIVERIES);

  // ===== Computed =====
  protected filteredDeliveries = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const project = this.filterProject();

    let result = this.deliveries();

    if (term) {
      result = result.filter(
        (d) =>
          d.deliveryCode.toLowerCase().includes(term) ||
          d.projectName.toLowerCase().includes(term) ||
          d.customerName.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((d) => d.status === status);
    }

    if (project !== 'all') {
      result = result.filter((d) => d.projectId === project);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof Delivery] ?? '';
      const bVal = b[sortField as keyof Delivery] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedDeliveries = computed(() => {
    const all = this.filteredDeliveries();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredDeliveries().length);
  protected totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
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
  statusOptions = ['Draft', 'Pending', 'Approved', 'Delivered', 'Rejected'];
  projectOptions = [
    { id: '1', name: 'ระบบ CRM' },
    { id: '2', name: 'ระบบ HR' },
  ];

  // ===== Lifecycle =====
  ngOnInit() {
    // TODO: เรียก API จริง
  }

  // ===== Actions =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
  }

  onProjectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterProject.set(select.value);
    this.currentPage.set(1);
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
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/delivery/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/delivery', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/delivery', id, 'view']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Draft'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      Pending: 'รออนุมัติ',
      Approved: 'อนุมัติ',
      Delivered: 'ส่งมอบแล้ว',
      Rejected: 'ปฏิเสธ',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
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

  getChecklistStatus(passed: boolean): string {
    return passed ? '✅ ผ่าน' : '❌ ยังไม่ผ่าน';
  }

  getChecklistClass(passed: boolean): string {
    return passed
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400';
  }
}

export default Pmrt18Component;