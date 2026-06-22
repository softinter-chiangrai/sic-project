import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface UserManual {
  id: string;
  manualCode: string;
  manualType: string;
  title: string;
  description: string;
  relatedSpec: string;
  relatedSpecName: string;
  projectId: string;
  projectName: string;
  author: string;
  content: string;
  fileAttachments: string[];
  version: string;
  status: 'Draft' | 'Review' | 'Approved' | 'Published';
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_MANUALS: UserManual[] = [
  {
    id: '1',
    manualCode: 'UM-001',
    manualType: 'User Manual',
    title: 'คู่มือการใช้งานระบบ CRM',
    description: 'คู่มือสำหรับผู้ใช้งานทั่วไป ครอบคลุมการใช้งานทุกฟังก์ชันของระบบ CRM',
    relatedSpec: 'SPEC-001',
    relatedSpecName: 'Customer Management',
    projectId: '1',
    projectName: 'ระบบ CRM',
    author: 'สมหญิง รักเรียน',
    content: 'เนื้อหาคู่มือ...',
    fileAttachments: ['user_manual_crm.pdf'],
    version: 'v1.0',
    status: 'Published',
    isActive: true,
    createdAt: '2024-02-15 09:00:00',
  },
  {
    id: '2',
    manualCode: 'UM-002',
    manualType: 'Admin Manual',
    title: 'คู่มือผู้ดูแลระบบ CRM',
    description: 'คู่มือสำหรับผู้ดูแลระบบ ครอบคลุมการตั้งค่า การจัดการผู้ใช้ และการบำรุงรักษา',
    relatedSpec: 'SPEC-001',
    relatedSpecName: 'Customer Management',
    projectId: '1',
    projectName: 'ระบบ CRM',
    author: 'วิชัย พัฒนาชัย',
    content: 'เนื้อหาคู่มือผู้ดูแลระบบ...',
    fileAttachments: ['admin_manual_crm.pdf'],
    version: 'v1.0',
    status: 'Review',
    isActive: true,
    createdAt: '2024-02-20 10:00:00',
  },
  {
    id: '3',
    manualCode: 'UM-003',
    manualType: 'Installation Manual',
    title: 'คู่มือการติดตั้งระบบ HR',
    description: 'คู่มือการติดตั้งระบบ HR บนเซิร์ฟเวอร์ Ubuntu',
    relatedSpec: 'SPEC-003',
    relatedSpecName: 'ระบบ HR',
    projectId: '2',
    projectName: 'ระบบ HR',
    author: 'สมชาย ใจดี',
    content: 'เนื้อหาคู่มือติดตั้ง...',
    fileAttachments: ['installation_guide.pdf'],
    version: 'v1.0',
    status: 'Draft',
    isActive: true,
    createdAt: '2024-02-25 14:00:00',
  },
];

@Component({
  selector: 'app-pmrt19',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt19.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt19Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterType = signal('all');
  protected filterStatus = signal('all');
  protected filterProject = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('manualCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected manuals = signal<UserManual[]>(MOCK_MANUALS);

  // ===== Computed =====
  protected filteredManuals = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const type = this.filterType();
    const status = this.filterStatus();
    const project = this.filterProject();

    let result = this.manuals();

    if (term) {
      result = result.filter(
        (m) =>
          m.manualCode.toLowerCase().includes(term) ||
          m.title.toLowerCase().includes(term) ||
          m.projectName.toLowerCase().includes(term) ||
          m.author.toLowerCase().includes(term)
      );
    }

    if (type !== 'all') {
      result = result.filter((m) => m.manualType === type);
    }

    if (status !== 'all') {
      result = result.filter((m) => m.status === status);
    }

    if (project !== 'all') {
      result = result.filter((m) => m.projectId === project);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof UserManual] ?? '';
      const bVal = b[sortField as keyof UserManual] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedManuals = computed(() => {
    const all = this.filteredManuals();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredManuals().length);
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
  manualTypes = [
    'User Manual',
    'Admin Manual',
    'Installation Manual',
    'Operation Manual',
    'Troubleshooting Guide',
  ];
  statusOptions = ['Draft', 'Review', 'Approved', 'Published'];
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

  onTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterType.set(select.value);
    this.currentPage.set(1);
  }

  onStatusChange(event: Event) {
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

  goToAdd() {
    this.router.navigate(['/feature/pm/manual/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/manual', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/manual', id, 'view']);
  }

  goToExport(id: string) {
    // TODO: ส่งออก PDF
    console.log('Export manual:', id);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Approved: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || map['Draft'];
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

  getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      pdf: 'bi-filetype-pdf text-red-500',
      doc: 'bi-file-word text-blue-500',
      docx: 'bi-file-word text-blue-500',
      jpg: 'bi-file-image text-green-500',
      jpeg: 'bi-file-image text-green-500',
      png: 'bi-file-image text-green-500',
    };
    return map[ext || ''] || 'bi-file-earmark';
  }
}

export default Pmrt19Component;