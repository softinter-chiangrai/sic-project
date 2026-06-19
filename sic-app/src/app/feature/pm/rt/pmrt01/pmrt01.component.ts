import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// ===== Interfaces =====
interface Customer {
  id: string;
  code: string;
  firstNameEn: string;
  lastNameEn: string;
  firstNameLocal?: string;
  lastNameLocal?: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  taxId?: string;
  addressEn?: string;
  addressLocal?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== Component =====
@Component({
  selector: 'app-pmrt01',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pmrt01.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt01Component implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // ===== State Signals =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('createdAt');
  protected sortDir = signal<'asc' | 'desc'>('desc');
  protected isLoading = signal(false);
  protected selectedCustomer = signal<Customer | null>(null);

  // ===== Data =====
  protected customers = signal<Customer[]>([
    {
      id: '1',
      code: 'CUS-001',
      firstNameEn: 'สมชาย',
      lastNameEn: 'ใจดี',
      firstNameLocal: 'สมชาย',
      lastNameLocal: 'ใจดี',
      email: 'somchai@example.com',
      phoneNumber: '081-234-5678',
      isActive: true,
      taxId: '1-2345-67890-12-3',
      createdAt: '2024-01-15 09:30:00',
      updatedAt: '2024-01-15 09:30:00',
    },
    {
      id: '2',
      code: 'CUS-002',
      firstNameEn: 'สมหญิง',
      lastNameEn: 'รักเรียน',
      firstNameLocal: 'สมหญิง',
      lastNameLocal: 'รักเรียน',
      email: 'somying@example.com',
      phoneNumber: '082-345-6789',
      isActive: true,
      taxId: '2-3456-78901-23-4',
      createdAt: '2024-02-20 14:15:00',
      updatedAt: '2024-02-20 14:15:00',
    },
    {
      id: '3',
      code: 'CUS-003',
      firstNameEn: 'บริษัท',
      lastNameEn: 'ซอฟต์แวร์ จำกัด',
      firstNameLocal: 'บริษัท',
      lastNameLocal: 'ซอฟต์แวร์ จำกัด',
      email: 'info@softflow.com',
      phoneNumber: '083-456-7890',
      isActive: false,
      taxId: '3-4567-89012-34-5',
      createdAt: '2024-03-10 10:00:00',
      updatedAt: '2024-03-10 10:00:00',
    },
    {
      id: '4',
      code: 'CUS-004',
      firstNameEn: 'วิชัย',
      lastNameEn: 'พัฒนาชัย',
      firstNameLocal: 'วิชัย',
      lastNameLocal: 'พัฒนาชัย',
      email: 'vichai@example.com',
      phoneNumber: '084-567-8901',
      isActive: true,
      taxId: '4-5678-90123-45-6',
      createdAt: '2024-03-15 16:45:00',
      updatedAt: '2024-03-15 16:45:00',
    },
    {
      id: '5',
      code: 'CUS-005',
      firstNameEn: 'มานี',
      lastNameEn: 'มีทรัพย์',
      firstNameLocal: 'มานี',
      lastNameLocal: 'มีทรัพย์',
      email: 'manee@example.com',
      phoneNumber: '085-678-9012',
      isActive: false,
      taxId: '5-6789-01234-56-7',
      createdAt: '2024-04-01 08:20:00',
      updatedAt: '2024-04-01 08:20:00',
    },
  ]);

  // ===== Computed =====
  protected filteredCustomers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();

    let result = this.customers();

    if (term) {
      result = result.filter(c =>
        c.code.toLowerCase().includes(term) ||
        `${c.firstNameEn} ${c.lastNameEn}`.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.phoneNumber && c.phoneNumber.includes(term))
      );
    }

    if (status === 'active') {
      result = result.filter(c => c.isActive);
    } else if (status === 'inactive') {
      result = result.filter(c => !c.isActive);
    }

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof Customer] ?? '';
      const bVal = b[sortField as keyof Customer] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  });

  protected paginatedCustomers = computed(() => {
    const all = this.filteredCustomers();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  protected totalItems = computed(() => this.filteredCustomers().length);
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

  // ===== Math =====
  protected Math = Math;

  // ===== Lifecycle =====
  ngOnInit() {
    // เรียก API จริง
    // this.loadCustomers();
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
    this.router.navigate(['/customer/new']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/customer', id]);
  }

  goToView(id: string) {
    this.router.navigate(['/customer', id, 'view']);
  }

  toggleActive(customer: Customer) {
    const updated = { ...customer, isActive: !customer.isActive };
    this.customers.update(list =>
      list.map(c => c.id === customer.id ? updated : c)
    );
  }

  deleteCustomer(id: string) {
    if (confirm('คุณต้องการลบลูกค้ารายนี้ใช่หรือไม่?')) {
      this.customers.update(list => list.filter(c => c.id !== id));
    }
  }

  getStatusClass(isActive: boolean): string {
    return isActive
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'ใช้งาน' : 'ไม่ใช้งาน';
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '');
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

export default Pmrt01Component;