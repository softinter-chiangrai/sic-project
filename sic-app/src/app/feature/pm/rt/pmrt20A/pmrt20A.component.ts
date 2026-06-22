import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface Payment {
  id: string;
  paymentNo: string;
  invoiceId: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Cheque' | 'Credit Card' | 'Other';
  referenceNo?: string;
  receiptFile?: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_PAYMENTS: Payment[] = [
  {
    id: '1',
    paymentNo: 'PAY-001',
    invoiceId: '1',
    invoiceNo: 'INV-001',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    projectId: '1',
    projectName: 'ระบบ CRM',
    amount: 214000,
    paymentDate: '2024-03-10',
    paymentMethod: 'Bank Transfer',
    referenceNo: 'TRX-123456',
    receiptFile: 'receipt_001.pdf',
    status: 'Completed',
    notes: 'ชำระผ่านธนาคารกสิกรไทย',
    isActive: true,
    createdAt: '2024-03-10 09:00:00',
  },
  {
    id: '2',
    paymentNo: 'PAY-002',
    invoiceId: '2',
    invoiceNo: 'INV-002',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    projectId: '1',
    projectName: 'ระบบ CRM',
    amount: 321000,
    paymentDate: '2024-04-20',
    paymentMethod: 'Cash',
    referenceNo: '',
    receiptFile: '',
    status: 'Pending',
    notes: 'รอการชำระ',
    isActive: true,
    createdAt: '2024-04-18 14:00:00',
  },
  {
    id: '3',
    paymentNo: 'PAY-003',
    invoiceId: '3',
    invoiceNo: 'INV-003',
    customerId: '2',
    customerName: 'บริษัท ซอฟต์แวร์ จำกัด',
    projectId: '2',
    projectName: 'ระบบ HR',
    amount: 160500,
    paymentDate: '2024-05-10',
    paymentMethod: 'Credit Card',
    referenceNo: 'CC-789012',
    receiptFile: '',
    status: 'Failed',
    notes: 'บัตรเครดิตไม่ผ่าน',
    isActive: true,
    createdAt: '2024-05-10 10:00:00',
  },
];

@Component({
  selector: 'app-pmrt21',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt20A.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt21Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterMethod = signal('all');
  protected filterProject = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('paymentNo');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected payments = signal<Payment[]>(MOCK_PAYMENTS);

  // ===== Computed =====
  protected filteredPayments = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const method = this.filterMethod();
    const project = this.filterProject();

    let result = this.payments();

    if (term) {
      result = result.filter(
        (p) =>
          p.paymentNo.toLowerCase().includes(term) ||
          p.invoiceNo.toLowerCase().includes(term) ||
          p.customerName.toLowerCase().includes(term) ||
          p.projectName.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((p) => p.status === status);
    }

    if (method !== 'all') {
      result = result.filter((p) => p.paymentMethod === method);
    }

    if (project !== 'all') {
      result = result.filter((p) => p.projectId === project);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof Payment] ?? '';
      const bVal = b[sortField as keyof Payment] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedPayments = computed(() => {
    const all = this.filteredPayments();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredPayments().length);
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
  statusOptions = ['Pending', 'Completed', 'Failed', 'Refunded'];
  methodOptions = ['Bank Transfer', 'Cash', 'Cheque', 'Credit Card', 'Other'];
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

  onMethodChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterMethod.set(select.value);
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
    this.router.navigate(['/feature/pm/payment/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/payment', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/payment', id, 'view']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Refunded: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return map[status] || map['Pending'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Pending: 'รอดำเนินการ',
      Completed: 'สำเร็จ',
      Failed: 'ล้มเหลว',
      Refunded: 'คืนเงิน',
    };
    return map[status] || status;
  }

  getMethodText(method: string): string {
    const map: Record<string, string> = {
      'Bank Transfer': 'โอนเงินผ่านธนาคาร',
      Cash: 'เงินสด',
      Cheque: 'เช็ค',
      'Credit Card': 'บัตรเครดิต',
      Other: 'อื่นๆ',
    };
    return map[method] || method;
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(value);
  }
}

export default Pmrt21Component;