import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  description: string;
  ipAddress?: string;
  timestamp: string;
  status: 'Success' | 'Failed';
  details?: string;
}

// ===== Mock Data =====
const MOCK_LOGS: AuditLog[] = [
  {
    id: '1',
    user: 'สมชาย ใจดี',
    action: 'เข้าสู่ระบบ',
    module: 'Authentication',
    description: 'ผู้ใช้ login ด้วย Username: somchai',
    ipAddress: '192.168.1.100',
    timestamp: '2024-02-20 09:00:00',
    status: 'Success',
  },
  {
    id: '2',
    user: 'สมหญิง รักเรียน',
    action: 'อัปเดต Requirement',
    module: 'Requirement Management',
    description: 'แก้ไข Requirement REQ-002 (จัดการข้อมูลลูกค้า)',
    ipAddress: '192.168.1.101',
    timestamp: '2024-02-20 10:30:00',
    status: 'Success',
  },
  {
    id: '3',
    user: 'วิชัย พัฒนาชัย',
    action: 'สร้าง Bug',
    module: 'Bug Management',
    description: 'แจ้ง Bug BUG-003 (Tax ID ซ้ำ)',
    ipAddress: '192.168.1.102',
    timestamp: '2024-02-20 14:00:00',
    status: 'Success',
  },
  {
    id: '4',
    user: 'มานี มีทรัพย์',
    action: 'ลบ Project',
    module: 'Project Management',
    description: 'พยายามลบ Project PRJ-002 (ระบบ HR)',
    ipAddress: '192.168.1.103',
    timestamp: '2024-02-20 16:45:00',
    status: 'Failed',
  },
  {
    id: '5',
    user: 'สมศักดิ์ รุ่งเรือง',
    action: 'ส่งออกเอกสาร',
    module: 'Delivery Management',
    description: 'ส่งออก Delivery Document DEL-001',
    ipAddress: '192.168.1.104',
    timestamp: '2024-02-21 09:30:00',
    status: 'Success',
  },
];

@Component({
  selector: 'app-pmrt26',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt26.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt26Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterModule = signal('all');
  protected filterStatus = signal('all');
  protected filterUser = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('timestamp');
  protected sortDir = signal<'asc' | 'desc'>('desc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected logs = signal<AuditLog[]>(MOCK_LOGS);

  // ===== Computed =====
  protected filteredLogs = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const module = this.filterModule();
    const status = this.filterStatus();
    const user = this.filterUser();

    let result = this.logs();

    if (term) {
      result = result.filter(
        (log) =>
          log.user.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term) ||
          log.description.toLowerCase().includes(term) ||
          log.module.toLowerCase().includes(term)
      );
    }

    if (module !== 'all') {
      result = result.filter((log) => log.module === module);
    }

    if (status !== 'all') {
      result = result.filter((log) => log.status === status);
    }

    if (user !== 'all') {
      result = result.filter((log) => log.user === user);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof AuditLog] ?? '';
      const bVal = b[sortField as keyof AuditLog] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedLogs = computed(() => {
    const all = this.filteredLogs();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredLogs().length);
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
  moduleOptions = [
    'Authentication',
    'Customer Management',
    'Contract Management',
    'Project Management',
    'Requirement Management',
    'Change Control',
    'DFD Designer',
    'ER Designer',
    'Specification Management',
    'Design Review',
    'Planning & Task',
    'Task Tracking',
    'Test Management',
    'Bug Management',
    'Delivery Management',
    'User Manual',
    'Invoice & Payment',
    'MA Support Ticket',
    'Renewal / Extension',
    'Approval Center',
    'Dashboard & Report',
    'Document Version Control',
    'Audit Log',
    'User Management',
  ];
  statusOptions = ['Success', 'Failed'];
  userOptions = ['สมชาย ใจดี', 'สมหญิง รักเรียน', 'วิชัย พัฒนาชัย', 'มานี มีทรัพย์', 'สมศักดิ์ รุ่งเรือง'];

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

  onModuleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterModule.set(select.value);
    this.currentPage.set(1);
  }

  onStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
  }

  onUserChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterUser.set(select.value);
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

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Success'];
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

  goToDetail(id: string) {
    // Audit Log ไม่มีหน้า Detail (ดูอย่างเดียว)
    // อาจแสดง Dialog หรือไม่ก็ได้
  }
}

export default Pmrt26Component;