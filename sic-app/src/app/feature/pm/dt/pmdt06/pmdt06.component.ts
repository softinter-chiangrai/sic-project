// src/app/feature/pm/dt/pmdt07/pmdt07.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';

import { ChangeRequestService } from './change-request.service';
import { ApprovalService } from '../pmdt03/approval.service';

import { CrAssignee, ChangeImpact, ChangeRequestItem } from './pmdt06.model';

import { FormsModule } from '@angular/forms';
import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicStripHtmlPipe } from '../../../../core/pipes/sic-strip-html.pipe';

@Component({
  selector: 'app-pmdt06',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SicTableActionsComponent,
    SicComboboxComponent,
    SicStripHtmlPipe,
  ],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './pmdt06.component.html',
})
export class Pmdt06Component implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private navigation = inject(NavigationService);
  private crService = inject(ChangeRequestService);
  private approvalService = inject(ApprovalService);
  private baseUrl = environment.apiBaseUrl + '/api/pm/change-requests';

  // ใช้ Math ใน template
  readonly Math = Math;

  // State
  isLoading = signal(false);
  changeRequests = signal<ChangeRequestItem[]>([]);

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
          const data = res.data || [];
          this.changeRequests.set(data);
          this.totalItems.set(res.pageable?.totalElements || 0);
          this.loadApprovalStatuses(data);
        },
        error: () =>
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการ Change Request ได้'),
      });
  }

  loadApprovalStatuses(crs: ChangeRequestItem[]) {
    crs.forEach((cr) => {
      if (!cr.id) return;
      this.approvalService.getDocumentStatus('CHANGE_REQUEST', cr.id).subscribe({
        next: (approval) => {
          this.changeRequests.update((list) =>
            list.map((item) =>
              item.id === cr.id ? { ...item, approvalStatus: approval.status } : item
            )
          );
        },
        error: () => {
          // ไม่มีสถานะอนุมัติ ปล่อย null
        },
      });
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

  // Options
  readonly statusOptions = [
    { value: 'Draft', text: 'ร่าง' },
    { value: 'Submitted', text: 'รออนุมัติ' },
    { value: 'Approved', text: 'อนุมัติ' },
    { value: 'Rejected', text: 'ปฏิเสธ' },
    { value: 'Implemented', text: 'ดำเนินการแล้ว' },
  ];

  onFilterChange(value: any) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
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
      this.navigation.navigate(['/feature/pm/change-request/new'], {
        queryParams: { projectId: this.projectId() },
      });
    } else {
      this.navigation.navigate(['/feature/pm/change-request/new']);
    }
  }

  goToEdit(id: string) {
    this.navigation.navigate(['/feature/pm/change-request', id, 'edit']);
  }

  goToView(id: string) {
    this.navigation.navigate(['/feature/pm/change-request', id, 'view']);
  }

  exportPdf(id: string) {
    if (!id) return;
    this.isLoading.set(true);
    this.crService.exportPdf(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (!printWindow) {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.target = '_blank';
            a.click();
          }
        },
        error: (err) => {
          console.error('Print change request error:', err);
          this.dialog.error('พิมพ์เอกสารไม่สำเร็จ', 'ไม่สามารถสร้างรายงาน PDF ได้');
        },
      });
  }

  goToImpact(id: string) {
    this.navigation.navigate(['/feature/pm/change-request', id, 'edit'], {
      queryParams: { showImpact: true } // optional
    });
  }

  // ✅ ไปที่หน้า Approval Center
  goToApproval(crId: string) {
    this.router.navigate(['/feature/pm/approval', crId]);
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

  // ===== CRUD Actions (เฉพาะที่เกี่ยวข้องกับสถานะ CR โดยตรง) =====

  submitRequest(id: string) {
    this.crService.submitForApproval(id).subscribe({
      next: () => {
        this.dialog.success('สำเร็จ', 'ส่งขออนุมัติเรียบร้อยแล้ว');
        this.loadChangeRequests();
      },
      error: (err) => this.dialog.error('เกิดข้อผิดพลาด', err.error?.message || 'ไม่สามารถส่งขออนุมัติได้')
    });
  }

  implementRequest(id: string) {
    this.crService.implement(id).subscribe({
      next: () => {
        this.dialog.success('สำเร็จ', 'ดำเนินการแก้ไขและปิด Change Request เรียบร้อยแล้ว');
        this.loadChangeRequests();
      },
      error: (err) => this.dialog.error('เกิดข้อผิดพลาด', err.error?.message || 'ไม่สามารถปิด Change Request ได้')
    });
  }

  completeAssigneeTask(id: string, userId: string, targetId: string) {
    this.crService.markAssigneeComplete(id, userId, targetId).subscribe({
      next: () => {
        this.dialog.success('สำเร็จ', 'ยืนยันการแก้ไขเสร็จสิ้นเรียบร้อย');
        this.loadChangeRequests();
      },
      error: (err) => this.dialog.error('เกิดข้อผิดพลาด', err.error?.message || 'ไม่สามารถยืนยันการแก้ไขได้')
    });
  }

  // ===== Helper =====

  getTargetTypeText(type?: string): string {
    if (!type) return '-';
    const map: Record<string, string> = {
      REQUIREMENT: 'ความต้องการ (Requirement)',
      SPECIFICATION: 'ข้อกำหนด (Specification)',
      TASK: 'งาน (Task)',
      DFD: 'DFD',
      ER: 'ER Diagram',
    };
    return map[type.toUpperCase()] || type;
  }

  getTargetTypeBadgeClass(type?: string): string {
    if (!type) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    const map: Record<string, string> = {
      REQUIREMENT: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
      SPECIFICATION: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
      TASK: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    };
    return map[type.toUpperCase()] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
  }

  getStatusClass(status: string): string {
    if (!status) return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
    const s = status.toUpperCase();
    const map: Record<string, string> = {
      DRAFT: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20',
      SUBMITTED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      IN_REVIEW: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      'IN REVIEW': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      APPROVED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      REJECTED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      IMPLEMENTED: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      NEED_REVISION: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
      'NEED REVISION': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
      CANCELLED: 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20',
    };
    return map[s] || 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20';
  }

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

  getApprovalStatusClass(status?: string): string {
    if (!status) return 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20';
    const s = status.toUpperCase();
    const map: Record<string, string> = {
      PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      APPROVED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      REJECTED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
      NEED_REVISION: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
      CANCELLED: 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20',
    };
    return map[s] || 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20';
  }

  getApprovalStatusText(status?: string): string {
    const map: Record<string, string> = {
      PENDING: 'รออนุมัติ',
      APPROVED: 'อนุมัติแล้ว',
      REJECTED: 'ปฏิเสธ',
      NEED_REVISION: 'ต้องแก้ไข',
      CANCELLED: 'ยกเลิก',
    };
    return status ? map[status] || '-' : '-';
  }
}