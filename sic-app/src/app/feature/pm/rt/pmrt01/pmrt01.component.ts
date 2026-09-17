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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { FormsModule } from '@angular/forms';
import { CustomerModel } from './pmrt01A/pmrt01A.model'; // ✅ import model
import { Pmrt01AService } from './pmrt01A/pmrt01A.service';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicPaginationComponent } from '../../../../core/component/sic-pagination/sic-pagination.component';
import { RecentItemsService } from '../../../../core/services/recent-items.service';

@Component({
  selector: 'app-pmrt01',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicComboboxComponent, SicPaginationComponent],
  templateUrl: './pmrt01.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt01Component implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(Pmrt01AService);
  private dialog = inject(DialogService);
  private customerState = inject(CustomerStateService);
  private navigation = inject(NavigationService);
  private recentItems = inject(RecentItemsService);

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

  // guard: ป้องกัน loadCustomers() ซ้ำซ้อนเมื่อ navigation เกิดจาก syncFiltersToUrl() เอง
  private syncingUrl = false;

  // ===== Computed =====
  protected paginatedCustomers = computed(() => {
    return this.customers();
  });

  protected totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  ngOnInit() {
    this.businessId = localStorage.getItem('businessId') || '';
    const resolved = this.route.snapshot.data['form'] || this.route.snapshot.data['pageData'];
    if (resolved && resolved.data) {
      this.customers.set(resolved.data || []);
      this.totalItems.set(resolved.pageable?.totalElements || resolved.data.length || 0);
    }

    this.route.queryParams.subscribe((params) => {
      if (this.syncingUrl) {
        this.syncingUrl = false;
        return;
      }

      if (params['q'] !== undefined) this.searchTerm.set(params['q']);
      if (params['status'] !== undefined) this.filterStatus.set(params['status']);
      if (params['page'] !== undefined) this.currentPage.set(+params['page'] || 1);

      if ((!resolved || !resolved.data) && this.businessId) {
        this.loadCustomers();
      }
    });
  }

  loadCustomers() {
    this.isLoading.set(true);
    const page = this.currentPage() - 1;
    this.service
      .getCustomers(
        this.businessId,
        page,
        this.pageSize(),
        this.searchTerm() || undefined,
        this.sortBy() || undefined,
        this.sortDir()
      )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (pageData) => {
          this.customers.set(pageData.data || []);
          this.totalItems.set(pageData.pageable?.totalElements || 0);
        },
        error: (err) => {
          console.error('Load customers error', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการลูกค้าได้');
        },
      });
  }

  // ===== URL State Sync =====
  private syncFiltersToUrl(): void {
    this.syncingUrl = true;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchTerm() || null,
        status: this.filterStatus() !== 'all' ? this.filterStatus() : null,
        page: this.currentPage() > 1 ? this.currentPage() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // ===== Event Handlers =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.syncFiltersToUrl();
    this.loadCustomers();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.syncFiltersToUrl();
    this.loadCustomers();
  }

  readonly statusOptions = [
    { value: 'active', text: 'ใช้งาน' },
    { value: 'inactive', text: 'ไม่ใช้งาน' },
  ];

  onFilterChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.currentPage.set(1);
    this.syncFiltersToUrl();
    this.loadCustomers();
  }

  onSortChange(field: string) {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
    this.loadCustomers();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.syncFiltersToUrl();
    this.loadCustomers();
  }

  goToAdd() {
     this.navigation.navigate(['/feature/pm/customer/new']);
  }

  goToEdit(id: string | undefined) {
    if (!id) {
      this.dialog.warn('ไม่พบรหัสลูกค้า', 'ไม่สามารถแก้ไขข้อมูลได้');
      return;
    }
    const customer = this.customers().find((c) => c.id === id);
    if (customer) {
      this.recentItems.record({
        id,
        label: customer.customerCode,
        type: 'customer',
        path: `/feature/pm/customer/${id}/edit`,
        icon: 'bi-people-fill',
      });
    }
    this.navigation.navigate(['/feature/pm/customer', id, 'edit']);
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
  this.navigation.navigate(['/feature/pm/project'], {
    queryParams: { customerId: customer.id }
  });
}
}
