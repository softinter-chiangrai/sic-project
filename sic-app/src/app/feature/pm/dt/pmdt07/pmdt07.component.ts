// src/app/feature/pm/dt/pmdt07/pmdt07.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';

interface ChangeRequest {
  id: string;
  changeDescription: string;
  impactSummary: string;
  estimatedManday: number;
  status: string;
  requirementId: string;
  requirementCode: string;
  projectId: string;
  projectName?: string;
  createdDate: string;
}

@Component({
  selector: 'app-pmdt07',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmdt07.component.html',
})
export class Pmdt07Component implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private baseUrl = environment.apiBaseUrl + '/api/pm/change-requests';

  // ใช้ Math ใน template
  readonly Math = Math;

  // State
  isLoading = signal(false);
  changeRequests = signal<ChangeRequest[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  filterStatus = signal('all');
  projectId = signal<string | null>(null);

  // Computed
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));
  hasPrevious = computed(() => this.currentPage() > 1);
  hasNext = computed(() => this.currentPage() < this.totalPages());

  pageNumbers = computed(() => {
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

  ngOnInit() {
    this.route.queryParams.subscribe((queryParams) => {
      this.projectId.set(queryParams['projectId'] || null);
      this.loadChangeRequests();
    });
  }

  loadChangeRequests() {
    this.isLoading.set(true);
    let params = new HttpParams()
      .set('page', (this.currentPage() - 1).toString())
      .set('size', this.pageSize().toString())
      .set('keyword', this.searchTerm() || '')
      .set('status', this.filterStatus() === 'all' ? '' : this.filterStatus());

    if (this.projectId()) {
      params = params.set('projectId', this.projectId()!);
    }

    this.http
      .get<any>(this.baseUrl, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.changeRequests.set(res.data || []);
          this.totalItems.set(res.pageable?.totalElements || 0);
        },
        error: () =>
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการ Change Request ได้'),
      });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadChangeRequests();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadChangeRequests();
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
    this.loadChangeRequests();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadChangeRequests();
  }

  goToAdd() {
    if (this.projectId()) {
      this.navigation.navigate(['/feature/pm/pmdt07/new'], {
        queryParams: { projectId: this.projectId() },
      });
    } else {
      this.navigation.navigate(['/feature/pm/pmdt07/new']);
    }
  }

  goToEdit(id: string) {
    this.navigation.navigate(['/feature/pm/pmdt07', id, 'edit']);
  }

  goToImpact(id: string) {
    this.navigation.navigate(['/feature/pm/pmdt07', id, 'impact']);
  }

  deleteChangeRequest(id: string) {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบ Change Request นี้ใช่หรือไม่?').then((ok) => {
      if (ok) {
        this.http.delete(`${this.baseUrl}/${id}`).subscribe({
          next: () => {
            this.dialog.success('ลบสำเร็จ', 'Change Request ถูกลบแล้ว');
            this.loadChangeRequests();
          },
          error: () => this.dialog.error('ลบไม่สำเร็จ', 'เกิดข้อผิดพลาด'),
        });
      }
    });
  }

  // ✅ ปรับ getStatusClass ให้ครอบคลุมสถานะทั้งหมด
  getStatusClass(status: string): string {
    if (!status) return 'bg-gray-100 text-gray-600';
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600',
      DRAFT: 'bg-gray-100 text-gray-600',
      Submitted: 'bg-blue-100 text-blue-700',
      SUBMITTED: 'bg-blue-100 text-blue-700',
      'In Review': 'bg-blue-100 text-blue-700',
      IN_REVIEW: 'bg-blue-100 text-blue-700',
      Pending: 'bg-yellow-100 text-yellow-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      Approved: 'bg-emerald-100 text-emerald-700',
      APPROVED: 'bg-emerald-100 text-emerald-700',
      Rejected: 'bg-red-100 text-red-700',
      REJECTED: 'bg-red-100 text-red-700',
      Implemented: 'bg-purple-100 text-purple-700',
      IMPLEMENTED: 'bg-purple-100 text-purple-700',
      'Need Revision': 'bg-orange-100 text-orange-700',
      NEED_REVISION: 'bg-orange-100 text-orange-700',
      Cancelled: 'bg-gray-300 text-gray-700',
      CANCELLED: 'bg-gray-300 text-gray-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  }

  // ✅ ปรับ getStatusText ให้ครอบคลุมสถานะทั้งหมด และเปลี่ยน Submitted เป็น รออนุมัติ
  getStatusText(status: string): string {
    if (!status) return 'ร่าง';
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      DRAFT: 'ร่าง',
      Submitted: 'รออนุมัติ',
      SUBMITTED: 'รออนุมัติ',
      'In Review': 'อยู่ระหว่างตรวจสอบ',
      IN_REVIEW: 'อยู่ระหว่างตรวจสอบ',
      Pending: 'รอดำเนินการ',
      PENDING: 'รอดำเนินการ',
      Approved: 'อนุมัติ',
      APPROVED: 'อนุมัติ',
      Rejected: 'ปฏิเสธ',
      REJECTED: 'ปฏิเสธ',
      Implemented: 'ดำเนินการแล้ว',
      IMPLEMENTED: 'ดำเนินการแล้ว',
      'Need Revision': 'ต้องแก้ไข',
      NEED_REVISION: 'ต้องแก้ไข',
      Cancelled: 'ยกเลิก',
      CANCELLED: 'ยกเลิก',
    };
    return map[status] || status;
  }
}