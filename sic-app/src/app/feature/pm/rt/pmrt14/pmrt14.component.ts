import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface Task {
  id: string;
  taskCode: string;
  taskName: string;
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
  isActive: boolean;
}

// ===== Mock Data =====
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    taskCode: 'TASK-001',
    taskName: 'ออกแบบ Table Customer',
    projectId: '1',
    projectName: 'ระบบ CRM',
    assignedTo: 'สมหญิง รักเรียน',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    estimateManday: 3,
    actualManday: 4,
    status: 'Done',
    priority: 'High',
    dependency: '',
    dependencyName: '',
    isActive: true,
  },
  {
    id: '2',
    taskCode: 'TASK-002',
    taskName: 'พัฒนา Customer API',
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
    isActive: true,
  },
  {
    id: '3',
    taskCode: 'TASK-003',
    taskName: 'พัฒนา Customer UI',
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
    isActive: true,
  },
  {
    id: '4',
    taskCode: 'TASK-004',
    taskName: 'ออกแบบ ER Diagram ระบบ HR',
    projectId: '2',
    projectName: 'ระบบ HR',
    assignedTo: 'มานี มีทรัพย์',
    startDate: '2024-02-01',
    endDate: '2024-02-07',
    actualStart: '2024-02-01',
    actualEnd: '',
    estimateManday: 4,
    actualManday: 2,
    status: 'Delayed',
    priority: 'Critical',
    dependency: '',
    dependencyName: '',
    isActive: true,
  },
  {
    id: '5',
    taskCode: 'TASK-005',
    taskName: 'ทดสอบระบบ Login',
    projectId: '1',
    projectName: 'ระบบ CRM',
    assignedTo: 'สมศักดิ์ รุ่งเรือง',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    actualStart: '',
    actualEnd: '',
    estimateManday: 2,
    actualManday: 0,
    status: 'Blocked',
    priority: 'High',
    dependency: 'TASK-002',
    dependencyName: 'พัฒนา Customer API',
    isActive: true,
  },
];

@Component({
  selector: 'app-pmrt14',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt14.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt14Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterProject = signal('all');
  protected filterStatus = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected isLoading = signal(false);

  // ===== Data =====
  protected tasks = signal<Task[]>(MOCK_TASKS);

  // ===== Computed =====
  protected filteredTasks = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const project = this.filterProject();
    const status = this.filterStatus();

    let result = this.tasks();

    if (term) {
      result = result.filter(
        (t) =>
          t.taskCode.toLowerCase().includes(term) ||
          t.taskName.toLowerCase().includes(term) ||
          t.projectName.toLowerCase().includes(term) ||
          t.assignedTo.toLowerCase().includes(term)
      );
    }

    if (project !== 'all') {
      result = result.filter((t) => t.projectId === project);
    }

    if (status !== 'all') {
      result = result.filter((t) => t.status === status);
    }

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

  // ===== Date Range for Gantt =====
  protected dateRange = computed(() => {
    const tasks = this.filteredTasks();
    if (tasks.length === 0) return { min: new Date(), max: new Date() };

    let minDate = new Date(tasks[0].startDate);
    let maxDate = new Date(tasks[0].endDate);

    tasks.forEach((t) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      if (start < minDate) minDate = start;
      if (end > maxDate) maxDate = end;
    });

    // เพิ่ม buffer 2 วัน
    minDate.setDate(minDate.getDate() - 2);
    maxDate.setDate(maxDate.getDate() + 2);

    return { min: minDate, max: maxDate };
  });

  protected getDaysBetween = computed(() => {
    const range = this.dateRange();
    const diff = range.max.getTime() - range.min.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  protected Math = Math;

  // ===== Options =====
  projectOptions = [
    { id: '1', name: 'ระบบ CRM' },
    { id: '2', name: 'ระบบ HR' },
  ];
  statusOptions = ['Todo', 'In Progress', 'Waiting Review', 'Waiting Fix', 'Done', 'Delayed', 'Blocked', 'Cancelled'];

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

  onProjectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterProject.set(select.value);
    this.currentPage.set(1);
  }

  onStatusChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
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
    this.router.navigate(['/feature/pm/gantt', id, 'update']);
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

  // ===== Gantt Helper =====
  getBarPosition(task: Task): { left: number; width: number } {
    const range = this.dateRange();
    const totalDays = range.max.getTime() - range.min.getTime();
    if (totalDays === 0) return { left: 0, width: 100 };

    const start = new Date(task.startDate);
    const end = new Date(task.endDate);

    const left = ((start.getTime() - range.min.getTime()) / totalDays) * 100;
    const width = ((end.getTime() - start.getTime()) / totalDays) * 100;

    return {
      left: Math.max(0, Math.min(left, 100)),
      width: Math.max(1, Math.min(width, 100)),
    };
  }

  getBarColor(status: string): string {
    const map: Record<string, string> = {
      Todo: 'var(--crm-secondary)',
      'In Progress': 'var(--crm-primary)',
      'Waiting Review': 'var(--crm-warning)',
      'Waiting Fix': 'var(--crm-warning)',
      Done: 'var(--crm-success)',
      Delayed: 'var(--crm-danger)',
      Blocked: 'var(--crm-danger)',
      Cancelled: 'var(--text-muted)',
    };
    return map[status] || 'var(--crm-secondary)';
  }
}

export default Pmrt14Component;