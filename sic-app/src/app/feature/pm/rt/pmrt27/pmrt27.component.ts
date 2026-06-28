import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Pmrt28Service } from '../pmrt28/pmrt28.service';
import { Pmrt27AService } from './pmrt27A/pmrt27A.component';

// ===== Interfaces =====
interface RolePermissionSummary {
  roleId: string;
  roleCode: string;
  roleName: string;
  userCount: number;
  isActive: boolean;
  permissions: {
    module: string;
    level: 'Full' | 'View' | 'Edit' | 'Approve' | 'Fix' | 'Create/View' | 'View/UAT' | 'Test' | 'None';
  }[];
}

@Component({
  selector: 'app-pmrt27',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt27.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt27Component implements OnInit {
  private router = inject(Router);
  private roleService = inject(Pmrt28Service);
  private pmrt27AService = inject(Pmrt27AService);

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
  protected roles = signal<RolePermissionSummary[]>([]);

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
    this.loadRoles();
  }

  loadRoles() {
    this.isLoading.set(true);
    const businessId = localStorage.getItem('businessId');
    if (!businessId) {
      this.isLoading.set(false);
      return;
    }
    this.roleService.getRoles(businessId).subscribe({
      next: (data) => {
        const mapped: RolePermissionSummary[] = data.map(r => ({
          roleId: r.id,
          roleCode: r.roleCode,
          roleName: r.roleNameEn,
          userCount: 0, // Placeholder
          isActive: r.isActive,
          permissions: [] // Loaded on demand
        }));
        this.roles.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error loading roles:', err);
      }
    });
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
    const currentExpanded = this.expandedRole();
    if (currentExpanded === roleId) {
      this.expandedRole.set(null);
    } else {
      this.expandedRole.set(roleId);
      const role = this.roles().find(r => r.roleId === roleId);
      if (role && role.permissions.length === 0) {
        this.pmrt27AService.getRolePermissions(roleId).subscribe({
          next: (data) => {
            const updated = this.roles().map(r => {
              if (r.roleId === roleId) {
                return {
                  ...r,
                  permissions: data.modules
                    .filter(m => m.level !== 'None')
                    .map(m => ({
                      module: m.moduleName,
                      level: m.level
                    }))
                };
              }
              return r;
            });
            this.roles.set(updated);
          },
          error: (err) => {
            console.error('Error fetching role permissions summary:', err);
          }
        });
      }
    }
  }

  goToManagePermissions(roleId: string) {
    this.router.navigate(['/feature/pm/pmrt27', roleId]);
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