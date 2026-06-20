import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface Specification {
  id: string;
  specCode: string;
  specType: string;
  screenName: string;
  description: string;
  requirementIds: string[];
  requirementCodes: string[];
  erTables: string[];
  uiActions: string[];
  validationRules: string; // ✅ เปลี่ยนจาก string[] เป็น string
  permission: string;
  estimatedManday: number;
  dependency: string;
  status: 'Draft' | 'Review' | 'Approved';
  projectId: string;
  projectName: string;
  version: string;
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_SPECIFICATIONS: Specification[] = [
  {
    id: '1',
    specCode: 'SPEC-001',
    specType: 'UI Specification',
    screenName: 'Customer Management',
    description: 'จัดการข้อมูลลูกค้า สามารถเพิ่ม แก้ไข ลบ ค้นหา',
    requirementIds: ['1', '2'],
    requirementCodes: ['REQ-001', 'REQ-002'],
    erTables: ['customers', 'customer_contacts'],
    uiActions: ['Add', 'Edit', 'Delete', 'Search'],
    validationRules: 'Tax ID ต้อง 13 หลัก, อีเมลต้องถูกต้อง',
    permission: 'Admin, Sales',
    estimatedManday: 3,
    dependency: 'ต้องมี Table customers ก่อน',
    status: 'Approved',
    projectId: '1',
    projectName: 'ระบบ CRM',
    version: 'v1.0',
    isActive: true,
    createdAt: '2024-02-01 09:00:00',
  },
  {
    id: '2',
    specCode: 'SPEC-002',
    specType: 'API Specification',
    screenName: 'Customer API',
    description: 'API สำหรับจัดการข้อมูลลูกค้า (CRUD)',
    requirementIds: ['1'],
    requirementCodes: ['REQ-001'],
    erTables: ['customers'],
    uiActions: [],
    validationRules: 'Token ต้องถูกต้อง',
    permission: 'System',
    estimatedManday: 2,
    dependency: 'ต้องมี Table customers ก่อน',
    status: 'Review',
    projectId: '1',
    projectName: 'ระบบ CRM',
    version: 'v1.0',
    isActive: true,
    createdAt: '2024-02-10 10:30:00',
  },
  {
    id: '3',
    specCode: 'SPEC-003',
    specType: 'Business Rule Specification',
    screenName: 'การอนุมัติ',
    description: 'กำหนดสิทธิ์การอนุมัติเฉพาะหัวหน้าเท่านั้น',
    requirementIds: ['3'],
    requirementCodes: ['REQ-003'],
    erTables: ['users', 'approvals'],
    uiActions: [],
    validationRules: 'ตรวจสอบ Role',
    permission: 'Admin',
    estimatedManday: 1,
    dependency: 'ต้องมีระบบ Role',
    status: 'Draft',
    projectId: '2',
    projectName: 'ระบบ HR',
    version: 'v1.0',
    isActive: true,
    createdAt: '2024-02-20 14:00:00',
  },
];

@Component({
  selector: 'app-pmrt10',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt10.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt10Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterType = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('specCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected specifications = signal<Specification[]>(MOCK_SPECIFICATIONS);

  // ===== Computed =====
  protected filteredSpecs = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const type = this.filterType();

    let result = this.specifications();

    if (term) {
      result = result.filter(
        (s) =>
          s.specCode.toLowerCase().includes(term) ||
          s.screenName.toLowerCase().includes(term) ||
          s.projectName.toLowerCase().includes(term) ||
          s.specType.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((s) => s.status === status);
    }

    if (type !== 'all') {
      result = result.filter((s) => s.specType === type);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof Specification] ?? '';
      const bVal = b[sortField as keyof Specification] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedSpecs = computed(() => {
    const all = this.filteredSpecs();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredSpecs().length);
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
  statusOptions = ['Draft', 'Review', 'Approved'];
  typeOptions = [
    'UI Specification',
    'API Specification',
    'Business Rule Specification',
    'Report Specification',
    'Data Specification',
    'Integration Specification',
    'Permission Specification',
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
    this.router.navigate(['/feature/pm/specification/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/specification', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/specification', id, 'view']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
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

export default Pmrt10Component;