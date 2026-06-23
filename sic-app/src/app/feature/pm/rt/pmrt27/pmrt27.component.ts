import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface RolePermissionSummary {
  roleId: string;
  roleCode: string;
  roleName: string;
  userCount: number;
  isActive: boolean;
  permissions: {
    module: string;
    level: 'Full' | 'View' | 'Edit' | 'Approve' | 'Fix' | 'Create/View' | 'None';
  }[];
}

// ===== Mock Data (ตาม Permission Matrix) =====
const MOCK_ROLE_PERMISSIONS: RolePermissionSummary[] = [
  {
    roleId: 'role-001',
    roleCode: 'ADMIN',
    roleName: 'Administrator',
    userCount: 3,
    isActive: true,
    permissions: [
      { module: 'Project', level: 'Full' },
      { module: 'Requirement', level: 'Full' },
      { module: 'DFD', level: 'Full' },
      { module: 'ER', level: 'Full' },
      { module: 'Spec', level: 'Full' },
      { module: 'Plan', level: 'Full' },
      { module: 'Task', level: 'Full' },
      { module: 'Test', level: 'Full' },
      { module: 'Bug', level: 'Full' },
      { module: 'Delivery', level: 'Full' },
      { module: 'Invoice', level: 'Full' },
      { module: 'MA', level: 'Full' },
    ],
  },
  {
    roleId: 'role-002',
    roleCode: 'PM',
    roleName: 'Project Manager',
    userCount: 5,
    isActive: true,
    permissions: [
      { module: 'Project', level: 'Full' },
      { module: 'Requirement', level: 'Approve' },
      { module: 'DFD', level: 'View' },
      { module: 'ER', level: 'View' },
      { module: 'Spec', level: 'Approve' },
      { module: 'Plan', level: 'Full' },
      { module: 'Task', level: 'Full' },
      { module: 'Test', level: 'View' },
      { module: 'Bug', level: 'View' },
      { module: 'Delivery', level: 'Full' },
      { module: 'Invoice', level: 'View' },
      { module: 'MA', level: 'Full' },
    ],
  },
  {
    roleId: 'role-003',
    roleCode: 'DEV',
    roleName: 'Developer',
    userCount: 8,
    isActive: true,
    permissions: [
      { module: 'Project', level: 'View' },
      { module: 'Requirement', level: 'View' },
      { module: 'DFD', level: 'View' },
      { module: 'ER', level: 'View' },
      { module: 'Spec', level: 'View' },
      { module: 'Plan', level: 'View' },
      { module: 'Task', level: 'Edit' },
      { module: 'Test', level: 'View' },
      { module: 'Bug', level: 'Fix' },
      { module: 'Delivery', level: 'View' },
      { module: 'Invoice', level: 'None' },
      { module: 'MA', level: 'Fix' },
    ],
  },
  {
    roleId: 'role-004',
    roleCode: 'QA',
    roleName: 'QA Tester',
    userCount: 4,
    isActive: true,
    permissions: [
      { module: 'Project', level: 'View' },
      { module: 'Requirement', level: 'View' },
      { module: 'DFD', level: 'View' },
      { module: 'ER', level: 'View' },
      { module: 'Spec', level: 'View' },
      { module: 'Plan', level: 'View' },
      { module: 'Task', level: 'View' },
      { module: 'Test', level: 'Full' },
      { module: 'Bug', level: 'Full' },
      { module: 'Delivery', level: 'View' },
      { module: 'Invoice', level: 'None' },
      { module: 'MA', level: 'Full' },
    ],
  },
  {
    roleId: 'role-005',
    roleCode: 'CUSTOMER',
    roleName: 'Customer',
    userCount: 10,
    isActive: true,
    permissions: [
      { module: 'Project', level: 'View' },
      { module: 'Requirement', level: 'Approve' },
      { module: 'DFD', level: 'View' },
      { module: 'ER', level: 'None' },
      { module: 'Spec', level: 'Approve' },
      { module: 'Plan', level: 'View' },
      { module: 'Task', level: 'View' },
      { module: 'Test', level: 'View' },
      { module: 'Bug', level: 'Create/View' },
      { module: 'Delivery', level: 'Approve' },
      { module: 'Invoice', level: 'View' },
      { module: 'MA', level: 'Create/View' },
    ],
  },
  {
    roleId: 'role-006',
    roleCode: 'FINANCE',
    roleName: 'Finance',
    userCount: 2,
    isActive: true,
    permissions: [
      { module: 'Project', level: 'View' },
      { module: 'Requirement', level: 'None' },
      { module: 'DFD', level: 'None' },
      { module: 'ER', level: 'None' },
      { module: 'Spec', level: 'None' },
      { module: 'Plan', level: 'View' },
      { module: 'Task', level: 'View' },
      { module: 'Test', level: 'View' },
      { module: 'Bug', level: 'View' },
      { module: 'Delivery', level: 'View' },
      { module: 'Invoice', level: 'Full' },
      { module: 'MA', level: 'View' },
    ],
  },
];

// ===== Module List (ตาม Permission Matrix) =====
const MODULE_LIST = [
  'Project',
  'Requirement',
  'DFD',
  'ER',
  'Spec',
  'Plan',
  'Task',
  'Test',
  'Bug',
  'Delivery',
  'Invoice',
  'MA',
];

@Component({
  selector: 'app-pmrt27',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt27.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt27Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('roleCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);
  protected expandedRole = signal<string | null>(null);

  // ===== Data =====
  protected roles = signal<RolePermissionSummary[]>(MOCK_ROLE_PERMISSIONS);
  protected modules = MODULE_LIST;

  // ===== Computed =====
  protected filteredRoles = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();

    let result = this.roles();

    if (term) {
      result = result.filter(
        (r) =>
          r.roleCode.toLowerCase().includes(term) ||
          r.roleName.toLowerCase().includes(term)
      );
    }

    if (status === 'active') {
      result = result.filter((r) => r.isActive);
    } else if (status === 'inactive') {
      result = result.filter((r) => !r.isActive);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof RolePermissionSummary] ?? '';
      const bVal = b[sortField as keyof RolePermissionSummary] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedRoles = computed(() => {
    const all = this.filteredRoles();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredRoles().length);
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

  toggleExpand(roleId: string) {
    this.expandedRole.set(this.expandedRole() === roleId ? null : roleId);
  }

  goToManagePermissions(roleId: string) {
  this.router.navigate(['/feature/pm/pmrt27', roleId]); // ✅ ถูกต้อง
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

  getLevelClass(level: string): string {
    const map: Record<string, string> = {
      Full: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Approve: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Edit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Fix: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Create/View': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      View: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'View/UAT': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      Test: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      None: 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500',
    };
    return map[level] || map['None'];
  }

  getLevelText(level: string): string {
    const map: Record<string, string> = {
      Full: 'เต็มรูปแบบ',
      Approve: 'อนุมัติ',
      Edit: 'แก้ไข',
      Fix: 'แก้ไข Bug',
      'Create/View': 'สร้าง/ดู',
      View: 'ดู',
      'View/UAT': 'ดู/UAT',
      Test: 'ทดสอบ',
      None: 'ไม่มีสิทธิ์',
    };
    return map[level] || level;
  }
}

export default Pmrt27Component;