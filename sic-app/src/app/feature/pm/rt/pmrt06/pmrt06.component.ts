import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface ChangeRequest {
  id: string;
  requestCode: string;
  title: string;
  description: string;
  requirementId: string;
  requirementCode: string;
  projectId: string;
  projectName: string;
  requester: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'In Review' | 'Approved' | 'Rejected' | 'Implemented' | 'Cancelled';
  impactDfd?: string;
  impactEr?: string;
  impactUi?: string;
  impactApi?: string;
  impactTest?: string;
  impactManday?: number;
  impactTimeline?: number;
  impactCost?: number;
  version: string;
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_CHANGE_REQUESTS: ChangeRequest[] = [
  {
    id: '1',
    requestCode: 'CR-001',
    title: 'เพิ่มฟิลด์เบอร์โทรในหน้าลูกค้า',
    description: 'ลูกค้าต้องการให้เพิ่มฟิลด์เบอร์โทรในหน้าจอจัดการข้อมูลลูกค้า',
    requirementId: '1',
    requirementCode: 'REQ-001',
    projectId: '1',
    projectName: 'ระบบ CRM',
    requester: 'สมชาย ใจดี',
    priority: 'Medium',
    status: 'Approved',
    impactDfd: 'กระทบ Process: P-002 (จัดการลูกค้า)',
    impactEr: 'เพิ่ม Column: customer.phone_number',
    impactUi: 'เพิ่มฟิลด์ใน Customer Form',
    impactApi: 'เพิ่ม field phoneNumber ใน API',
    impactTest: 'เพิ่ม Test Case สำหรับ phoneNumber',
    impactManday: 2,
    impactTimeline: 1,
    impactCost: 10000,
    version: 'v1.0',
    isActive: true,
    createdAt: '2024-02-01 10:00:00',
  },
  {
    id: '2',
    requestCode: 'CR-002',
    title: 'เปลี่ยนรูปแบบการแสดงผล Dashboard',
    description: 'ต้องการให้ Dashboard แสดงกราฟแท่งแทนกราฟวงกลม',
    requirementId: '2',
    requirementCode: 'REQ-002',
    projectId: '1',
    projectName: 'ระบบ CRM',
    requester: 'ลูกค้า',
    priority: 'Low',
    status: 'In Review',
    impactDfd: 'ไม่กระทบ DFD',
    impactEr: 'ไม่กระทบ ER',
    impactUi: 'เปลี่ยน UI Dashboard',
    impactApi: 'ไม่กระทบ API',
    impactTest: 'แก้ไข Test Case ที่เกี่ยวข้อง',
    impactManday: 1,
    impactTimeline: 0,
    impactCost: 0,
    version: 'v1.0',
    isActive: true,
    createdAt: '2024-02-15 14:30:00',
  },
  {
    id: '3',
    requestCode: 'CR-003',
    title: 'เพิ่มระบบแจ้งเตือนผ่านอีเมล',
    description: 'ต้องการให้ระบบส่งอีเมลแจ้งเตือนเมื่อมีงานใหม่',
    requirementId: '3',
    requirementCode: 'REQ-003',
    projectId: '2',
    projectName: 'ระบบ HR',
    requester: 'BA',
    priority: 'High',
    status: 'Draft',
    impactDfd: 'เพิ่ม Process: P-005 (ส่งอีเมล)',
    impactEr: 'เพิ่ม Table: email_queue',
    impactUi: 'เพิ่มหน้าตั้งค่าอีเมล',
    impactApi: 'เพิ่ม API ส่งอีเมล',
    impactTest: 'เพิ่ม Test Case สำหรับอีเมล',
    impactManday: 5,
    impactTimeline: 3,
    impactCost: 0,
    version: 'v1.0',
    isActive: true,
    createdAt: '2024-03-01 09:00:00',
  },
];

@Component({
  selector: 'app-pmrt06',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt06.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt06Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterPriority = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('requestCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);
  protected expandedRequest = signal<string | null>(null);

  // ===== Data =====
  protected changeRequests = signal<ChangeRequest[]>(MOCK_CHANGE_REQUESTS);

  // ===== Computed =====
  protected filteredRequests = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const priority = this.filterPriority();

    let result = this.changeRequests();

    if (term) {
      result = result.filter(
        (r) =>
          r.requestCode.toLowerCase().includes(term) ||
          r.title.toLowerCase().includes(term) ||
          r.projectName.toLowerCase().includes(term) ||
          r.requester.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((r) => r.status === status);
    }

    if (priority !== 'all') {
      result = result.filter((r) => r.priority === priority);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof ChangeRequest] ?? '';
      const bVal = b[sortField as keyof ChangeRequest] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedRequests = computed(() => {
    const all = this.filteredRequests();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredRequests().length);
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
  statusOptions = ['Draft', 'In Review', 'Approved', 'Rejected', 'Implemented', 'Cancelled'];
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

  toggleExpand(id: string) {
    this.expandedRequest.set(this.expandedRequest() === id ? null : id);
  }

  goToAdd() {
    this.router.navigate(['/feature/pm/change-request/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/change-request', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/change-request', id, 'view']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'In Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Implemented: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Cancelled: 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return map[status] || map['Draft'];
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value);
  }
}

export default Pmrt06Component;