// src/app/feature/pm/rt/pmrt01/pmrt01.component.ts

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { FormsModule } from '@angular/forms';
import { CustomerModel } from './pmrt01A/pmrt01A.model'; // ✅ import model
import { Pmrt01AService } from './pmrt01A/pmrt01A.service';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { RecentItemsService } from '../../../../core/services/recent-items.service';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pmrt01',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicComboboxComponent, SicGridPanelComponent, SicGridPanelTemplate, TranslateModule],
  templateUrl: './pmrt01.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt01Component implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(Pmrt01AService);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private recentItems = inject(RecentItemsService);
  private translate = inject(TranslateService);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected isLoading = signal(false);
  protected customers = signal<CustomerModel[]>([]);
  protected totalItems = signal(0);
  protected businessId = '';

  // guard: ป้องกัน loadCustomers() ซ้ำซ้อนเมื่อ navigation เกิดจาก syncFiltersToUrl() เอง
  private syncingUrl = false;

  // ===== Grid =====
  @ViewChild('grid') gridRef?: SicGridPanelComponent;

  gridConfig: SicGridPanelConfig = {
    id: 'id',
    selectable: false,
    showToolbar: false,
    defaultSortField: 'customerCode',
    pageSize: this.pageSize(),
    column: [
      { label: this.translate.instant('PMRT01_COL_CODE'), name: 'customerCode', type: 'code', sortable: true, minWidth: 100 },
      { label: this.translate.instant('PMRT01_COL_COMPANY'), name: 'companyNameEn', type: 'companyInfo', sortable: true, minWidth: 220 },
      { label: this.translate.instant('PMRT01_COL_EMAIL'), name: 'email', type: 'emailLink', sortable: true, minWidth: 200 },
      { label: this.translate.instant('PMRT01_COL_PHONE'), name: 'phoneNumber', type: 'phoneText', minWidth: 120 },
      { label: this.translate.instant('PMRT01_COL_STATUS'), name: 'isActive', type: 'statusBadge', sortable: true, minWidth: 90 },
      { label: this.translate.instant('PMRT01_COL_ACTIONS'), name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 160 },
    ],
  };

  // resolver อาจ preload ข้อมูลหน้าแรกมาให้แล้ว — ใช้แทนการยิง HTTP รอบแรกใน handleGridLoad()
  private initialResolverData: { data: CustomerModel[]; totalElements: number } | null = null;

  // guard: ป้องกัน handleGridLoad ยิงซ้ำตอน mount ครั้งแรกถ้ามี resolver data แล้ว แต่ businessId ยังไม่พร้อมจาก localStorage
  private hasResolverData = false;

  ngOnInit() {
    this.businessId = localStorage.getItem('businessId') || '';
    const resolved = this.route.snapshot.data['form'] || this.route.snapshot.data['pageData'];
    if (resolved && resolved.data) {
      this.hasResolverData = true;
      this.initialResolverData = { data: resolved.data || [], totalElements: resolved.pageable?.totalElements || resolved.data.length || 0 };
    }

    this.route.queryParams.subscribe((params) => {
      if (this.syncingUrl) {
        this.syncingUrl = false;
        return;
      }

      if (params['q'] !== undefined) this.searchTerm.set(params['q']);
      if (params['status'] !== undefined) this.filterStatus.set(params['status']);
      if (params['page'] !== undefined) this.currentPage.set(+params['page'] || 1);

      // ข้ามรอบแรก: grid จะ mount และยิง loadData เองอัตโนมัติ (ใช้ resolver data ถ้ามี) — รอบถัดไปจาก URL เปลี่ยน (เช่นปุ่ม back) ต้อง reload เอง
      if (this.gridRef) {
        this.gridRef.reload();
      }
    });
  }

  // goToPage(1) no-op เงียบๆ ถ้า grid อยู่หน้า 1 อยู่แล้ว
  private reloadFromPage1(grid: SicGridPanelComponent): void {
    if (grid.currentPage === 1) {
      grid.reload();
    } else {
      grid.goToPage(1);
    }
  }

  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    const hasActiveFilters = !!this.searchTerm() || this.filterStatus() !== 'all';
    if (this.hasResolverData && this.initialResolverData && !hasActiveFilters) {
      const { data, totalElements } = this.initialResolverData;
      this.hasResolverData = false;
      this.customers.set(data);
      this.totalItems.set(totalElements);
      grid.setRows(data as unknown as SicGridRowData[], { totalElements }, request.requestId);
      return;
    }
    this.hasResolverData = false;

    this.isLoading.set(true);
    this.currentPage.set(request.pageNumber);
    this.syncFiltersToUrl();
    const page = request.pageNumber - 1;
    this.service
      .getCustomers(
        this.businessId,
        page,
        request.pageSize,
        this.searchTerm() || undefined,
        this.filterStatus() !== 'all' ? this.filterStatus() : undefined,
        request.sortField ?? 'customerCode',
        request.sortDescending ? 'desc' : 'asc'
      )
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (pageData) => {
          const data = pageData.data || [];
          const totalElements = pageData.pageable?.totalElements || 0;
          this.customers.set(data);
          this.totalItems.set(totalElements);
          grid.setRows(data as unknown as SicGridRowData[], { totalElements }, request.requestId);
        },
        error: (err) => {
          console.error('Load customers error', err);
          this.dialog.error(this.translate.instant('PMRT01_LOAD_ERROR_TITLE'), this.translate.instant('PMRT01_LOAD_ERROR_MSG'));
          grid.setRows([], { totalElements: 0 }, request.requestId);
          grid.setLoadError(this.translate.instant('PMRT01_LOAD_ERROR_TITLE'), request.requestId);
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
  onSearch(event: Event, grid: SicGridPanelComponent) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  clearSearch(grid: SicGridPanelComponent) {
    this.searchTerm.set('');
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  readonly statusOptions = [
    { value: 'active', text: this.translate.instant('PMRT01_STATUS_ACTIVE') },
    { value: 'inactive', text: this.translate.instant('PMRT01_STATUS_INACTIVE') },
  ];

  onFilterChange(value: any, grid: SicGridPanelComponent) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.syncFiltersToUrl();
    this.reloadFromPage1(grid);
  }

  goToAdd() {
     this.navigation.navigate(['/feature/pm/customer/new']);
  }

  goToEdit(id: string | undefined) {
    if (!id) {
      this.dialog.warn(this.translate.instant('PMRT01_NO_ID_TITLE'), this.translate.instant('PMRT01_NO_EDIT_MSG'));
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

  toggleActive(customer: CustomerModel, grid: SicGridPanelComponent) {
    if (!customer.id) return;
    const updated = { ...customer, isActive: !customer.isActive };
    this.service.updateCustomer(customer.id, updated).subscribe({
      next: () => {
        grid.reload();
        this.dialog.success(
          this.translate.instant('PMRT01_UPDATE_STATUS_SUCCESS_TITLE'),
          this.translate.instant('PMRT01_UPDATE_STATUS_SUCCESS_MSG', {
            status: updated.isActive ? this.translate.instant('PMRT01_STATUS_ACTIVE') : this.translate.instant('PMRT01_STATUS_INACTIVE'),
          }),
        );
      },
      error: (err) => {
        this.dialog.error(this.translate.instant('PMRT01_UPDATE_STATUS_ERROR_TITLE'), err.error?.message);
      },
    });
  }

  deleteCustomer(id: string | undefined, grid: SicGridPanelComponent) {
    if (!id) {
      this.dialog.warn(this.translate.instant('PMRT01_NO_ID_TITLE'), this.translate.instant('PMRT01_NO_DELETE_MSG'));
      return;
    }
    this.dialog.confirm(this.translate.instant('PMRT01_CONFIRM_DELETE_TITLE'), this.translate.instant('PMRT01_CONFIRM_DELETE_MSG')).then((confirmed) => {
      if (confirmed) {
        this.service.deleteCustomer(id).subscribe({
          next: () => {
            grid.reload();
            this.dialog.success(this.translate.instant('PMRT01_DELETE_SUCCESS_TITLE'), this.translate.instant('PMRT01_DELETE_SUCCESS_MSG'));
          },
          error: (err) => {
            this.dialog.error(this.translate.instant('PMRT01_DELETE_ERROR_TITLE'), err.error?.message);
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
    return isActive ? this.translate.instant('PMRT01_STATUS_ACTIVE') : this.translate.instant('PMRT01_STATUS_INACTIVE');
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
}
