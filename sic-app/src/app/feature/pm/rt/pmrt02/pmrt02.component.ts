// src/app/feature/pm/rt/pmrt02/pmrt02.component.ts

import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { DialogService } from '../../../../core/services/dialog.service';
import { environment } from '../../../../../environments/environment';

// ===== Interfaces =====
export interface Project {
  id: string;
  projectCode: string;
  projectName: string;
  customerId: string;
  customerName: string;
  contractId: string;
  contractNo: string;
  projectManager: string;
  ba: string;
  sa: string;
  startDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  budgetManday: number;
  usedManday: number;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
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
  selector: 'app-pmrt02',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmrt02.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt02Component implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private dialog = inject(DialogService);

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected filterPriority = signal('all');
  protected filterCustomerId = signal<string | null>(null);
  protected filterCustomerName = signal<string>('');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('projectCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);

  // ===== Data =====
  protected projects = signal<Project[]>([]);
  protected totalItems = signal(0);

  private apiUrl = environment.apiBaseUrl + '/api/pm/projects';

  // ===== Computed =====
  protected filteredProjects = computed(() => {
    // ใช้ projects จาก API โดยตรง (backend จัดการ filter แล้ว)
    return this.projects();
  });

  protected paginatedProjects = computed(() => {
    // Backend จัดการ pagination แล้ว
    return this.projects();
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

  // ===== Options =====
  statusOptions = [
    'Prospect', 'Contract Drafting', 'Contract Signed', 'Requirement Gathering',
    'Requirement Approval', 'System Analysis', 'DFD Design', 'ER Design',
    'Specification Design', 'Specification Approval', 'Planning', 'Development',
    'Internal Testing', 'UAT', 'Bug Fixing', 'Ready for Delivery', 'Delivered',
    'Invoicing', 'Closed', 'MA Active',
  ];

  priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  // ===== Lifecycle =====
  ngOnInit() {
    // อ่าน queryParams
    this.route.queryParams.subscribe((params) => {
      const customerId = params['customerId'];
      if (customerId) {
        this.filterCustomerId.set(customerId);
        // ดึงชื่อลูกค้าจาก queryParams หรือจากข้อมูลที่โหลด
        const customerName = params['customerName'] || '';
        this.filterCustomerName.set(customerName);
      } else {
        this.filterCustomerId.set(null);
        this.filterCustomerName.set('');
      }
      this.currentPage.set(1);
      this.loadProjects();
    });

    // ถ้าไม่มี queryParams ให้โหลดทั้งหมด
    if (!this.route.snapshot.queryParams['customerId']) {
      this.loadProjects();
    }
  }

  // ===== Load Projects from API =====
  loadProjects() {
    this.isLoading.set(true);

    let params = new HttpParams()
      .set('page', (this.currentPage() - 1).toString())
      .set('size', this.pageSize().toString());

    // กรองตาม customerId
    const customerId = this.filterCustomerId();
    if (customerId) {
      params = params.set('customerId', customerId);
    }

    // ค้นหา
    const keyword = this.searchTerm();
    if (keyword) {
      params = params.set('keyword', keyword);
    }

    // สถานะ
    const status = this.filterStatus();
    if (status !== 'all') {
      params = params.set('status', status);
    }

    // ความสำคัญ
    const priority = this.filterPriority();
    if (priority !== 'all') {
      params = params.set('priority', priority);
    }

    // เรียงลำดับ
    if (this.sortBy()) {
      params = params
        .set('sortBy', this.sortBy())
        .set('sortDir', this.sortDir());
    }

    this.http.get<PageResponse<Project>>(this.apiUrl, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.projects.set(response.content || []);
          this.totalItems.set(response.totalElements || 0);

          // ถ้ามี customerId แต่ยังไม่มีชื่อ ให้ลองดึงจากข้อมูลที่โหลด
          if (this.filterCustomerId() && !this.filterCustomerName()) {
            const firstProject = response.content?.[0];
            if (firstProject?.customerName) {
              this.filterCustomerName.set(firstProject.customerName);
            }
          }
        },
        error: (error) => {
          console.error('Load projects error:', error);
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการโครงการได้');
          this.projects.set([]);
          this.totalItems.set(0);
        },
      });
  }

  // ===== Actions =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadProjects();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadProjects();
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
    this.loadProjects();
  }

  onPriorityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterPriority.set(select.value);
    this.currentPage.set(1);
    this.loadProjects();
  }

  onSortChange(field: string) {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
    this.loadProjects();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadProjects();
  }

  goToAdd() {
    const customerId = this.filterCustomerId();
    if (customerId) {
      this.router.navigate(['/feature/pm/pmrt02/new'], {
        queryParams: { customerId },
      });
    } else {
      this.router.navigate(['/feature/pm/pmrt02/new']);
    }
  }

  goToEdit(id: string) {
    this.router.navigate(['/feature/pm/pmrt02A', id, 'edit']);
  }

  goToView(id: string) {
    this.router.navigate(['/feature/pm/pmrt02A', id, 'view']);
  }

  goBackToCustomer() {
    this.router.navigate(['/feature/pm/pmrt02']);
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Prospect: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'Contract Drafting': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Contract Signed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Requirement Gathering': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Requirement Approval': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'System Analysis': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'DFD Design': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'ER Design': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'Specification Design': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      'Specification Approval': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      Planning: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
      Development: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Internal Testing': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      UAT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Bug Fixing': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'Ready for Delivery': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Invoicing: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      Closed: 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'MA Active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || map['Prospect'];
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

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Prospect: 'โอกาส',
      'Contract Drafting': 'ร่างสัญญา',
      'Contract Signed': 'เซ็นสัญญา',
      'Requirement Gathering': 'เก็บ Requirement',
      'Requirement Approval': 'อนุมัติ Requirement',
      'System Analysis': 'วิเคราะห์ระบบ',
      'DFD Design': 'ออกแบบ DFD',
      'ER Design': 'ออกแบบ ER',
      'Specification Design': 'ออกแบบ Spec',
      'Specification Approval': 'อนุมัติ Spec',
      Planning: 'วางแผน',
      Development: 'พัฒนา',
      'Internal Testing': 'ทดสอบภายใน',
      UAT: 'ทดสอบ UAT',
      'Bug Fixing': 'แก้ไข Bug',
      'Ready for Delivery': 'พร้อมส่งมอบ',
      Delivered: 'ส่งมอบแล้ว',
      Invoicing: 'ออก Invoice',
      Closed: 'ปิดโครงการ',
      'MA Active': 'อยู่ใน MA',
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

  getProgress(used: number, budget: number): number {
    if (budget === 0) return 0;
    return Math.min(Math.round((used / budget) * 100), 100);
  }
}