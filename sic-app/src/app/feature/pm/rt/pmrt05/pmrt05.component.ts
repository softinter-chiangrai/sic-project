import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface Requirement {
  id: string;
  requirementCode: string;
  title: string;
  description: string;
  requirementType: string;
  source: string;
  priority: 'Must' | 'Should' | 'Could' | "Won't";
  businessValue: string;
  acceptanceCriteria: string;
  projectId: string;
  projectName: string;
  createdBy: string;
  baConfirmStatus: 'Pending' | 'Confirmed' | 'Rejected';
  customerConfirmStatus: 'Pending' | 'Confirmed' | 'Rejected';
  version: string;
  status: 'Draft' | 'In Review' | 'Approved' | 'Changed' | 'Cancelled';
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_REQUIREMENTS: Requirement[] = [
  {
    id: '1',
    requirementCode: 'REQ-001',
    title: 'ระบบ Login',
    description: 'ผู้ใช้สามารถเข้าสู่ระบบด้วย Username และ Password',
    requirementType: 'Functional Requirement',
    source: 'ลูกค้า',
    priority: 'Must',
    businessValue: 'สูง',
    acceptanceCriteria: 'ผู้ใช้กรอก Username/Password ถูกต้องแล้วเข้าสู่ระบบได้',
    projectId: '1',
    projectName: 'ระบบ CRM',
    createdBy: 'สมหญิง รักเรียน',
    baConfirmStatus: 'Confirmed',
    customerConfirmStatus: 'Confirmed',
    version: 'v1.0',
    status: 'Approved',
    isActive: true,
    createdAt: '2024-01-15 09:00:00',
  },
  {
    id: '2',
    requirementCode: 'REQ-002',
    title: 'จัดการข้อมูลลูกค้า',
    description: 'เพิ่ม/แก้ไข/ลบ/ค้นหา ข้อมูลลูกค้า',
    requirementType: 'Functional Requirement',
    source: 'BA',
    priority: 'Must',
    businessValue: 'สูง',
    acceptanceCriteria: 'สามารถ CRUD ข้อมูลลูกค้าได้',
    projectId: '1',
    projectName: 'ระบบ CRM',
    createdBy: 'สมชาย ใจดี',
    baConfirmStatus: 'Confirmed',
    customerConfirmStatus: 'Pending',
    version: 'v1.0',
    status: 'In Review',
    isActive: true,
    createdAt: '2024-01-20 10:30:00',
  },
  {
    id: '3',
    requirementCode: 'REQ-003',
    title: 'ระบบรองรับผู้ใช้ 1,000 คน',
    description: 'ระบบต้องรองรับผู้ใช้พร้อมกัน 1,000 คน',
    requirementType: 'Non-Functional Requirement',
    source: 'เอกสาร',
    priority: 'Should',
    businessValue: 'ปานกลาง',
    acceptanceCriteria: 'ทดสอบ Load Test ที่ 1,000 Concurrent Users',
    projectId: '2',
    projectName: 'ระบบ HR',
    createdBy: 'วิชัย พัฒนาชัย',
    baConfirmStatus: 'Pending',
    customerConfirmStatus: 'Pending',
    version: 'v1.0',
    status: 'Draft',
    isActive: true,
    createdAt: '2024-02-01 14:00:00',
  },
];

@Component({
  selector: 'app-pmrt05',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt05.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt05Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterType = signal('all');
  protected filterPriority = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('requirementCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected requirements = signal<Requirement[]>(MOCK_REQUIREMENTS);

  // ===== Computed =====
  protected filteredRequirements = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const type = this.filterType();
    const priority = this.filterPriority();

    let result = this.requirements();

    if (term) {
      result = result.filter(
        (r) =>
          r.requirementCode.toLowerCase().includes(term) ||
          r.title.toLowerCase().includes(term) ||
          r.projectName.toLowerCase().includes(term) ||
          r.createdBy.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((r) => r.status === status);
    }

    if (type !== 'all') {
      result = result.filter((r) => r.requirementType === type);
    }

    if (priority !== 'all') {
      result = result.filter((r) => r.priority === priority);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof Requirement] ?? '';
      const bVal = b[sortField as keyof Requirement] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedRequirements = computed(() => {
    const all = this.filteredRequirements();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredRequirements().length);
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
  statusOptions = ['Draft', 'In Review', 'Approved', 'Changed', 'Cancelled'];
  typeOptions = [
    'Functional Requirement',
    'Non-Functional Requirement',
    'Business Rule',
    'Report Requirement',
    'Integration Requirement',
    'Security Requirement',
    'Data Requirement',
    'UI Requirement',
  ];
  priorityOptions = ['Must', 'Should', 'Could', "Won't"];

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
    this.router.navigate(['/feature/pm/requirement/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/requirement', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/requirement', id, 'view']);
  }

  goToApproval(id: string) {
    this.router.navigate(['/feature/pm/requirement', id, 'approval']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'In Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Changed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Draft'];
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      Must: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Should: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Could: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      "Won't": 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[priority] || map["Won't"];
  }

  getConfirmStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Pending'];
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

export default Pmrt05Component;