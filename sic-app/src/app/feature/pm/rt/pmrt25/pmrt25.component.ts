import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface DocumentVersion {
  id: string;
  documentType: string;
  documentCode: string;
  title: string;
  version: string;
  status: 'Draft' | 'Approved' | 'Active';
  changedBy: string;
  changedDate: string;
  changeSummary: string;
  previousVersion: string;
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_VERSIONS: DocumentVersion[] = [
  {
    id: '1',
    documentType: 'Requirement',
    documentCode: 'REQ-001',
    title: 'ระบบ Login',
    version: 'v1.0',
    status: 'Draft',
    changedBy: 'สมหญิง รักเรียน',
    changedDate: '2024-01-15 09:00:00',
    changeSummary: 'สร้างเอกสาร Requirement ฉบับแรก',
    previousVersion: '-',
    isActive: true,
    createdAt: '2024-01-15 09:00:00',
  },
  {
    id: '2',
    documentType: 'Requirement',
    documentCode: 'REQ-001',
    title: 'ระบบ Login',
    version: 'v1.1',
    status: 'Approved',
    changedBy: 'สมชาย ใจดี',
    changedDate: '2024-01-20 10:30:00',
    changeSummary: 'เพิ่มเงื่อนไขการเข้าสู่ระบบ',
    previousVersion: 'v1.0',
    isActive: true,
    createdAt: '2024-01-20 10:30:00',
  },
  {
    id: '3',
    documentType: 'Specification',
    documentCode: 'SPEC-001',
    title: 'Customer Management',
    version: 'v2.0',
    status: 'Active',
    changedBy: 'วิชัย พัฒนาชัย',
    changedDate: '2024-02-01 14:00:00',
    changeSummary: 'ปรับปรุงตาม Requirement REQ-002',
    previousVersion: 'v1.5',
    isActive: true,
    createdAt: '2024-02-01 14:00:00',
  },
  {
    id: '4',
    documentType: 'ER Diagram',
    documentCode: 'ER-001',
    title: 'ระบบ CRM',
    version: 'v1.0',
    status: 'Draft',
    changedBy: 'มานี มีทรัพย์',
    changedDate: '2024-02-10 08:00:00',
    changeSummary: 'สร้าง ER Diagram ฉบับแรก',
    previousVersion: '-',
    isActive: true,
    createdAt: '2024-02-10 08:00:00',
  },
];

@Component({
  selector: 'app-pmrt25',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt25.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt25Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterType = signal('all');
  protected filterStatus = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('documentCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected versions = signal<DocumentVersion[]>(MOCK_VERSIONS);

  // ===== Computed =====
  protected filteredVersions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const type = this.filterType();
    const status = this.filterStatus();

    let result = this.versions();

    if (term) {
      result = result.filter(
        (v) =>
          v.documentCode.toLowerCase().includes(term) ||
          v.title.toLowerCase().includes(term) ||
          v.changedBy.toLowerCase().includes(term)
      );
    }

    if (type !== 'all') {
      result = result.filter((v) => v.documentType === type);
    }

    if (status !== 'all') {
      result = result.filter((v) => v.status === status);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof DocumentVersion] ?? '';
      const bVal = b[sortField as keyof DocumentVersion] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedVersions = computed(() => {
    const all = this.filteredVersions();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredVersions().length);
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
  documentTypes = [
    'Requirement',
    'DFD',
    'ER Diagram',
    'Specification',
    'Test Case',
    'User Manual',
    'Delivery Document',
    'Contract',
    'Change Request',
  ];
  statusOptions = ['Draft', 'Approved', 'Active'];

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

  onTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterType.set(select.value);
    this.currentPage.set(1);
  }

  onStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
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
    this.router.navigate(['/feature/pm/version/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/version', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/version', id, 'view']);
  }

  goToHistory(code: string) {
    this.router.navigate(['/feature/pm/version/history', code]);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || map['Draft'];
  }

  formatDate(dateStr: string): string {
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

export default Pmrt25Component;