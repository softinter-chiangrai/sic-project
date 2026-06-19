import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface Phase {
  id: string;
  phaseCode: string;
  phaseName: string;
  projectId: string;
  projectName: string;
  description: string;
  startDate: string;
  endDate: string;
  owner: string;
  status: 'Not Started' | 'In Progress' | 'Done' | 'Delayed';
  dependency?: string;
  progress: number;
  isActive: boolean;
  createdAt: string;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  milestoneName: string;
  dueDate: string;
  status: string;
  progress: number;
}

// ===== Mock Data =====
const MOCK_PHASES: Phase[] = [
  {
    id: '1',
    phaseCode: 'PH-001',
    phaseName: 'Requirement & Analysis',
    projectId: '1',
    projectName: 'ระบบ CRM',
    description: 'เก็บความต้องการและวิเคราะห์ระบบ',
    startDate: '2024-01-15',
    endDate: '2024-02-28',
    owner: 'สมหญิง รักเรียน',
    status: 'Done',
    dependency: '',
    progress: 100,
    isActive: true,
    createdAt: '2024-01-10 09:00:00',
    milestones: [
      { id: '1-1', milestoneName: 'เก็บ Requirement เสร็จ', dueDate: '2024-02-01', status: 'Done', progress: 100 },
      { id: '1-2', milestoneName: 'BA Confirm Requirement', dueDate: '2024-02-15', status: 'Done', progress: 100 },
      { id: '1-3', milestoneName: 'Customer Confirm Requirement', dueDate: '2024-02-28', status: 'Done', progress: 100 },
    ],
  },
  {
    id: '2',
    phaseCode: 'PH-002',
    phaseName: 'Design',
    projectId: '1',
    projectName: 'ระบบ CRM',
    description: 'ออกแบบ DFD, ER Diagram และ Specification',
    startDate: '2024-03-01',
    endDate: '2024-04-15',
    owner: 'วิชัย พัฒนาชัย',
    status: 'In Progress',
    dependency: 'PH-001',
    progress: 60,
    isActive: true,
    createdAt: '2024-02-20 10:00:00',
    milestones: [
      { id: '2-1', milestoneName: 'DFD Design', dueDate: '2024-03-20', status: 'Done', progress: 100 },
      { id: '2-2', milestoneName: 'ER Design', dueDate: '2024-04-01', status: 'In Progress', progress: 70 },
      { id: '2-3', milestoneName: 'Specification', dueDate: '2024-04-15', status: 'Not Started', progress: 0 },
    ],
  },
  {
    id: '3',
    phaseCode: 'PH-003',
    phaseName: 'Development',
    projectId: '2',
    projectName: 'ระบบ HR',
    description: 'พัฒนาระบบตาม Specification',
    startDate: '2024-04-01',
    endDate: '2024-07-31',
    owner: 'สมศักดิ์ รุ่งเรือง',
    status: 'Not Started',
    dependency: 'PH-002',
    progress: 0,
    isActive: true,
    createdAt: '2024-03-15 14:30:00',
    milestones: [],
  },
];

@Component({
  selector: 'app-pmrt04',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt04.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt04Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterProject = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('phaseCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);
  protected expandedPhase = signal<string | null>(null);

  // ===== Data =====
  protected phases = signal<Phase[]>(MOCK_PHASES);

  // ===== Computed =====
  protected filteredPhases = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const project = this.filterProject();

    let result = this.phases();

    if (term) {
      result = result.filter(
        (p) =>
          p.phaseCode.toLowerCase().includes(term) ||
          p.phaseName.toLowerCase().includes(term) ||
          p.projectName.toLowerCase().includes(term) ||
          p.owner.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((p) => p.status === status);
    }

    if (project !== 'all') {
      result = result.filter((p) => p.projectId === project);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof Phase] ?? '';
      const bVal = b[sortField as keyof Phase] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedPhases = computed(() => {
    const all = this.filteredPhases();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredPhases().length);
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
  statusOptions = ['Not Started', 'In Progress', 'Done', 'Delayed'];
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

  toggleExpand(id: string) {
    this.expandedPhase.set(this.expandedPhase() === id ? null : id);
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/phase/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/phase', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/phase', id, 'view']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Not Started': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Delayed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Not Started'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      'Not Started': 'ยังไม่เริ่ม',
      'In Progress': 'กำลังดำเนินการ',
      Done: 'เสร็จสิ้น',
      Delayed: 'ล่าช้า',
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

  getMilestoneStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Not Started': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Delayed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Not Started'];
  }
}

export default Pmrt04Component;