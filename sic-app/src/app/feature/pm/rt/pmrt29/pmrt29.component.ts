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
interface TeamMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  roles: string[];
  roleNames: string[];
  isActive: boolean;
  isDefault: boolean;
  joinedAt: string;
}

// ===== Mock Data =====
const MOCK_MEMBERS: TeamMember[] = [
  {
    id: 'ub-001',
    userId: 'user-001',
    userName: 'สมชาย ใจดี',
    userEmail: 'somchai@example.com',
    roles: ['role-001', 'role-002'],
    roleNames: ['Administrator', 'Project Manager'],
    isActive: true,
    isDefault: true,
    joinedAt: '2024-01-15 09:00:00',
  },
  {
    id: 'ub-002',
    userId: 'user-002',
    userName: 'สมหญิง รักเรียน',
    userEmail: 'somying@example.com',
    roles: ['role-003'],
    roleNames: ['Developer'],
    isActive: true,
    isDefault: false,
    joinedAt: '2024-01-20 10:30:00',
  },
  {
    id: 'ub-003',
    userId: 'user-003',
    userName: 'วิชัย พัฒนาชัย',
    userEmail: 'vichai@example.com',
    roles: ['role-003', 'role-004'],
    roleNames: ['Developer', 'QA Tester'],
    isActive: false,
    isDefault: false,
    joinedAt: '2024-02-01 14:00:00',
  },
];

@Component({
  selector: 'app-pmrt29',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt29.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt29Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterRole = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('userName');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected members = signal<TeamMember[]>(MOCK_MEMBERS);

  // ===== Available Roles for Filter =====
  protected roleOptions = ['Administrator', 'Project Manager', 'Developer', 'QA Tester'];

  // ===== Computed =====
  protected filteredMembers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const role = this.filterRole();

    let result = this.members();

    if (term) {
      result = result.filter(
        (m) =>
          m.userName.toLowerCase().includes(term) ||
          m.userEmail.toLowerCase().includes(term) ||
          m.roleNames.some((r) => r.toLowerCase().includes(term)),
      );
    }

    if (status === 'active') {
      result = result.filter((m) => m.isActive);
    } else if (status === 'inactive') {
      result = result.filter((m) => !m.isActive);
    }

    if (role !== 'all') {
      result = result.filter((m) => m.roleNames.includes(role));
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof TeamMember] ?? '';
      const bVal = b[sortField as keyof TeamMember] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedMembers = computed(() => {
    const all = this.filteredMembers();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredMembers().length);
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

  onRoleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterRole.set(select.value);
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
    this.router.navigate(['/feature/pm/pmrt29/add']);
  }

  goToEdit(memberId: string) {
    this.router.navigate(['/feature/pm/pmrt29', memberId, 'edit']);
  }

  goToManageRoles(userId: string) {
    this.router.navigate(['/feature/pm/role-assign', userId]);
  }

  goToManagePermissions(userId: string) {
    this.router.navigate(['/feature/pm/permission', userId]);
  }

  toggleActive(member: TeamMember) {
    const updated = { ...member, isActive: !member.isActive };
    this.members.update((list) => list.map((m) => (m.id === member.id ? updated : m)));
  }

  removeMember(id: string) {
    if (confirm('คุณต้องการลบสมาชิกรายนี้ออกจากทีมใช่หรือไม่?')) {
      this.members.update((list) => list.filter((m) => m.id !== id));
    }
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

export default Pmrt29Component;
