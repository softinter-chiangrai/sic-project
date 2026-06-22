import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface RenewalContract {
  id: string;
  contractNo: string;
  contractType: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  renewalStatus: 'ยังไม่ต่อ' | 'รอต่อ' | 'ต่อแล้ว';
  daysRemaining: number;
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_RENEWAL_CONTRACTS: RenewalContract[] = [
  {
    id: '1',
    contractNo: 'CT-002',
    contractType: 'Maintenance Contract',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    projectId: '1',
    projectName: 'ระบบ CRM',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    contractValue: 50000,
    renewalStatus: 'รอต่อ',
    daysRemaining: 30,
    isActive: true,
    createdAt: '2024-06-15 14:30:00',
  },
  {
    id: '2',
    contractNo: 'CT-004',
    contractType: 'Maintenance Contract',
    customerId: '2',
    customerName: 'บริษัท ซอฟต์แวร์ จำกัด',
    projectId: '2',
    projectName: 'ระบบ HR',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    contractValue: 30000,
    renewalStatus: 'ยังไม่ต่อ',
    daysRemaining: 45,
    isActive: true,
    createdAt: '2024-01-15 10:00:00',
  },
  {
    id: '3',
    contractNo: 'CT-005',
    contractType: 'Support Contract',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    projectId: '1',
    projectName: 'ระบบ CRM',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    contractValue: 25000,
    renewalStatus: 'ต่อแล้ว',
    daysRemaining: 10,
    isActive: true,
    createdAt: '2023-12-01 09:00:00',
  },
];

@Component({
  selector: 'app-pmrt22',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt22.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt22Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterProject = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('endDate');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected contracts = signal<RenewalContract[]>(MOCK_RENEWAL_CONTRACTS);

  // ===== Computed =====
  protected filteredContracts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const project = this.filterProject();

    let result = this.contracts();

    if (term) {
      result = result.filter(
        (c) =>
          c.contractNo.toLowerCase().includes(term) ||
          c.customerName.toLowerCase().includes(term) ||
          c.projectName.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((c) => c.renewalStatus === status);
    }

    if (project !== 'all') {
      result = result.filter((c) => c.projectId === project);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof RenewalContract] ?? '';
      const bVal = b[sortField as keyof RenewalContract] ?? '';
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

  // ===== Options =====
  statusOptions = ['ยังไม่ต่อ', 'รอต่อ', 'ต่อแล้ว'];
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

  goToRenew(id: string) {
    this.router.navigate(['/feature/pm/renewal', id]);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/renewal', id, 'view']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'ยังไม่ต่อ': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'รอต่อ': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'ต่อแล้ว': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || map['ยังไม่ต่อ'];
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

  getDaysRemainingClass(days: number): string {
    if (days <= 7) return 'text-red-500 font-bold';
    if (days <= 30) return 'text-orange-500 font-semibold';
    return 'text-emerald-500';
  }
}

export default Pmrt22Component;