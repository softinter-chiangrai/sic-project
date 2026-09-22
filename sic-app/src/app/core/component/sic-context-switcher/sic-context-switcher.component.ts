// src/app/core/component/sic-context-switcher/sic-context-switcher.component.ts
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { CustomerStateService } from '../../services/customer-state.service';
import { BusinessService } from '../../services/business.service';
import { Pmrt01AService } from '../../../feature/pm/rt/pmrt01/pmrt01A/pmrt01A.service';
import { CustomerModel } from '../../../feature/pm/rt/pmrt01/pmrt01A/pmrt01A.model';
import { Pmrt02Service } from '../../../feature/pm/rt/pmrt02/pmrt02.service';
import { PmCustomerProject } from '../../../feature/pm/rt/pmrt02/pmrt02.model';

export interface FilterStatusOption {
  id: string;
  labelKey: string;
  dotColor: string;
}

export interface FilterPriorityOption {
  id: string;
  labelKey: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'sic-context-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './sic-context-switcher.component.html',
  styleUrl: './sic-context-switcher.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SicContextSwitcherComponent implements OnInit {
  private readonly customerState = inject(CustomerStateService);
  private readonly projectService = inject(Pmrt02Service);
  private readonly customerService = inject(Pmrt01AService);
  private readonly businessService = inject(BusinessService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  // Global Context State
  readonly currentProjectName = this.customerState.currentProjectName;
  readonly currentProjectId = this.customerState.currentProjectId;
  readonly currentCustomerName = this.customerState.currentCustomerName;
  readonly currentCustomerId = this.customerState.currentCustomerId;
  readonly selectedProjectCount = this.customerState.selectedProjectCount;
  readonly currentSelectedProjects = this.customerState.currentSelectedProjects;

  // Popover State
  readonly isOpen = signal(false);

  // Customer Combobox dropdown toggle state
  readonly isCustomerDropdownOpen = signal<boolean>(false);
  readonly customerSearchTerm = signal<string>('');

  // Filters State inside Popover
  readonly selectedCustomerId = signal<string>('');
  readonly selectedStatus = signal<string>('all');
  readonly selectedPriority = signal<string>('all');
  readonly keyword = signal<string>('');

  // Data Sources
  readonly customers = signal<CustomerModel[]>([]);
  readonly matchingProjects = signal<PmCustomerProject[]>([]);

  readonly isLoadingCustomers = signal(false);
  readonly isLoadingProjects = signal(false);

  private readonly search$ = new Subject<void>();

  // Filter Presets & Options
  readonly statusOptions: FilterStatusOption[] = [
    { id: 'all', labelKey: 'STATUS_ALL', dotColor: 'bg-slate-400' },
    { id: 'Planning', labelKey: 'STATUS_PLANNING', dotColor: 'bg-indigo-500' },
    { id: 'Development', labelKey: 'STATUS_DEVELOPMENT', dotColor: 'bg-blue-500' },
    { id: 'UAT', labelKey: 'STATUS_UAT', dotColor: 'bg-amber-500' },
    { id: 'Bug Fixing', labelKey: 'STATUS_BUG_FIXING', dotColor: 'bg-rose-500' },
    { id: 'Delivered', labelKey: 'STATUS_DELIVERED', dotColor: 'bg-emerald-500' },
    { id: 'Closed', labelKey: 'STATUS_CLOSED', dotColor: 'bg-slate-600' },
  ];

  readonly priorityOptions: FilterPriorityOption[] = [
    { id: 'all', labelKey: 'PRIORITY_ALL', icon: 'bi-grid', colorClass: 'text-slate-400' },
    { id: 'Critical', labelKey: 'PRIORITY_CRITICAL', icon: 'bi-exclamation-octagon-fill', colorClass: 'text-rose-500' },
    { id: 'High', labelKey: 'PRIORITY_HIGH', icon: 'bi-arrow-up-circle-fill', colorClass: 'text-orange-500' },
    { id: 'Medium', labelKey: 'PRIORITY_MEDIUM', icon: 'bi-dash-circle-fill', colorClass: 'text-amber-500' },
    { id: 'Low', labelKey: 'PRIORITY_LOW', icon: 'bi-arrow-down-circle-fill', colorClass: 'text-emerald-500' },
  ];

  // Computeds
  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.selectedCustomerId()) count++;
    if (this.selectedProjectCount() > 0) count += this.selectedProjectCount();
    if (this.selectedStatus() !== 'all') count++;
    if (this.selectedPriority() !== 'all') count++;
    if (this.keyword().trim()) count++;
    return count;
  });

  readonly hasActiveFilters = computed(() => this.activeFilterCount() > 0);

  readonly filteredCustomers = computed(() => {
    const term = this.customerSearchTerm().trim().toLowerCase();
    const list = this.customers();
    if (!term) return list;
    return list.filter(
      (c) =>
        this.getCustomerDisplayName(c).toLowerCase().includes(term) ||
        (c.customerCode && c.customerCode.toLowerCase().includes(term))
    );
  });

  readonly selectedCustomerLabel = computed(() => {
    const cid = this.selectedCustomerId();
    if (!cid) return this.translate.instant('CONTEXT_SWITCHER_ALL_CUSTOMERS') || 'ทุกลูกค้า (ทั้งหมด)';
    const c = this.customers().find((item) => item.id === cid);
    return c ? `${this.getCustomerDisplayName(c)} (${c.customerCode})` : (this.translate.instant('CONTEXT_SWITCHER_ALL_CUSTOMERS') || 'ทุกลูกค้า (ทั้งหมด)');
  });

  private readonly DEFAULT_I18N_TH: Record<string, string> = {
    CONTEXT_SWITCHER_TITLE: 'ตัวกรองและสลับโปรเจกต์',
    CONTEXT_SWITCHER_POPOVER_TITLE: 'ค้นหา & สลับโปรเจกต์',
    CONTEXT_SWITCHER_POPOVER_SUBTITLE: 'คัดกรองและเลือกโปรเจกต์การทำงาน',
    CONTEXT_SWITCHER_SELECT_PROMPT: 'เลือกโปรเจกต์ / ตัวกรอง...',
    CONTEXT_SWITCHER_CUSTOMER_SELECTED: 'เลือกลูกค้าแล้ว (ยังไม่เลือกโปรเจกต์)',
    CONTEXT_SWITCHER_SELECTED_PROJECT: 'โปรเจกต์ที่เลือก',
    CONTEXT_SWITCHER_PROJECTS_SELECTED: 'โปรเจกต์ที่เลือก',
    CONTEXT_SWITCHER_SEARCH_PLACEHOLDER: 'ค้นหาชื่อโปรเจกต์, รหัสโปรเจกต์...',
    CONTEXT_SWITCHER_CUSTOMER_LABEL: 'ลูกค้า',
    CONTEXT_SWITCHER_CUSTOMER_SEARCH_PLACEHOLDER: 'พิมพ์ค้นหาลูกค้า...',
    CONTEXT_SWITCHER_CUSTOMER_NOT_FOUND: 'ไม่พบรายชื่อลูกค้า',
    CONTEXT_SWITCHER_ALL_CUSTOMERS: 'ทุกลูกค้า (ทั้งหมด)',
    CONTEXT_SWITCHER_STATUS_LABEL: 'สถานะงาน',
    CONTEXT_SWITCHER_PRIORITY_LABEL: 'ระดับความสำคัญ',
    CONTEXT_SWITCHER_MATCHING_PROJECTS: 'โปรเจกต์ที่ตรงเงื่อนไข',
    CONTEXT_SWITCHER_LOADING_PROJECTS: 'กำลังโหลดรายการโปรเจกต์...',
    CONTEXT_SWITCHER_NO_MATCHING_PROJECTS: 'ไม่พบโปรเจกต์ตามเงื่อนไขตัวกรอง',
    CONTEXT_SWITCHER_CURRENT: 'ปัจจุบัน',
    CONTEXT_SWITCHER_SWITCH: 'สลับ',
    CONTEXT_SWITCHER_RESET_FILTERS: 'ล้างตัวกรอง',
    CONTEXT_SWITCHER_CLEAR_CONTEXT: 'ล้างบริบทปัจจุบัน',
    CONTEXT_SWITCHER_CLOSE: 'ปิด',
    CONTEXT_SWITCHER_SELECT_ALL: 'เลือกทั้งหมด',
    CONTEXT_SWITCHER_UNSELECT_ALL: 'ยกเลิกทั้งหมด',
    STATUS_ALL: 'ทั้งหมด',
    STATUS_PLANNING: 'วางแผน',
    STATUS_DEVELOPMENT: 'กำลังพัฒนา',
    STATUS_UAT: 'ทดสอบ',
    STATUS_BUG_FIXING: 'แก้ไขบั๊ก',
    STATUS_DELIVERED: 'ส่งมอบแล้ว',
    STATUS_CLOSED: 'ปิดงาน',
    PRIORITY_ALL: 'ทั้งหมด',
    PRIORITY_CRITICAL: 'ด่วนมาก',
    PRIORITY_HIGH: 'สูง',
    PRIORITY_MEDIUM: 'ปานกลาง',
    PRIORITY_LOW: 'ต่ำ',
    PRIORITY_NORMAL: 'ทั่วไป',
  };

  private readonly DEFAULT_I18N_EN: Record<string, string> = {
    CONTEXT_SWITCHER_TITLE: 'Filter & Switch Project',
    CONTEXT_SWITCHER_POPOVER_TITLE: 'Find & Switch Project',
    CONTEXT_SWITCHER_POPOVER_SUBTITLE: 'Filter and select projects',
    CONTEXT_SWITCHER_SELECT_PROMPT: 'Select project / filter...',
    CONTEXT_SWITCHER_CUSTOMER_SELECTED: 'Customer selected (No project selected)',
    CONTEXT_SWITCHER_SELECTED_PROJECT: 'Selected Project',
    CONTEXT_SWITCHER_PROJECTS_SELECTED: 'projects selected',
    CONTEXT_SWITCHER_SEARCH_PLACEHOLDER: 'Search project name, code...',
    CONTEXT_SWITCHER_CUSTOMER_LABEL: 'Customer',
    CONTEXT_SWITCHER_CUSTOMER_SEARCH_PLACEHOLDER: 'Type to search customer...',
    CONTEXT_SWITCHER_CUSTOMER_NOT_FOUND: 'No customers found',
    CONTEXT_SWITCHER_ALL_CUSTOMERS: 'All Customers',
    CONTEXT_SWITCHER_STATUS_LABEL: 'Status',
    CONTEXT_SWITCHER_PRIORITY_LABEL: 'Priority',
    CONTEXT_SWITCHER_MATCHING_PROJECTS: 'Matching Projects',
    CONTEXT_SWITCHER_LOADING_PROJECTS: 'Loading projects...',
    CONTEXT_SWITCHER_NO_MATCHING_PROJECTS: 'No projects match the filter criteria',
    CONTEXT_SWITCHER_CURRENT: 'Current',
    CONTEXT_SWITCHER_SWITCH: 'Switch',
    CONTEXT_SWITCHER_RESET_FILTERS: 'Reset Filters',
    CONTEXT_SWITCHER_CLEAR_CONTEXT: 'Clear Current Context',
    CONTEXT_SWITCHER_CLOSE: 'Close',
    CONTEXT_SWITCHER_SELECT_ALL: 'Select All',
    CONTEXT_SWITCHER_UNSELECT_ALL: 'Deselect All',
    STATUS_ALL: 'All',
    STATUS_PLANNING: 'Planning',
    STATUS_DEVELOPMENT: 'Development',
    STATUS_UAT: 'UAT',
    STATUS_BUG_FIXING: 'Bug Fixing',
    STATUS_DELIVERED: 'Delivered',
    STATUS_CLOSED: 'Closed',
    PRIORITY_ALL: 'All',
    PRIORITY_CRITICAL: 'Critical',
    PRIORITY_HIGH: 'High',
    PRIORITY_MEDIUM: 'Medium',
    PRIORITY_LOW: 'Low',
    PRIORITY_NORMAL: 'Normal',
  };

  private autoSelectAllOnFetch = false;

  readonly isAllProjectsSelected = computed(() => {
    const projects = this.matchingProjects();
    if (projects.length === 0) return false;
    return projects.every((p) => this.customerState.isProjectSelected(p.id));
  });

  ngOnInit(): void {
    // Register fallback translations immediately to prevent raw keys
    this.translate.setTranslation('th', this.DEFAULT_I18N_TH, true);
    this.translate.setTranslation('en', this.DEFAULT_I18N_EN, true);

    this.search$
      .pipe(
        debounceTime(200),
        switchMap(() => {
          this.isLoadingProjects.set(true);
          return this.projectService.getProjects({
            customerId: this.selectedCustomerId() || undefined,
            keyword: this.keyword().trim() || undefined,
            status: this.selectedStatus() !== 'all' ? this.selectedStatus() : undefined,
            priority: this.selectedPriority() !== 'all' ? this.selectedPriority() : undefined,
            page: 0,
            size: 20,
          });
        }),
      )
      .subscribe({
        next: (res) => {
          const list = res.data || [];
          this.matchingProjects.set(list);
          this.isLoadingProjects.set(false);

          // If a customer was just selected, auto-select all projects by default
          if (this.autoSelectAllOnFetch && list.length > 0) {
            this.autoSelectAllOnFetch = false;
            const projs = list.map((p) => ({
              id: p.id,
              projectName: p.projectName,
              projectCode: p.projectCode,
              customerId: p.customerId,
              customerName: p.customerName,
            }));
            this.customerState.setProjects(projs);
            this.syncContextToUrl();
          }
        },
        error: () => {
          this.matchingProjects.set([]);
          this.isLoadingProjects.set(false);
        },
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isOpen() && !this.elementRef.nativeElement.contains(target)) {
      this.close();
      return;
    }

    // Close open dropdowns if clicking outside customer container
    if (this.isCustomerDropdownOpen() && !target.closest('.sic-customer-combobox-wrapper')) {
      this.isCustomerDropdownOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isCustomerDropdownOpen()) {
      this.isCustomerDropdownOpen.set(false);
      return;
    }
    this.close();
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    this.isOpen.set(true);
    this.isCustomerDropdownOpen.set(false);
    this.selectedCustomerId.set(this.currentCustomerId() || '');
    this.loadCustomers();
    this.triggerSearch();
  }

  close(): void {
    this.isOpen.set(false);
    this.isCustomerDropdownOpen.set(false);
  }

  loadCustomers(): void {
    const businessId = this.businessService.getCurrentBusinessId() || '';
    if (!businessId) return;

    this.isLoadingCustomers.set(true);
    this.customerService.getCustomers(businessId, 0, 100, '', 'ACTIVE').subscribe({
      next: (res) => {
        this.customers.set(res.data || []);
        this.isLoadingCustomers.set(false);
      },
      error: () => {
        this.customers.set([]);
        this.isLoadingCustomers.set(false);
      },
    });
  }

  toggleCustomerDropdown(event: Event): void {
    event.stopPropagation();
    this.isCustomerDropdownOpen.update((v) => !v);
    this.customerSearchTerm.set('');
  }

  selectCustomerOption(customerId: string): void {
    this.selectedCustomerId.set(customerId);
    if (customerId) {
      const cust = this.customers().find((c) => c.id === customerId);
      this.customerState.setCustomer(customerId, this.getCustomerDisplayName(cust));
      // Auto-select all projects under this customer by default
      this.autoSelectAllOnFetch = true;
    } else {
      this.customerState.clearCustomer();
      this.customerState.clearProject();
      this.autoSelectAllOnFetch = false;
      this.clearAllUrlContext();
    }
    this.isCustomerDropdownOpen.set(false);
    this.triggerSearch();
  }

  toggleSelectAllProjects(): void {
    const projects = this.matchingProjects();
    if (projects.length === 0) return;

    if (this.isAllProjectsSelected()) {
      // Deselect all matching projects
      const matchingIds = new Set(projects.map((p) => p.id));
      const remaining = this.customerState.getSelectedProjects().filter((p) => !matchingIds.has(p.id));
      this.customerState.setProjects(remaining);
    } else {
      // Select all matching projects
      const selected = [...this.customerState.getSelectedProjects()];
      projects.forEach((p) => {
        if (!selected.some((item) => item.id === p.id)) {
          selected.push({
            id: p.id,
            projectName: p.projectName,
            projectCode: p.projectCode,
            customerId: p.customerId,
            customerName: p.customerName,
          });
        }
      });
      this.customerState.setProjects(selected);
    }
    this.syncContextToUrl();
  }

  onStatusChange(statusId: string): void {
    this.selectedStatus.set(statusId);
    this.triggerSearch();
  }

  onPriorityChange(priorityId: string): void {
    this.selectedPriority.set(priorityId);
    this.triggerSearch();
  }

  onKeywordChange(val: string): void {
    this.keyword.set(val);
    this.triggerSearch();
  }

  triggerSearch(): void {
    this.search$.next();
  }

  isProjectSelected(id: string): boolean {
    return this.customerState.isProjectSelected(id);
  }

  toggleProject(project: PmCustomerProject, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.customerState.toggleProject({
      id: project.id,
      projectName: project.projectName,
      projectCode: project.projectCode,
      customerId: project.customerId,
      customerName: project.customerName,
    });
    this.syncContextToUrl();
  }

  getCustomerDisplayName(cust?: CustomerModel | null): string {
    if (!cust) return '';
    return cust.companyNameLocal || cust.companyNameEn || cust.customerCode || '';
  }

  resetFilters(): void {
    this.selectedCustomerId.set('');
    this.selectedStatus.set('all');
    this.selectedPriority.set('all');
    this.keyword.set('');
    this.isCustomerDropdownOpen.set(false);
    this.customerState.clearAll();
    this.triggerSearch();
    this.clearAllUrlContext();
  }

  clearContext(event: Event): void {
    event.stopPropagation();
    this.selectedCustomerId.set('');
    this.selectedStatus.set('all');
    this.selectedPriority.set('all');
    this.keyword.set('');
    this.isCustomerDropdownOpen.set(false);
    this.customerState.clearAll();
    this.triggerSearch();
    this.clearAllUrlContext();
    this.close();
  }

  private syncContextToUrl(): void {
    const currentUrlTree = this.router.parseUrl(this.router.url);
    const queryParams = { ...currentUrlTree.queryParams };

    // Reset pagination to 1
    delete queryParams['page'];

    const selectedProjects = this.customerState.getSelectedProjects();
    const customerId = this.customerState.getCustomerId() || this.selectedCustomerId();

    if (selectedProjects.length === 1) {
      queryParams['projectId'] = selectedProjects[0].id;
      delete queryParams['projectIds'];
      if (selectedProjects[0].customerId) {
        queryParams['customerId'] = selectedProjects[0].customerId;
      } else if (customerId) {
        queryParams['customerId'] = customerId;
      }
    } else if (selectedProjects.length > 1) {
      queryParams['projectId'] = selectedProjects[0].id;
      queryParams['projectIds'] = selectedProjects.map((p) => p.id).join(',');
      if (customerId) {
        queryParams['customerId'] = customerId;
      }
    } else {
      delete queryParams['projectId'];
      delete queryParams['projectIds'];
      if (customerId) {
        queryParams['customerId'] = customerId;
      } else {
        delete queryParams['customerId'];
      }
    }

    this.router.navigate([], {
      queryParams,
    });
  }

  private clearAllUrlContext(): void {
    const currentUrlTree = this.router.parseUrl(this.router.url);
    const queryParams = { ...currentUrlTree.queryParams };
    delete queryParams['projectId'];
    delete queryParams['projectIds'];
    delete queryParams['customerId'];
    delete queryParams['page'];

    this.router.navigate([], {
      queryParams,
    });
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'Planning':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'Development':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'UAT':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Bug Fixing':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'Delivered':
      case 'Closed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  }

  getStatusLabelKey(status?: string): string {
    switch (status) {
      case 'Planning':
        return 'STATUS_PLANNING';
      case 'Development':
        return 'STATUS_DEVELOPMENT';
      case 'UAT':
        return 'STATUS_UAT';
      case 'Bug Fixing':
        return 'STATUS_BUG_FIXING';
      case 'Delivered':
        return 'STATUS_DELIVERED';
      case 'Closed':
        return 'STATUS_CLOSED';
      default:
        return status || '';
    }
  }

  getPriorityBadge(priority?: string): { icon: string; color: string; labelKey: string } {
    switch (priority) {
      case 'Critical':
        return { icon: 'bi-exclamation-octagon-fill', color: 'text-rose-500', labelKey: 'PRIORITY_CRITICAL' };
      case 'High':
        return { icon: 'bi-arrow-up-circle-fill', color: 'text-orange-500', labelKey: 'PRIORITY_HIGH' };
      case 'Medium':
        return { icon: 'bi-dash-circle-fill', color: 'text-amber-500', labelKey: 'PRIORITY_MEDIUM' };
      case 'Low':
        return { icon: 'bi-arrow-down-circle-fill', color: 'text-emerald-500', labelKey: 'PRIORITY_LOW' };
      default:
        return { icon: 'bi-circle', color: 'text-slate-400', labelKey: 'PRIORITY_NORMAL' };
    }
  }
}
