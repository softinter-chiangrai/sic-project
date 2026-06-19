import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface Contract {
  id: string;
  contractNo: string;
  contractType: string;
  customerId: string;
  customerName: string;
  projectId?: string;
  projectName?: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  paymentTerms: string;
  scopeSummary: string;
  contractFile?: string;
  signStatus: 'Draft' | 'Sent' | 'Signed' | 'Expired';
  renewalStatus: string;
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_CONTRACTS: Contract[] = [
  {
    id: '1',
    contractNo: 'CT-001',
    contractType: 'Development Contract',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    projectId: '1',
    projectName: 'ระบบ CRM',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    contractValue: 500000,
    paymentTerms: 'จ่ายตามงวด 3 งวด',
    scopeSummary: 'พัฒนาระบบ CRM ครบวงจร',
    signStatus: 'Signed',
    renewalStatus: 'ยังไม่ต่อ',
    isActive: true,
    createdAt: '2024-01-01 09:00:00',
  },
  {
    id: '2',
    contractNo: 'CT-002',
    contractType: 'Maintenance Contract',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    projectId: '1',
    projectName: 'ระบบ CRM',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    contractValue: 50000,
    paymentTerms: 'จ่ายรายเดือน',
    scopeSummary: 'ดูแลระบบ CRM หลังส่งมอบ',
    signStatus: 'Draft',
    renewalStatus: 'รอต่อ',
    isActive: false,
    createdAt: '2024-06-15 14:30:00',
  },
  {
    id: '3',
    contractNo: 'CT-003',
    contractType: 'Development Contract',
    customerId: '2',
    customerName: 'บริษัท ซอฟต์แวร์ จำกัด',
    projectId: '2',
    projectName: 'ระบบ HR',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    contractValue: 300000,
    paymentTerms: 'จ่ายตาม Milestone',
    scopeSummary: 'พัฒนาระบบบริหารทรัพยากรบุคคล',
    signStatus: 'Sent',
    renewalStatus: 'ยังไม่ต่อ',
    isActive: true,
    createdAt: '2024-02-28 10:00:00',
  },
];

@Component({
  selector: 'app-pmrt02',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt02.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt02Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterType = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('contractNo');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected contracts = signal<Contract[]>(MOCK_CONTRACTS);

  // ===== Computed =====
  protected filteredContracts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const type = this.filterType();

    let result = this.contracts();

    if (term) {
      result = result.filter(
        (c) =>
          c.contractNo.toLowerCase().includes(term) ||
          c.customerName.toLowerCase().includes(term) ||
          c.contractType.toLowerCase().includes(term),
      );
    }

    if (status === 'active') {
      result = result.filter((c) => c.isActive);
    } else if (status === 'inactive') {
      result = result.filter((c) => !c.isActive);
    }

    if (type !== 'all') {
      result = result.filter((c) => c.contractType === type);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof Contract] ?? '';
      const bVal = b[sortField as keyof Contract] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedContracts = computed(() => {
    const all = this.filteredContracts();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredContracts().length);
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

  // ===== Contract Types (for filter dropdown) =====
  contractTypes = [
    'Development Contract',
    'Maintenance Contract',
    'Change Request Contract',
    'Extension Contract',
    'Support Contract',
  ];

  // ===== Lifecycle =====
  ngOnInit() {
    // TODO: เรียก API จริง
    // this.loadContracts();
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

  onTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterType.set(select.value);
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
    this.router.navigate(['/feature/pm/contract/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/contract', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/contract', id, 'view']);
  }

  // ===== Utility =====
  getStatusClass(isActive: boolean): string {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'ใช้งาน' : 'ไม่ใช้งาน';
  }

  getSignStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Signed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Draft'];
  }

  getSignStatusText(status: string): string {
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      Sent: 'ส่งแล้ว',
      Signed: 'ลงนามแล้ว',
      Expired: 'หมดอายุ',
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value);
  }
}

export default Pmrt02Component;
