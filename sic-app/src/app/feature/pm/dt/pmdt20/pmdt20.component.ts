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
  targetType?: string;
  targetId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
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

import { FormsModule } from '@angular/forms';
import { AuditLogService } from './audit-log.service';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';

@Component({
  selector: 'app-pmdt20',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicComboboxComponent],
  templateUrl: './pmdt20.component.html',
  styleUrls: ['./pmdt20.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt20Component implements OnInit {
  private router = inject(Router);
  private auditLogService = inject(AuditLogService);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterModule = signal('all');
  protected filterStatus = signal('all');
  protected filterUser = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('createdDate');
  protected sortDir = signal<'asc' | 'desc'>('desc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected logs = signal<AuditLog[]>(MOCK_LOGS);

  ngOnInit() {
    this.loadLogs();
  }

  // ===== Server Pagination State =====
  protected totalItems = signal(0);
  protected totalPages = signal(1);

  loadLogs() {
    this.isLoading.set(true);
    this.auditLogService.getLogs({
      searchTerm: this.searchTerm(),
      module: this.filterModule(),
      status: this.filterStatus(),
      username: this.filterUser(),
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy: this.sortBy(),
      sortDir: this.sortDir(),
    }).subscribe({
      next: (res) => {
        if (res && res.content) {
          const mappedLogs: AuditLog[] = res.content.map(item => ({
            id: item.id,
            user: item.userFullname || item.username || 'System',
            action: item.action,
            module: item.module,
            description: item.description,
            targetType: item.targetType,
            targetId: item.targetId,
            oldValue: item.oldValue,
            newValue: item.newValue,
            ipAddress: item.ipAddress || '-',
            userAgent: item.userAgent,
            timestamp: item.createdDate ? item.createdDate : new Date().toISOString(),
            status: String(item.status).toUpperCase() === 'FAILED' ? 'Failed' : 'Success',
            details: item.details,
          }));
          this.logs.set(mappedLogs);
          this.totalItems.set(res.totalElements ?? mappedLogs.length);
          this.totalPages.set(res.totalPages && res.totalPages > 0 ? res.totalPages : 1);
        } else {
          this.logs.set([]);
          this.totalItems.set(0);
          this.totalPages.set(1);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn('Backend AuditLog API unavailable, falling back to mock data:', err);
        this.isLoading.set(false);
        this.totalItems.set(MOCK_LOGS.length);
        this.totalPages.set(Math.ceil(MOCK_LOGS.length / this.pageSize()));
      }
    });
  }

  // Display logs from server response directly
  protected paginatedLogs = computed(() => this.logs());

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
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  });

  protected Math = Math;

  // ===== Options =====
  readonly moduleSelectOptions = [
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
  ].map((m) => ({ value: m, text: m }));

  readonly statusSelectOptions = [
    { value: 'Success', text: 'Success' },
    { value: 'Failed', text: 'Failed' },
  ];

  readonly userSelectOptions = [
    'สมชาย ใจดี',
    'สมหญิง รักเรียน',
    'วิชัย พัฒนาชัย',
    'มานี มีทรัพย์',
    'สมศักดิ์ รุ่งเรือง',
  ].map((u) => ({ value: u, text: u }));

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

  // ===== Actions =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadLogs();
  }

  onModuleChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterModule.set(val || 'all');
    this.currentPage.set(1);
    this.loadLogs();
  }

  onStatusChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.currentPage.set(1);
    this.loadLogs();
  }

  onUserChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterUser.set(val || 'all');
    this.currentPage.set(1);
    this.loadLogs();
  }

  onSortChange(field: string) {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
    this.loadLogs();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadLogs();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadLogs();
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

export default Pmdt20Component;