// src/app/feature/pm/rt/pmrt04/pmrt04.component.ts

import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize, of, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { Pmrt02Service } from '../pmrt02/pmrt02.service';

// ===== Interfaces =====
export interface Contract {
  id: string;
  contractNo: string;
  contractType: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  paymentTerms: string;
  scopeSummary: string;
  signStatus: 'Draft' | 'Sent' | 'Signed' | 'Expired';
  renewalStatus: string;
  isActive: boolean;
  createdAt: string;
  rowVersion?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-pmrt04',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt04.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt04Component implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private dialog = inject(DialogService);
  private projectService = inject(Pmrt02Service);
  private navigation = inject(NavigationService);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterType = signal('all');
  protected filterCustomerId = signal<string | null>(null);
  protected filterCustomerName = signal<string>('');
  protected filterProjectId = signal<string | null>(null);
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('contractNo');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected contracts = signal<Contract[]>([]);
  protected totalItems = signal(0);
  protected contractTypes = signal<string[]>([]);

  private apiUrl = environment.apiBaseUrl + '/api/pm/contracts';

  // ===== Computed =====
  protected filteredContracts = computed(() => this.contracts());
  protected paginatedContracts = computed(() => this.contracts());

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

  // ===== Options =====
  statusOptions = ['Draft', 'Sent', 'Signed', 'Expired'];
  signStatusOptions = ['Draft', 'Sent', 'Signed', 'Expired'];

  // ===== Lifecycle =====
  ngOnInit() {
    this.loadContractTypes();

    // ✅ จัดการ queryParams แบบมีเงื่อนไข
    this.route.queryParams
      .pipe(
        switchMap((params) => {
          const customerId = params['customerId'] || null;
          const projectId = params['projectId'] || null;

          this.filterProjectId.set(projectId);

          // ถ้ามี customerId ให้ใช้เลย
          if (customerId) {
            this.filterCustomerId.set(customerId);
            const customerName = params['customerName'] || '';
            this.filterCustomerName.set(customerName);
            this.currentPage.set(1);
            return of(null); // ไม่ต้องเรียก project API
          }

          // ถ้ามี projectId และยังไม่มี customerId ให้ดึงจาก project
          if (projectId) {
            return this.projectService.getProject(projectId).pipe(
              finalize(() => {
                // หลังจากได้ข้อมูลแล้วโหลด contracts
                this.loadContracts();
              }),
            );
          }

          // ถ้าไม่มีทั้ง customerId และ projectId ให้ reset
          this.filterCustomerId.set(null);
          this.filterCustomerName.set('');
          this.currentPage.set(1);
          return of(null);
        }),
      )
      .subscribe({
        next: (project) => {
          if (project) {
            // กรณีมี projectId แต่ไม่มี customerId → ได้ project จาก API
            this.filterCustomerId.set(project.customerId);
            this.filterCustomerName.set(project.customerName);
            this.currentPage.set(1);
            // loadContracts() ถูกเรียกใน finalize ของ switchMap แล้ว
          } else {
            // ✅ กรณีมี customerId → โหลดทันที (ไม่ต้องสนใจ projectId)
            if (this.filterCustomerId()) {
              this.loadContracts();
            }
            // ถ้าไม่มีทั้ง customerId และ projectId → โหลดทั้งหมด
            else if (!this.filterProjectId()) {
              this.loadContracts();
            }
            // ถ้ามีแค่ projectId อย่างเดียว → switchMap จะเรียก project API และ load ใน finalize
          }
        },
        error: (err) => {
          console.error('Error fetching project:', err);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบโครงการที่ระบุ');
          this.navigation.navigate(['/feature/pm/pmrt02']);
        },
      });
  }

  // ===== Load Data =====
  loadContractTypes() {
    // TODO: ดึงจาก API จริง
    this.contractTypes.set([
      'Development Contract',
      'Maintenance Contract',
      'Support Contract',
      'Change Request Contract',
      'Extension Contract',
    ]);
  }

  loadContracts() {
    this.isLoading.set(true);

    let params = new HttpParams()
      .set('page', (this.currentPage() - 1).toString())
      .set('size', this.pageSize().toString());

    const customerId = this.filterCustomerId();
    if (customerId) {
      params = params.set('customerId', customerId);
    }

    const keyword = this.searchTerm();
    if (keyword) {
      params = params.set('keyword', keyword);
    }

    const status = this.filterStatus();
    if (status !== 'all') {
      params = params.set('status', status);
    }

    const type = this.filterType();
    if (type !== 'all') {
      params = params.set('contractType', type);
    }

    if (this.sortBy()) {
      params = params.set('sortBy', this.sortBy()).set('sortDir', this.sortDir());
    }

    this.http
      .get<PageResponse<Contract>>(this.apiUrl, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.contracts.set(response.content || []);
          this.totalItems.set(response.totalElements || 0);

          // ถ้ามี customerId แต่ยังไม่มีชื่อลูกค้า ให้ดึงจาก response
          if (this.filterCustomerId() && !this.filterCustomerName()) {
            const firstContract = response.content?.[0];
            if (firstContract?.customerName) {
              this.filterCustomerName.set(firstContract.customerName);
            }
          }
        },
        error: (error) => {
          console.error('Load contracts error:', error);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการสัญญาได้');
          this.contracts.set([]);
          this.totalItems.set(0);
        },
      });
  }

  // ===== Actions =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadContracts();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadContracts();
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
    this.loadContracts();
  }

  onTypeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterType.set(select.value);
    this.currentPage.set(1);
    this.loadContracts();
  }

  onSortChange(field: string) {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
    this.loadContracts();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadContracts();
  }

  goToAdd() {
    const customerId = this.filterCustomerId();
    const projectId = this.filterProjectId();
    if (customerId) {
      const queryParams: any = { customerId };
      if (projectId) {
        queryParams.projectId = projectId;
      }
      this.navigation.navigate(['/feature/pm/pmrt04/new'], {
        queryParams,
      });
    } else {
      this.dialog.warn('ไม่พบข้อมูลลูกค้า', 'กรุณาเลือกลูกค้าก่อน');
      this.navigation.navigate(['/feature/pm/pmrt02']);
    }
  }

  goToEdit(id: string) {
    this.navigation.navigate(['/feature/pm/pmrt04', id, 'edit']);
  }

  goToView(id: string) {
    this.navigation.navigate(['/feature/pm/pmrt04', id, 'view']);
  }

  goBackToCustomer() {
    // ✅ ถ้ามี projectId ให้กลับไป pmrt02 (รายการโครงการ)
    if (this.filterProjectId()) {
      this.navigation.navigate(['/feature/pm/pmrt02']);
    } else if (this.filterCustomerId()) {
      this.navigation.navigate(['/feature/pm/pmrt01']);
    } else {
      this.navigation.navigate(['/feature/pm/pmrt02']);
    }
  }


goToProject(projectId: string) {
  this.navigation.navigate(['/feature/pm/pmrt03'], {
    queryParams: {
      projectId: projectId,       
      customerId: this.filterCustomerId(),
    },
  });
}

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Signed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Draft'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      Sent: 'ส่งแล้ว',
      Signed: 'ลงนามแล้ว',
      Expired: 'หมดอายุ',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
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
    if (!value) return '0.00';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(value);
  }
}
