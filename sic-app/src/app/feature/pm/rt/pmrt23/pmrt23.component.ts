import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface ApprovalItem {
  id: string;
  documentType: string;
  documentCode: string;
  title: string;
  projectId: string;
  projectName: string;
  requester: string;
  requestedDate: string;
  dueDate?: string;
  approver: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Need Revision' | 'Cancelled';
  comment?: string;
  attachments?: string[];
  isActive: boolean;
}

// ===== Mock Data =====
const MOCK_APPROVALS: ApprovalItem[] = [
  {
    id: '1',
    documentType: 'Requirement',
    documentCode: 'REQ-002',
    title: 'จัดการข้อมูลลูกค้า',
    projectId: '1',
    projectName: 'ระบบ CRM',
    requester: 'สมหญิง รักเรียน',
    requestedDate: '2024-02-20 10:30:00',
    dueDate: '2024-02-27',
    approver: 'BA, Customer',
    status: 'Pending',
    comment: '',
    attachments: [],
    isActive: true,
  },
  {
    id: '2',
    documentType: 'Specification',
    documentCode: 'SPEC-001',
    title: 'Customer Management Specification',
    projectId: '1',
    projectName: 'ระบบ CRM',
    requester: 'สมชาย ใจดี',
    requestedDate: '2024-02-22 09:00:00',
    dueDate: '2024-03-01',
    approver: 'Head, Customer',
    status: 'Pending',
    comment: '',
    attachments: ['SPEC-001_v1.0.pdf'],
    isActive: true,
  },
  {
    id: '3',
    documentType: 'Delivery',
    documentCode: 'DEL-001',
    title: 'ส่งมอบระบบ CRM Phase 1',
    projectId: '1',
    projectName: 'ระบบ CRM',
    requester: 'สมศักดิ์ รุ่งเรือง',
    requestedDate: '2024-03-01 14:00:00',
    dueDate: '2024-03-08',
    approver: 'PM, Customer',
    status: 'Pending',
    comment: '',
    attachments: [],
    isActive: true,
  },
  {
    id: '4',
    documentType: 'Invoice',
    documentCode: 'INV-002',
    title: 'งวดที่ 2 (ส่งมอบ)',
    projectId: '1',
    projectName: 'ระบบ CRM',
    requester: 'มานี มีทรัพย์',
    requestedDate: '2024-03-01 10:00:00',
    dueDate: '2024-03-15',
    approver: 'Finance, PM',
    status: 'Pending',
    comment: '',
    attachments: ['invoice_002.pdf'],
    isActive: true,
  },
  {
    id: '5',
    documentType: 'Requirement',
    documentCode: 'REQ-003',
    title: 'ระบบรองรับผู้ใช้ 1,000 คน',
    projectId: '2',
    projectName: 'ระบบ HR',
    requester: 'วิชัย พัฒนาชัย',
    requestedDate: '2024-02-01 14:00:00',
    dueDate: '',
    approver: 'BA, Customer',
    status: 'Approved',
    comment: 'อนุมัติแล้ว',
    attachments: [],
    isActive: true,
  },
  {
    id: '6',
    documentType: 'Change Request',
    documentCode: 'CR-001',
    title: 'เพิ่มฟิลด์เบอร์โทรในหน้าลูกค้า',
    projectId: '1',
    projectName: 'ระบบ CRM',
    requester: 'สมชาย ใจดี',
    requestedDate: '2024-02-01 10:00:00',
    dueDate: '',
    approver: 'PM, Customer',
    status: 'Rejected',
    comment: 'ไม่จำเป็นใน Phase นี้',
    attachments: [],
    isActive: true,
  },
];

@Component({
  selector: 'app-pmrt23',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt23.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt23Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterType = signal('all');
  protected filterStatus = signal('all');
  protected filterProject = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('requestedDate');
  protected sortDir = signal<'asc' | 'desc'>('desc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected approvals = signal<ApprovalItem[]>(MOCK_APPROVALS);

  // ===== Computed =====
  protected filteredApprovals = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const type = this.filterType();
    const status = this.filterStatus();
    const project = this.filterProject();

    let result = this.approvals();

    if (term) {
      result = result.filter(
        (a) =>
          a.documentCode.toLowerCase().includes(term) ||
          a.title.toLowerCase().includes(term) ||
          a.projectName.toLowerCase().includes(term) ||
          a.requester.toLowerCase().includes(term)
      );
    }

    if (type !== 'all') {
      result = result.filter((a) => a.documentType === type);
    }

    if (status !== 'all') {
      result = result.filter((a) => a.status === status);
    }

    if (project !== 'all') {
      result = result.filter((a) => a.projectId === project);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof ApprovalItem] ?? '';
      const bVal = b[sortField as keyof ApprovalItem] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedApprovals = computed(() => {
    const all = this.filteredApprovals();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredApprovals().length);
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
  documentTypes = [
    'Requirement',
    'DFD',
    'ER Diagram',
    'Specification',
    'Change Request',
    'Test Plan',
    'UAT',
    'Delivery',
    'Invoice',
    'MA Renewal',
  ];
  statusOptions = ['Pending', 'Approved', 'Rejected', 'Need Revision', 'Cancelled'];
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

  goToApproval(id: string) {
    this.router.navigate(['/feature/pm/approval', id]);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Need Revision': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[status] || map['Pending'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Pending: 'รอดำเนินการ',
      Approved: 'อนุมัติ',
      Rejected: 'ไม่อนุมัติ',
      'Need Revision': 'ต้องแก้ไข',
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  formatDateShort(dateStr: string): string {
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

  getDocumentIcon(type: string): string {
    const map: Record<string, string> = {
      Requirement: 'bi-clipboard-check',
      DFD: 'bi-diagram-3',
      'ER Diagram': 'bi-table',
      Specification: 'bi-file-text',
      'Change Request': 'bi-arrow-left-right',
      'Test Plan': 'bi-clipboard-data',
      UAT: 'bi-check2-all',
      Delivery: 'bi-box-seam',
      Invoice: 'bi-receipt',
      'MA Renewal': 'bi-clock-history',
    };
    return map[type] || 'bi-file-earmark';
  }
}

export default Pmrt23Component;