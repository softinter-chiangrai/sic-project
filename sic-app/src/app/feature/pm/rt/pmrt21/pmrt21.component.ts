import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface MATicket {
  id: string;
  ticketNo: string;
  ticketType: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  contractId: string;
  contractNo: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Waiting Customer' | 'Resolved' | 'Closed';
  assignedTo: string;
  sla: string;
  reportedDate: string;
  dueDate: string;
  resolvedDate?: string;
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_TICKETS: MATicket[] = [
  {
    id: '1',
    ticketNo: 'MA-001',
    ticketType: 'Bug Support',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    projectId: '1',
    projectName: 'ระบบ CRM',
    contractId: '2',
    contractNo: 'CT-002',
    title: 'ระบบไม่สามารถส่งอีเมลแจ้งเตือนได้',
    description: 'ลูกค้าแจ้งว่าระบบไม่สามารถส่งอีเมลแจ้งเตือนเมื่อมีงานใหม่',
    severity: 'High',
    status: 'In Progress',
    assignedTo: 'วิชัย พัฒนาชัย',
    sla: '48 ชั่วโมง',
    reportedDate: '2024-03-01 09:00:00',
    dueDate: '2024-03-03 09:00:00',
    resolvedDate: '',
    isActive: true,
    createdAt: '2024-03-01 09:00:00',
  },
  {
    id: '2',
    ticketNo: 'MA-002',
    ticketType: 'User Support',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    projectId: '1',
    projectName: 'ระบบ CRM',
    contractId: '2',
    contractNo: 'CT-002',
    title: 'ผู้ใช้งานลืมรหัสผ่าน',
    description: 'ผู้ใช้ขอรีเซ็ตรหัสผ่าน',
    severity: 'Low',
    status: 'Resolved',
    assignedTo: 'สมชาย ใจดี',
    sla: '24 ชั่วโมง',
    reportedDate: '2024-03-02 10:00:00',
    dueDate: '2024-03-03 10:00:00',
    resolvedDate: '2024-03-02 16:30:00',
    isActive: true,
    createdAt: '2024-03-02 10:00:00',
  },
  {
    id: '3',
    ticketNo: 'MA-003',
    ticketType: 'Change Request',
    customerId: '2',
    customerName: 'บริษัท ซอฟต์แวร์ จำกัด',
    projectId: '2',
    projectName: 'ระบบ HR',
    contractId: '4',
    contractNo: 'CT-004',
    title: 'ขอเพิ่มฟิลด์ในรายงาน',
    description: 'ต้องการเพิ่มฟิลด์ตำแหน่งงานในรายงานพนักงาน',
    severity: 'Medium',
    status: 'Open',
    assignedTo: 'มานี มีทรัพย์',
    sla: '72 ชั่วโมง',
    reportedDate: '2024-03-03 14:00:00',
    dueDate: '2024-03-06 14:00:00',
    resolvedDate: '',
    isActive: true,
    createdAt: '2024-03-03 14:00:00',
  },
];

@Component({
  selector: 'app-pmrt21',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt21.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt21Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterSeverity = signal('all');
  protected filterType = signal('all');
  protected filterProject = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('ticketNo');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected tickets = signal<MATicket[]>(MOCK_TICKETS);

  // ===== Computed =====
  protected filteredTickets = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const severity = this.filterSeverity();
    const type = this.filterType();
    const project = this.filterProject();

    let result = this.tickets();

    if (term) {
      result = result.filter(
        (t) =>
          t.ticketNo.toLowerCase().includes(term) ||
          t.title.toLowerCase().includes(term) ||
          t.customerName.toLowerCase().includes(term) ||
          t.assignedTo.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((t) => t.status === status);
    }

    if (severity !== 'all') {
      result = result.filter((t) => t.severity === severity);
    }

    if (type !== 'all') {
      result = result.filter((t) => t.ticketType === type);
    }

    if (project !== 'all') {
      result = result.filter((t) => t.projectId === project);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof MATicket] ?? '';
      const bVal = b[sortField as keyof MATicket] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedTickets = computed(() => {
    const all = this.filteredTickets();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredTickets().length);
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
  statusOptions = ['Open', 'In Progress', 'Waiting Customer', 'Resolved', 'Closed'];
  severityOptions = ['Low', 'Medium', 'High', 'Critical'];
  ticketTypeOptions = [
    'Bug Support',
    'Data Issue',
    'User Support',
    'Change Request',
    'Performance Issue',
    'Security Issue',
    'Server / Infra Issue',
  ];
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

  onSeverityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterSeverity.set(select.value);
    this.currentPage.set(1);
  }

  onTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterType.set(select.value);
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

  goToAdd() {
    this.router.navigate(['/feature/pm/ma-ticket/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/ma-ticket', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/ma-ticket', id, 'view']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Waiting Customer': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Resolved: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || map['Open'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Open: 'เปิด',
      'In Progress': 'กำลังดำเนินการ',
      'Waiting Customer': 'รอลูกค้า',
      Resolved: 'แก้ไขแล้ว',
      Closed: 'ปิด',
    };
    return map[status] || status;
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      Low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[severity] || map['Low'];
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

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }
}

export default Pmrt21Component;