// src/app/feature/pm/rt/pmrt01/pmrt01.component.ts

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { CustomerModel } from './pmrt01A/pmrt01A.model'; // ✅ import model
import { Pmrt01AService } from './pmrt01A/pmrt01A.service';

@Component({
  selector: 'app-pmrt01',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt01.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt01Component implements OnInit {
  private router = inject(Router);
  private service = inject(Pmrt01AService);
  private dialog = inject(DialogService);
  private customerState = inject(CustomerStateService);
  private navigation = inject(NavigationService);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('customerCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);
  protected customers = signal<CustomerModel[]>([]);
  protected totalItems = signal(0);
  protected businessId = '';

  // ===== Computed =====
  protected filteredCustomers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.filterStatus();
    let result = this.customers();
    if (term) {
      result = result.filter(
        (c) =>
          c.customerCode?.toLowerCase().includes(term) ||
          c.companyNameEn?.toLowerCase().includes(term) ||
          c.companyNameLocal?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.contactPerson?.toLowerCase().includes(term),
      );
    }
    if (status === 'active') result = result.filter((c) => c.isActive);
    else if (status === 'inactive') result = result.filter((c) => !c.isActive);

    const sortField = this.sortBy();
    const direction = this.sortDir();
    result = [...result].sort((a, b) => {
      const aVal = a[sortField as keyof CustomerModel] ?? '';
      const bVal = b[sortField as keyof CustomerModel] ?? '';
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

  protected totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
  protected hasPrevious = computed(() => this.currentPage() > 1);
  protected hasNext = computed(() => this.currentPage() < this.totalPages());
  protected pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const range = 5;
    let start = Math.max(1, current - Math.floor(range / 2));
    let end = Math.min(total, start + range - 1);
    if (end - start < range - 1) {
      start = Math.max(1, end - range + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  protected Math = Math;

  ngOnInit() {
    this.businessId = localStorage.getItem('businessId') || '';
    if (this.businessId) {
      this.loadCustomers();
    }
  }

  loadCustomers() {
    this.isLoading.set(true);
    const page = this.currentPage() - 1;
    this.service
      .getCustomers(this.businessId, page, this.pageSize(), this.searchTerm() || undefined)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (pageData) => {
          this.customers.set(pageData.content);
          this.totalItems.set(pageData.totalElements);
        },
        error: (err) => {
          console.error('Load customers error', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการลูกค้าได้');
        },
      });
  }

  // ===== Event Handlers =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchTerm.set('');
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
    this.loadCustomers(); // โหลดข้อมูลใหม่
  }

  goToAdd() {
     this.navigation.navigate(['/feature/pm/pmrt01/new']);
  }

  goToEdit(id: string | undefined) {
    if (!id) {
      this.dialog.warn('ไม่พบรหัสลูกค้า', 'ไม่สามารถแก้ไขข้อมูลได้');
      return;
    }
    this.navigation.navigate(['/feature/pm/pmrt01', id, 'edit']); 
  }

  toggleActive(customer: CustomerModel) {
    if (!customer.id) return;
    const updated = { ...customer, isActive: !customer.isActive };
    this.service.updateCustomer(customer.id, updated).subscribe({
      next: () => {
        this.loadCustomers();
        this.dialog.success(
          'อัปเดตสถานะสำเร็จ',
          `สถานะถูกเปลี่ยนเป็น ${updated.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}`,
        );
      },
      error: (err) => {
        this.dialog.error('อัปเดตสถานะไม่สำเร็จ', err.error?.message);
      },
    });
  }

  deleteCustomer(id: string | undefined) {
    if (!id) {
      this.dialog.warn('ไม่พบรหัสลูกค้า', 'ไม่สามารถลบข้อมูลได้');
      return;
    }
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบลูกค้ารายนี้ใช่หรือไม่?').then((confirmed) => {
      if (confirmed) {
        this.service.deleteCustomer(id).subscribe({
          next: () => {
            this.loadCustomers();
            this.dialog.success('ลบสำเร็จ', 'ลูกค้าถูกลบเรียบร้อย');
          },
          error: (err) => {
            this.dialog.error('ลบไม่สำเร็จ', err.error?.message);
          },
        });
      }
    });
  }

  // ===== Utility Methods =====
  getStatusClass(isActive: boolean | undefined): string {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  }

  getStatusText(isActive: boolean | undefined): string {
    return isActive ? 'ใช้งาน' : 'ไม่ใช้งาน';
  }

  getInitials(companyName: string | undefined): string {
    if (!companyName) return '?';
    return companyName.charAt(0).toUpperCase();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
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

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
  getImageUrl(customer: CustomerModel): string {
    if (!customer.uploadGroupId) {
      return '';
    }
    return `${environment.apiBaseUrl}/api/storage/avatar/${customer.uploadGroupId}`;
  }
  goToProjects(customer: CustomerModel) {
    this.customerState.setCustomer(customer.id!, customer.companyNameEn);
    this.navigation.navigate(['/feature/pm/pmrt02']);
  }
}
