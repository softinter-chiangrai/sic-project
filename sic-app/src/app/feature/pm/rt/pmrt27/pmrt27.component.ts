// src/app/feature/pm/rt/pmrt27/pmrt27.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { Pmrt28Service } from '../pmrt28/pmrt28.service';
import { Pmrt29Service } from '../pmrt29/pmrt29.service';
import { Pmrt27AService } from './pmrt27A/pmrt27A.component';

// ===== Interfaces =====

export interface ProgramPermissionSummary {
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  level: string;
  isActive: boolean;
}

export interface RolePermissionSummary {
  roleId: string;
  roleCode: string;
  roleName: string;
  userCount: number;
  isActive: boolean;
  permissions: ProgramPermissionSummary[];
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
  private pmrt29Service = inject(Pmrt29Service);
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
  protected isLoadingPermissions = signal(false);

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

  // ===== Lifecycle =====
  ngOnInit() {
    this.loadRolesAndMembers();
  }

  /** ✅ ดึงบทบาท + จำนวนผู้ใช้จริงจาก Backend */
  loadRolesAndMembers() {
    this.isLoading.set(true);
    const businessId = localStorage.getItem('businessId');
    if (!businessId) {
      this.isLoading.set(false);
      return;
    }

    // 1. ดึงบทบาททั้งหมด
    this.roleService.getRoles(businessId).subscribe({
      next: (roles) => {
        // 2. ดึงสมาชิกทั้งหมดเพื่อนับจำนวนผู้ใช้ต่อบทบาท
        this.pmrt29Service.getMembers(businessId, 0, 1000).subscribe({
          next: (page) => {
            const members = page.content || [];
            const userCountMap = new Map<string, number>();

            members.forEach((member) => {
              const roleIds = member.roleIds || [];
              roleIds.forEach((roleId) => {
                userCountMap.set(roleId, (userCountMap.get(roleId) || 0) + 1);
              });
            });

            // ✅ แปลงข้อมูล
            const mapped: RolePermissionSummary[] = roles.map((r) => ({
              roleId: r.id,
              roleCode: r.roleCode,
              roleName: r.roleNameEn,
              userCount: userCountMap.get(r.id) || 0,
              isActive: r.isActive,
              permissions: [], // โหลดเมื่อคลิกขยาย
            }));

            this.roles.set(mapped);
            this.isLoading.set(false);
          },
          error: () => {
            // Fallback: userCount = 0
            const mapped: RolePermissionSummary[] = roles.map((r) => ({
              roleId: r.id,
              roleCode: r.roleCode,
              roleName: r.roleNameEn,
              userCount: 0,
              isActive: r.isActive,
              permissions: [],
            }));
            this.roles.set(mapped);
            this.isLoading.set(false);
          },
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error loading roles:', err);
      },
    });
  }

  // ===== Actions =====

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchTerm.set('');
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

  /** ✅ ขยาย/ยุบ และโหลดข้อมูลสิทธิ์จาก API */
  toggleExpand(roleId: string) {
    const currentExpanded = this.expandedRole();
    if (currentExpanded === roleId) {
      this.expandedRole.set(null);
      return;
    }

    this.expandedRole.set(roleId);

    const role = this.roles().find((r) => r.roleId === roleId);
    if (role && role.permissions.length > 0) {
      return; // มีข้อมูลแล้ว
    }

    // ✅ โหลดข้อมูลสิทธิ์
    this.isLoadingPermissions.set(true);
    this.pmrt27AService
      .getRolePermissions(roleId)
      .pipe(finalize(() => this.isLoadingPermissions.set(false)))
      .subscribe({
        next: (data) => {
          console.log('📦 Raw data from API:', data);

          // ✅ แปลงข้อมูล
          const permissions: ProgramPermissionSummary[] = data.modules.map((m) => ({
            moduleId: m.moduleId,
            moduleCode: m.moduleCode,
            moduleName: m.moduleName, // ✅ ใช้ moduleName ที่ได้จาก API
            level: m.level,
            isActive: m.level !== 'None',
          }));

          console.log('✅ Converted permissions:', permissions);

          // ✅ อัปเดต roles
          const updated = this.roles().map((r) => {
            if (r.roleId === roleId) {
              return { ...r, permissions };
            }
            return r;
          });
          this.roles.set(updated);
        },
        error: (err) => {
          console.error('❌ Error fetching role permissions:', err);
        },
      });
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
      Edit: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Approve: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      View: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      None: 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500',
    };
    return map[level] || map['None'];
  }

  getLevelText(level: string): string {
    const map: Record<string, string> = {
      Full: 'เต็มรูปแบบ',
      Edit: 'แก้ไข/เพิ่ม',
      Approve: 'อนุมัติ',
      View: 'ดูอย่างเดียว',
      None: 'ไม่มีสิทธิ์',
    };
    return map[level] || level;
  }

  hasActivePrograms(permissions: ProgramPermissionSummary[]): boolean {
    return permissions.some((p) => p.isActive);
  }

  countActivePrograms(permissions: ProgramPermissionSummary[]): number {
    return permissions.filter((p) => p.isActive).length;
  }
}

export default Pmrt27Component;