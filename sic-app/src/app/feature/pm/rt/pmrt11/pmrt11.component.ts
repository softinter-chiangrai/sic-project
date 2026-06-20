import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface ReviewComment {
  id: string;
  author: string;
  text: string;
  type: 'Suggestion' | 'Correction' | 'Risk' | 'Question' | 'Approval Note';
  createdAt: string;
}

interface DesignReview {
  id: string;
  reviewCode: string;
  title: string;
  description: string;
  reviewableType: string;
  reviewableId: string;
  reviewableName: string;
  projectId: string;
  projectName: string;
  reviewer: string;
  assignedTo: string;
  severity: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  dueDate: string;
  comments: ReviewComment[];
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_REVIEWS: DesignReview[] = [
  {
    id: '1',
    reviewCode: 'DR-001',
    title: 'Review ER Diagram - Customer Table',
    description: 'ตรวจสอบ ER Diagram ของตาราง Customer',
    reviewableType: 'ER Diagram',
    reviewableId: 'er-1',
    reviewableName: 'ER Diagram v1.0',
    projectId: '1',
    projectName: 'ระบบ CRM',
    reviewer: 'วิชัย พัฒนาชัย',
    assignedTo: 'สมหญิง รักเรียน',
    severity: 'Medium',
    status: 'In Progress',
    dueDate: '2024-02-28',
    comments: [
      {
        id: 'c1',
        author: 'วิชัย พัฒนาชัย',
        text: 'ควรเพิ่มฟิลด์ created_at และ updated_at ในทุกตาราง',
        type: 'Correction',
        createdAt: '2024-02-20 09:00:00',
      },
      {
        id: 'c2',
        author: 'สมหญิง รักเรียน',
        text: 'แก้ไขเพิ่ม created_at, updated_at เรียบร้อยแล้ว',
        type: 'Approval Note',
        createdAt: '2024-02-21 14:00:00',
      },
    ],
    isActive: true,
    createdAt: '2024-02-20 08:00:00',
  },
  {
    id: '2',
    reviewCode: 'DR-002',
    title: 'Review Specification - Customer Management',
    description: 'ตรวจสอบ Specification ของโมดูลจัดการลูกค้า',
    reviewableType: 'Specification',
    reviewableId: 'spec-1',
    reviewableName: 'SPEC-001',
    projectId: '1',
    projectName: 'ระบบ CRM',
    reviewer: 'สมศักดิ์ รุ่งเรือง',
    assignedTo: 'สมชาย ใจดี',
    severity: 'High',
    status: 'Open',
    dueDate: '2024-03-05',
    comments: [
      {
        id: 'c3',
        author: 'สมศักดิ์ รุ่งเรือง',
        text: 'ควรเพิ่ม Validation Rule สำหรับ Tax ID',
        type: 'Suggestion',
        createdAt: '2024-02-22 10:00:00',
      },
    ],
    isActive: true,
    createdAt: '2024-02-22 09:00:00',
  },
  {
    id: '3',
    reviewCode: 'DR-003',
    title: 'Review DFD - ระบบ HR',
    description: 'ตรวจสอบ Data Flow Diagram ของระบบ HR',
    reviewableType: 'DFD',
    reviewableId: 'dfd-1',
    reviewableName: 'DFD Level 0',
    projectId: '2',
    projectName: 'ระบบ HR',
    reviewer: 'วิชัย พัฒนาชัย',
    assignedTo: 'มานี มีทรัพย์',
    severity: 'Low',
    status: 'Resolved',
    dueDate: '2024-02-15',
    comments: [
      {
        id: 'c4',
        author: 'วิชัย พัฒนาชัย',
        text: 'Data Flow ระหว่าง Process 1 และ Process 2 ขาดการเชื่อมต่อ',
        type: 'Correction',
        createdAt: '2024-02-10 13:00:00',
      },
      {
        id: 'c5',
        author: 'มานี มีทรัพย์',
        text: 'แก้ไขการเชื่อมต่อ Data Flow เรียบร้อย',
        type: 'Approval Note',
        createdAt: '2024-02-12 16:00:00',
      },
      {
        id: 'c6',
        author: 'วิชัย พัฒนาชัย',
        text: 'ผ่านการตรวจสอบ',
        type: 'Approval Note',
        createdAt: '2024-02-14 09:00:00',
      },
    ],
    isActive: true,
    createdAt: '2024-02-10 12:00:00',
  },
];

@Component({
  selector: 'app-pmrt11',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt11.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt11Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterType = signal('all');
  protected filterSeverity = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('reviewCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);
  protected expandedReview = signal<string | null>(null);

  // ===== Data =====
  protected reviews = signal<DesignReview[]>(MOCK_REVIEWS);

  // ===== Computed =====
  protected filteredReviews = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const type = this.filterType();
    const severity = this.filterSeverity();

    let result = this.reviews();

    if (term) {
      result = result.filter(
        (r) =>
          r.reviewCode.toLowerCase().includes(term) ||
          r.title.toLowerCase().includes(term) ||
          r.projectName.toLowerCase().includes(term) ||
          r.reviewer.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((r) => r.status === status);
    }

    if (type !== 'all') {
      result = result.filter((r) => r.reviewableType === type);
    }

    if (severity !== 'all') {
      result = result.filter((r) => r.severity === severity);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof DesignReview] ?? '';
      const bVal = b[sortField as keyof DesignReview] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedReviews = computed(() => {
    const all = this.filteredReviews();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredReviews().length);
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
  statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];
  typeOptions = ['Requirement', 'DFD', 'ER Diagram', 'Specification', 'Test Case', 'User Manual'];
  severityOptions = ['Low', 'Medium', 'High'];

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

  onTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterType.set(select.value);
    this.currentPage.set(1);
  }

  onSeverityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterSeverity.set(select.value);
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
    this.expandedReview.set(this.expandedReview() === id ? null : id);
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/design-review/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/design-review', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/design-review', id, 'view']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Open: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[status] || map['Open'];
  }

  getSeverityClass(severity: string): string {
    const map: Record<string, string> = {
      Low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[severity] || map['Low'];
  }

  getCommentTypeClass(type: string): string {
    const map: Record<string, string> = {
      Suggestion: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Correction: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Risk: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Question: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Approval Note': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[type] || map['Suggestion'];
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

export default Pmrt11Component;