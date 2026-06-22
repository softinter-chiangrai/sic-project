import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface Invoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  contractId: string;
  contractNo: string;
  milestone: string;
  amount: number;
  vat: number;
  totalAmount: number;
  dueDate: string;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid' | 'Overdue';
  paymentDate?: string;
  receiptFile?: string;
  isActive: boolean;
  createdAt: string;
}

// ===== Mock Data =====
const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNo: 'INV-001',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    projectId: '1',
    projectName: 'ระบบ CRM',
    contractId: '1',
    contractNo: 'CT-001',
    milestone: 'งวดที่ 1 (เริ่มงาน)',
    amount: 200000,
    vat: 14000,
    totalAmount: 214000,
    dueDate: '2024-03-15',
    paymentStatus: 'Paid',
    paymentDate: '2024-03-10',
    receiptFile: 'receipt_001.pdf',
    isActive: true,
    createdAt: '2024-02-28 09:00:00',
  },
  {
    id: '2',
    invoiceNo: 'INV-002',
    customerId: '1',
    customerName: 'สมชาย ใจดี',
    projectId: '1',
    projectName: 'ระบบ CRM',
    contractId: '1',
    contractNo: 'CT-001',
    milestone: 'งวดที่ 2 (ส่งมอบ)',
    amount: 300000,
    vat: 21000,
    totalAmount: 321000,
    dueDate: '2024-04-30',
    paymentStatus: 'Unpaid',
    paymentDate: '',
    receiptFile: '',
    isActive: true,
    createdAt: '2024-03-01 10:00:00',
  },
  {
    id: '3',
    invoiceNo: 'INV-003',
    customerId: '2',
    customerName: 'บริษัท ซอฟต์แวร์ จำกัด',
    projectId: '2',
    projectName: 'ระบบ HR',
    contractId: '3',
    contractNo: 'CT-003',
    milestone: 'Milestone 1',
    amount: 150000,
    vat: 10500,
    totalAmount: 160500,
    dueDate: '2024-05-15',
    paymentStatus: 'Overdue',
    paymentDate: '',
    receiptFile: '',
    isActive: true,
    createdAt: '2024-03-15 14:00:00',
  },
];

@Component({
  selector: 'app-pmrt20',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt20.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt20Component implements OnInit {
  private router = inject(Router);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterProject = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('invoiceNo');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected invoices = signal<Invoice[]>(MOCK_INVOICES);

  // ===== Computed =====
  protected filteredInvoices = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    const project = this.filterProject();

    let result = this.invoices();

    if (term) {
      result = result.filter(
        (inv) =>
          inv.invoiceNo.toLowerCase().includes(term) ||
          inv.customerName.toLowerCase().includes(term) ||
          inv.projectName.toLowerCase().includes(term) ||
          inv.contractNo.toLowerCase().includes(term)
      );
    }

    if (status !== 'all') {
      result = result.filter((inv) => inv.paymentStatus === status);
    }

    if (project !== 'all') {
      result = result.filter((inv) => inv.projectId === project);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof Invoice] ?? '';
      const bVal = b[sortField as keyof Invoice] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedInvoices = computed(() => {
    const all = this.filteredInvoices();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredInvoices().length);
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
  statusOptions = ['Unpaid', 'Partial', 'Paid', 'Overdue'];
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

  goToAdd() {
    this.router.navigate(['/feature/pm/invoice/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/invoice', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/invoice', id, 'view']);
  }

  goToPrint(id: string) {
    // TODO: พิมพ์ใบแจ้งหนี้
    console.log('Print invoice:', id);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Unpaid: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Partial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Unpaid'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Unpaid: 'ค้างชำระ',
      Partial: 'ชำระบางส่วน',
      Paid: 'ชำระแล้ว',
      Overdue: 'เลยกำหนด',
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(value);
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }
}

export default Pmrt20Component;