import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  customerId: string;
  customerName: string;
  contractId: string;
  contractNo: string;
  projectManager: string;
  ba: string;
  sa: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  budgetManday: number;
  usedManday: number;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    projectCode: 'PRJ-001',
    projectName: 'ระบบ CRM',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    contractId: '1',
    contractNo: 'CT-001',
    projectManager: 'สมศักดิ์ รุ่งเรือง',
    ba: 'สมหญิง รักเรียน',
    sa: 'วิชัย พัฒนาชัย',
    startDate: '2024-01-15',
    plannedEndDate: '2024-06-30',
    actualEndDate: '2024-07-15',
    budgetManday: 120,
    usedManday: 135,
    status: 'Development',
    priority: 'High',
    isActive: true,
    createdAt: '2024-01-10 09:00:00',
  },
  {
    id: '2',
    projectCode: 'PRJ-002',
    projectName: 'ระบบ HR',
    customerId: '2',
    customerName: 'บริษัท ซอฟต์แวร์ จำกัด',
    contractId: '3',
    contractNo: 'CT-003',
    projectManager: 'มานี มีทรัพย์',
    ba: 'สมชาย ใจดี',
    sa: 'วิชัย พัฒนาชัย',
    startDate: '2024-03-01',
    plannedEndDate: '2024-08-31',
    actualEndDate: '',
    budgetManday: 80,
    usedManday: 45,
    status: 'Requirement Gathering',
    priority: 'Medium',
    isActive: true,
    createdAt: '2024-02-28 10:00:00',
  },
  {
    id: '3',
    projectCode: 'PRJ-003',
    projectName: 'ระบบสินค้าคงคลัง',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    contractId: '2',
    contractNo: 'CT-002',
    projectManager: 'สมศักดิ์ รุ่งเรือง',
    ba: 'สมหญิง รักเรียน',
    sa: 'วิชัย พัฒนาชัย',
    startDate: '2024-06-01',
    plannedEndDate: '2024-11-30',
    actualEndDate: '',
    budgetManday: 100,
    usedManday: 20,
    status: 'Planning',
    priority: 'Low',
    isActive: true,
    createdAt: '2024-05-20 14:30:00',
  },
];

@Component({
  selector: 'app-pmrt03',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt03.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt03Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterPriority = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('projectCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected projects = signal<Project[]>(MOCK_PROJECTS);

  // ===== Computed =====
  protected filteredProjects = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const priority = this.filterPriority();

    let result = this.projects();

    if (term) {
      result = result.filter(
        (p) =>
          p.projectCode.toLowerCase().includes(term) ||
          p.projectName.toLowerCase().includes(term) ||
          p.customerName.toLowerCase().includes(term) ||
          p.projectManager.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((p) => p.status === status);
    }

    if (priority !== 'all') {
      result = result.filter((p) => p.priority === priority);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof Project] ?? '';
      const bVal = b[sortField as keyof Project] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedProjects = computed(() => {
    const all = this.filteredProjects();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredProjects().length);
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
  statusOptions = [
    'Prospect',
    'Contract Drafting',
    'Contract Signed',
    'Requirement Gathering',
    'Requirement Approval',
    'System Analysis',
    'DFD Design',
    'ER Design',
    'Specification Design',
    'Specification Approval',
    'Planning',
    'Development',
    'Internal Testing',
    'UAT',
    'Bug Fixing',
    'Ready for Delivery',
    'Delivered',
    'Invoicing',
    'Closed',
    'MA Active',
  ];

  priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

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
    this.router.navigate(['/feature/pm/project/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/project', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/project', id, 'view']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Prospect: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'Contract Drafting': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Contract Signed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Requirement Gathering': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Requirement Approval': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'System Analysis': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'DFD Design': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'ER Design': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'Specification Design': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      'Specification Approval': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      Planning: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
      Development: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Internal Testing': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      UAT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Bug Fixing': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Ready for Delivery': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Invoicing: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      Closed: 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'MA Active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || map['Prospect'];
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

  getProgress(used: number, budget: number): number {
    if (budget === 0) return 0;
    return Math.min(Math.round((used / budget) * 100), 100);
  }
}

export default Pmrt03Component;