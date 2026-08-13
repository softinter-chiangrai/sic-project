// src/app/feature/pm/dt/pmdt04/pmdt04.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import type { ApprovalStatus } from '../pmdt03/approval.model';
import { ApprovalService } from '../pmdt03/approval.service';

import { RequirementItem } from './pmdt04.model';


import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';

@Component({
  selector: 'app-pmdt04',
  standalone: true,
  imports: [CommonModule, RouterModule, SicTableActionsComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pmdt04.component.html',
})
export class Pmdt04Component implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private approvalService = inject(ApprovalService);
  private navigation = inject(NavigationService);
  public customerState = inject(CustomerStateService); // ✅ เปลี่ยนเป็น public

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected sortBy = signal('requirementCode');
  protected sortDir = signal<'asc' | 'desc'>('asc');
  protected isLoading = signal(false);
  protected requirements = signal<RequirementItem[]>([]);

  protected totalItems = signal(0);

  // ===== Computed =====
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
    const resolved = this.route.snapshot.data['form'] || this.route.snapshot.data['pageData'];
    if (resolved && resolved.data) {
      const data = resolved.data || [];
      this.requirements.set(data);
      this.totalItems.set(resolved.totalElements || data.length || 0);
      this.loadApprovalStatuses(data);
    } else {
      this.loadRequirements();
    }
  }

  // ===== Load Data =====
  loadRequirements() {
    const projectId = this.customerState.getProjectId();
    if (!projectId) {
      this.dialog.warn('กรุณาเลือกโครงการ', 'กรุณาเลือกโครงการก่อนเข้าหน้านี้');
      this.navigation.navigate(['/feature/pm/pmrt02']);
      return;
    }

    this.isLoading.set(true);
    const params = new HttpParams()
      .set('page', (this.currentPage() - 1).toString())
      .set('size', this.pageSize().toString())
      .set('keyword', this.searchTerm() || '')
      .set('status', this.filterStatus() === 'all' ? '' : this.filterStatus())
      .set('sortBy', this.sortBy())
      .set('sortDir', this.sortDir())
      .set('projectId', projectId);

    this.http
      .get<any>(`${environment.apiBaseUrl}/api/pm/requirement`, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          const data = res.data || [];
          this.requirements.set(data);
          this.totalItems.set(res.totalElements || 0);
          this.loadApprovalStatuses(data);
        },
        error: () => {
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการ Requirement ได้');
          this.requirements.set([]);
          this.totalItems.set(0);
        },
      });
  }

  loadApprovalStatuses(requirements: RequirementItem[]) {

    requirements.forEach((req) => {
      this.approvalService.getDocumentStatus('REQUIREMENT', req.id).subscribe({
        next: (approval) => {
          this.requirements.update((list) =>
            list.map((item) =>
              item.id === req.id ? { ...item, approvalStatus: approval.status } : item,
            ),
          );
        },
        error: () => {
          // ไม่มีสถานะอนุมัติ หรือ error – ปล่อย null
        },
      });
    });
  }

  // ===== Event Handlers =====
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadRequirements();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadRequirements();
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
    this.currentPage.set(1);
    this.loadRequirements();
  }

  onSortChange(field: string) {
    if (this.sortBy() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDir.set('asc');
    }
    this.loadRequirements();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadRequirements();
  }

  // ===== Navigation =====
  goToAdd() {
    this.navigation.navigate(['/feature/pm/requirement/new']);
  }

  goToEdit(id: string) {
    this.navigation.navigate(['/feature/pm/requirement', id, 'edit']);
  }

  goToViewOnly(id: string) {
    this.navigation.navigate(['/feature/pm/requirement', id, 'view']);
  }

  goToView(id: string) {
    const projectId = this.customerState.getProjectId();
    const requirement = this.requirements().find(r => r.id === id);
    this.navigation.navigate(['/feature/pm/pmrt05'], {
      queryParams: {
        requirementId: id,
        projectId: projectId,
        requirementTitle: requirement?.title || ''
      }
    });
  }

  printDocument(req: RequirementItem) {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      this.dialog.warn('เปิดหน้าพิมพ์ไม่สำเร็จ', 'กรุณาอนุญาต Pop-up บนบราวเซอร์');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Requirement - ${req.requirementCode || ''}</title>
        <style>
          body { font-family: 'Sarabun', sans-serif; padding: 24px; color: #333; line-height: 1.6; }
          h1 { font-size: 20px; border-bottom: 2px solid #ddd; padding-bottom: 8px; margin-bottom: 16px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .info-table td { padding: 8px 12px; border: 1px solid #eee; }
          .info-table td.label { font-weight: bold; background-color: #f9f9f9; width: 25%; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .content { font-size: 14px; margin-top: 16px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>[${req.requirementCode || '-'}] ${req.title || 'Requirement Detail'}</h1>
        <table class="info-table">
          <tr>
            <td class="label">รหัสเอกสาร</td>
            <td>${req.requirementCode || '-'}</td>
            <td class="label">เวอร์ชัน</td>
            <td>${req.version || '1.0'}</td>
          </tr>
          <tr>
            <td class="label">ชื่อโครงการ</td>
            <td>${req.projectName || '-'}</td>
            <td class="label">ผู้สร้าง</td>
            <td>${req.createdBy || '-'}</td>
          </tr>
          <tr>
            <td class="label">ความสำคัญ (Priority)</td>
            <td>${req.priority || '-'}</td>
            <td class="label">สถานะ</td>
            <td>${req.status || '-'}</td>
          </tr>
        </table>
        <div class="content">
          <h3>รายละเอียด</h3>
          <div>${req.description || '-'}</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }

  deleteRequirement(id: string) {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบ Requirement นี้ใช่หรือไม่?').then((ok) => {
      if (ok) {
        this.http.delete(`${environment.apiBaseUrl}/api/pm/requirement/${id}`).subscribe({
          next: () => {
            this.dialog.success('ลบสำเร็จ', 'Requirement ถูกลบแล้ว');
            this.loadRequirements();
          },
          error: () => this.dialog.error('ลบไม่สำเร็จ', 'เกิดข้อผิดพลาด'),
        });
      }
    });
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      'In Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      Changed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || map['Draft'];
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Draft: 'ร่าง',
      'In Review': 'อยู่ระหว่างตรวจสอบ',
      Approved: 'อนุมัติแล้ว',
      Changed: 'เปลี่ยนแปลง',
      Cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      Must: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Should: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Could: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      "Won't": 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return map[priority] || map["Won't"];
  }

  getApprovalStatusClass(status?: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      NEED_REVISION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return status ? map[status] || 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-600';
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
}