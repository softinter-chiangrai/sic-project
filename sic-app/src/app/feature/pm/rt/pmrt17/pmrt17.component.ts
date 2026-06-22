import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface Bug {
  id: string;
  bugCode: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  foundBy: string;
  assignedTo: string;
  relatedTestCase: string;
  relatedTestCaseName: string;
  relatedTask: string;
  relatedTaskName: string;
  relatedSpec: string;
  relatedSpecName: string;
  foundDate: string;
  fixDueDate: string;
  fixedDate?: string;
  status: 'Open' | 'Fixing' | 'Fixed' | 'Retest' | 'Closed' | 'Reopen';
  projectId: string;
  projectName: string;
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_BUGS: Bug[] = [
  {
    id: '1',
    bugCode: 'BUG-001',
    title: 'Tax ID ซ้ำแล้วไม่แจ้ง Error',
    description: 'กรณีกรอก Tax ID ซ้ำ ระบบไม่แจ้ง Error แต่บันทึกข้อมูลสำเร็จ',
    severity: 'High',
    priority: 'Urgent',
    foundBy: 'สมศักดิ์ รุ่งเรือง',
    assignedTo: 'สมชาย ใจดี',
    relatedTestCase: 'TC-CUS-002',
    relatedTestCaseName: 'กรอก Tax ID ซ้ำ',
    relatedTask: 'TASK-002',
    relatedTaskName: 'พัฒนา Customer API',
    relatedSpec: 'SPEC-001',
    relatedSpecName: 'Customer Management',
    foundDate: '2024-02-20 10:30:00',
    fixDueDate: '2024-02-23',
    fixedDate: '',
    status: 'Fixing',
    projectId: '1',
    projectName: 'ระบบ CRM',
    isActive: true,
    createdAt: '2024-02-20 10:30:00',
  },
  {
    id: '2',
    bugCode: 'BUG-002',
    title: 'หน้า Dashboard ข้อมูลไม่ถูกต้อง',
    description: 'Dashboard แสดงยอดขายผิดพลาด ไม่ตรงกับข้อมูลจริง',
    severity: 'Medium',
    priority: 'High',
    foundBy: 'มานี มีทรัพย์',
    assignedTo: 'วิชัย พัฒนาชัย',
    relatedTestCase: 'TC-DASH-001',
    relatedTestCaseName: 'ตรวจสอบ Dashboard',
    relatedTask: 'TASK-005',
    relatedTaskName: 'พัฒนา Dashboard',
    relatedSpec: 'SPEC-004',
    relatedSpecName: 'Dashboard',
    foundDate: '2024-02-21 09:00:00',
    fixDueDate: '2024-02-25',
    fixedDate: '',
    status: 'Open',
    projectId: '1',
    projectName: 'ระบบ CRM',
    isActive: true,
    createdAt: '2024-02-21 09:00:00',
  },
  {
    id: '3',
    bugCode: 'BUG-003',
    title: 'ระบบ Login ช้า',
    description: 'การ Login ใช้เวลานานกว่า 5 วินาที',
    severity: 'Low',
    priority: 'Medium',
    foundBy: 'สมชาย ใจดี',
    assignedTo: 'สมศักดิ์ รุ่งเรือง',
    relatedTestCase: 'TC-LOG-001',
    relatedTestCaseName: 'เข้าสู่ระบบ',
    relatedTask: 'TASK-003',
    relatedTaskName: 'พัฒนา Login',
    relatedSpec: 'SPEC-002',
    relatedSpecName: 'Login System',
    foundDate: '2024-02-22 08:00:00',
    fixDueDate: '2024-03-01',
    fixedDate: '2024-02-28',
    status: 'Closed',
    projectId: '1',
    projectName: 'ระบบ CRM',
    isActive: true,
    createdAt: '2024-02-22 08:00:00',
  },
];

@Component({
  selector: 'app-pmrt17',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt17.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt17Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterSeverity = signal('all');
  protected filterPriority = signal('all');
  protected filterProject = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('bugCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected bugs = signal<Bug[]>(MOCK_BUGS);

  // ===== Computed =====
  protected filteredBugs = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const severity = this.filterSeverity();
    const priority = this.filterPriority();
    const project = this.filterProject();

    let result = this.bugs();

    if (term) {
      result = result.filter(
        (b) =>
          b.bugCode.toLowerCase().includes(term) ||
          b.title.toLowerCase().includes(term) ||
          b.assignedTo.toLowerCase().includes(term) ||
          b.foundBy.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((b) => b.status === status);
    }

    if (severity !== 'all') {
      result = result.filter((b) => b.severity === severity);
    }

    if (priority !== 'all') {
      result = result.filter((b) => b.priority === priority);
    }

    if (project !== 'all') {
      result = result.filter((b) => b.projectId === project);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof Bug] ?? '';
      const bVal = b[sortField as keyof Bug] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedBugs = computed(() => {
    const all = this.filteredBugs();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredBugs().length);
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
  statusOptions = ['Open', 'Fixing', 'Fixed', 'Retest', 'Closed', 'Reopen'];
  severityOptions = ['Low', 'Medium', 'High', 'Critical'];
  priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
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

  onPriorityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterPriority.set(select.value);
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
    this.router.navigate(['/feature/pm/bug/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/bug', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/bug', id, 'view']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Fixing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Fixed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Retest: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Reopen: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };
    return map[status] || map['Open'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Open: 'เปิด',
      Fixing: 'กำลังแก้ไข',
      Fixed: 'แก้ไขแล้ว',
      Retest: 'รอทดสอบซ้ำ',
      Closed: 'ปิด',
      Reopen: 'เปิดใหม่',
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

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      Low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[priority] || map['Low'];
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

  formatDateTime(dateStr: string): string {
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

export default Pmrt17Component;