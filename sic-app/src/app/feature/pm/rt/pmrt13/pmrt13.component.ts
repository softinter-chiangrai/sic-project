import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface Task {
  id: string;
  taskCode: string;
  taskName: string;
  relatedSpec: string;
  relatedSpecName: string;
  projectId: string;
  projectName: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  actualStart?: string;
  actualEnd?: string;
  estimateManday: number;
  actualManday: number;
  status: 'Todo' | 'In Progress' | 'Waiting Review' | 'Waiting Fix' | 'Done' | 'Delayed' | 'Blocked' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dependency?: string;
  dependencyName?: string;
  description: string;
  impactIfDelay?: string;
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    taskCode: 'TASK-001',
    taskName: 'ออกแบบ Table Customer',
    relatedSpec: 'SPEC-001',
    relatedSpecName: 'Customer Management',
    projectId: '1',
    projectName: 'ระบบ CRM',
    assignedTo: 'สมชาย ใจดี',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    actualStart: '2024-01-15',
    actualEnd: '2024-01-22',
    estimateManday: 3,
    actualManday: 4,
    status: 'Done',
    priority: 'High',
    dependency: '',
    dependencyName: '',
    description: 'ออกแบบโครงสร้างตาราง Customer และความสัมพันธ์',
    impactIfDelay: 'กระทบงานพัฒนา API',
    isActive: true,
    createdAt: '2024-01-10 09:00:00',
  },
  {
    id: '2',
    taskCode: 'TASK-002',
    taskName: 'พัฒนา Customer API',
    relatedSpec: 'SPEC-001',
    relatedSpecName: 'Customer Management',
    projectId: '1',
    projectName: 'ระบบ CRM',
    assignedTo: 'สมชาย ใจดี',
    startDate: '2024-01-22',
    endDate: '2024-01-28',
    actualStart: '2024-01-22',
    actualEnd: '',
    estimateManday: 5,
    actualManday: 4,
    status: 'In Progress',
    priority: 'High',
    dependency: 'TASK-001',
    dependencyName: 'ออกแบบ Table Customer',
    description: 'พัฒนา API CRUD สำหรับจัดการข้อมูลลูกค้า',
    impactIfDelay: 'กระทบงาน UI',
    isActive: true,
    createdAt: '2024-01-20 10:00:00',
  },
  {
    id: '3',
    taskCode: 'TASK-003',
    taskName: 'พัฒนา Customer UI',
    relatedSpec: 'SPEC-001',
    relatedSpecName: 'Customer Management',
    projectId: '1',
    projectName: 'ระบบ CRM',
    assignedTo: 'วิชัย พัฒนาชัย',
    startDate: '2024-01-29',
    endDate: '2024-02-05',
    actualStart: '',
    actualEnd: '',
    estimateManday: 4,
    actualManday: 0,
    status: 'Todo',
    priority: 'Medium',
    dependency: 'TASK-002',
    dependencyName: 'พัฒนา Customer API',
    description: 'พัฒนา UI สำหรับจัดการข้อมูลลูกค้า',
    impactIfDelay: 'กระทบการทดสอบ',
    isActive: true,
    createdAt: '2024-01-25 14:00:00',
  },
];

@Component({
  selector: 'app-pmrt13',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt13.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt13Component implements OnInit {
  private router = inject(Router);

  // ===== Developer Info =====
  currentUser = 'สมชาย ใจดี'; // TODO: inject AuthService

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterPriority = signal('all');
  protected filterProject = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('taskCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected tasks = signal<Task[]>(MOCK_TASKS);

  // ===== Computed =====
  protected myTasks = computed(() => {
    return this.tasks().filter((t) => t.assignedTo === this.currentUser);
  });

  protected filteredTasks = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const priority = this.filterPriority();
    const project = this.filterProject();

    let result = this.myTasks();

    if (term) {
      result = result.filter(
        (t) =>
          t.taskCode.toLowerCase().includes(term) ||
          t.taskName.toLowerCase().includes(term) ||
          t.projectName.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((t) => t.status === status);
    }

    if (priority !== 'all') {
      result = result.filter((t) => t.priority === priority);
    }

    if (project !== 'all') {
      result = result.filter((t) => t.projectId === project);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof Task] ?? '';
      const bVal = b[sortField as keyof Task] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedTasks = computed(() => {
    const all = this.filteredTasks();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredTasks().length);
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
  statusOptions = ['Todo', 'In Progress', 'Waiting Review', 'Waiting Fix', 'Done', 'Delayed', 'Blocked', 'Cancelled'];
  priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
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

  goToUpdate(id: string) {
    this.router.navigate(['/feature/pm/my-tasks', id, 'update']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Todo: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Waiting Review': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Waiting Fix': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Delayed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Blocked: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      Cancelled: 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return map[status] || map['Todo'];
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      Low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[priority] || map['Low'];
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      Todo: 'bi-circle',
      'In Progress': 'bi-arrow-repeat',
      'Waiting Review': 'bi-clock-history',
      'Waiting Fix': 'bi-tools',
      Done: 'bi-check2-circle',
      Delayed: 'bi-exclamation-triangle',
      Blocked: 'bi-slash-circle',
      Cancelled: 'bi-x-circle',
    };
    return map[status] || 'bi-circle';
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

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Todo: 'รอเริ่ม',
      'In Progress': 'กำลังทำ',
      'Waiting Review': 'รอ Review',
      'Waiting Fix': 'รอแก้ไข',
      Done: 'เสร็จ',
      Delayed: 'ล่าช้า',
      Blocked: 'ติดปัญหา',
      Cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }
}

export default Pmrt13Component;