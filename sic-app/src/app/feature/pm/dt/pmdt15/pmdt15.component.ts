import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { Pmdt15AService } from './pmdt15A/pmdt15A.service';
import { PmUserManualModel } from './pmdt15A/pmdt15A.model';
import { DialogService } from '../../../../core/services/dialog.service';
import { apiBaseUrl } from '../../../../core/config/api.config';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { ApprovalService } from '../pmdt03/approval.service';

@Component({
  selector: 'app-pmdt15',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicTableActionsComponent, SicComboboxComponent],
  templateUrl: './pmdt15.component.html',
  styleUrls: ['./pmdt15.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt15Component implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(Pmdt15AService);
  private readonly dialog = inject(DialogService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly http = inject(HttpClient);
  private readonly approvalService = inject(ApprovalService);

  manuals = signal<PmUserManualModel[]>([]);
  isLoading = signal(false);
  totalElements = signal(0);
  page = signal(0);
  size = signal(50);
  projectId = signal<string | null>(null);

  searchTerm = signal('');
  filterType = signal('');
  filterStatus = signal('');

  typeFilterOptions = [
    { label: 'User Manual (คู่มือผู้ใช้ทั่วไป)', value: 'USER' },
    { label: 'Admin Manual (คู่มือผู้ดูแลระบบ)', value: 'ADMIN' },
    { label: 'Installation Manual (คู่มือการติดตั้ง)', value: 'INSTALLATION' },
    { label: 'Operation Manual (คู่มือการปฏิบัติงาน)', value: 'OPERATION' },
  ];

  statusFilterOptions = [
    { label: 'ฉบับร่าง (Draft)', value: 'DRAFT' },
    { label: 'รอตรวจสอบ (Review)', value: 'REVIEW' },
    { label: 'อนุมัติแล้ว (Approved)', value: 'APPROVED' },
    { label: 'เผยแพร่แล้ว (Published)', value: 'PUBLISHED' },
  ];

  filteredManuals = computed(() => {
    let list = this.manuals();
    const search = this.searchTerm().trim().toLowerCase();
    const type = this.filterType();
    const status = this.filterStatus();

    if (search) {
      list = list.filter(
        (m) =>
          (m.manualCode && m.manualCode.toLowerCase().includes(search)) ||
          (m.manualTitle && m.manualTitle.toLowerCase().includes(search))
      );
    }

    if (type) {
      list = list.filter((m) => m.manualType === type);
    }

    if (status) {
      list = list.filter((m) => m.status === status);
    }

    return list;
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const qProjectId = params['projectId'];
      this.projectId.set(qProjectId || null);
      this.loadData();
      this.cdr.markForCheck();
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service
      .getPaging({
        projectId: this.projectId() || undefined,
        page: this.page(),
        size: this.size(),
      })
      .subscribe({
        next: (res) => {
          const items = res.content || [];
          this.manuals.set(items);
          this.totalElements.set(res.totalElements || 0);
          this.isLoading.set(false);
          this.loadApprovalStatuses(items);
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  loadApprovalStatuses(manuals: PmUserManualModel[]): void {
    manuals.forEach((manual) => {
      if (!manual.id) return;
      this.approvalService.getDocumentStatus('USER_MANUAL', manual.id).subscribe({
        next: (approval) => {
          this.manuals.update((list) =>
            list.map((item) =>
              item.id === manual.id ? { ...item, approvalStatus: approval.status } : item
            )
          );
          this.cdr.markForCheck();
        },
        error: () => {
          // No approval status yet
        },
      });
    });
  }

  goToAdd(): void {
    const queryParams: any = {};
    if (this.projectId()) {
      queryParams.projectId = this.projectId();
    }
    this.router.navigate(['/feature/pm/manual/new'], { queryParams });
  }

  goToView(id: string): void {
    const queryParams: any = { mode: 'view' };
    if (this.projectId()) {
      queryParams.projectId = this.projectId();
    }
    this.router.navigate(['/feature/pm/manual', id, 'edit'], { queryParams });
  }

  goToEdit(id: string): void {
    const queryParams: any = {};
    if (this.projectId()) {
      queryParams.projectId = this.projectId();
    }
    this.router.navigate(['/feature/pm/manual', id, 'edit'], { queryParams });
  }

  goBack(): void {
    if (this.projectId()) {
      this.router.navigate(['/feature/pm/project-dashboard'], {
        queryParams: { projectId: this.projectId() },
      });
    } else {
      this.router.navigate(['/feature/pm/project']);
    }
  }

  onDelete(id: string): void {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบระบุคู่มือนี้ใช่หรือไม่?').then((confirmed: boolean) => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.dialog.success('สำเร็จ', 'ลบคู่มือเรียบร้อยแล้ว');
            this.loadData();
          },
          error: (err) => {
            this.dialog.error('ข้อผิดพลาด', err.message || 'ไม่สามารถลบข้อมูลได้');
          },
        });
      }
    });
  }

  printManual(item: PmUserManualModel): void {
    if (!item.id) {
      this.dialog.warn('ไม่พบรหัสคู่มือ', 'ไม่สามารถพิมพ์เอกสารได้');
      return;
    }

    this.isLoading.set(true);
    const url = `${apiBaseUrl}/api/pm/manual/${item.id}/export-pdf`;
    this.http.get(url, { responseType: 'blob' })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (!printWindow) {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = `user-manual-${item.manualCode || item.id}.pdf`;
            a.target = '_blank';
            a.click();
          }
        },
        error: (err) => {
          console.error('Print user manual error:', err);
          this.dialog.error('พิมพ์เอกสารไม่สำเร็จ', 'ไม่สามารถสร้างรายงาน Jasper Report ได้: ' + (err?.error?.message || err?.message || ''));
        },
      });
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      USER: 'User Manual',
      ADMIN: 'Admin Manual',
      INSTALLATION: 'Installation Manual',
      OPERATION: 'Operation Manual',
    };
    return map[type] || type || '-';
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      APPROVED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };
    return map[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'ฉบับร่าง (Draft)',
      REVIEW: 'รอตรวจสอบ (Review)',
      APPROVED: 'อนุมัติแล้ว (Approved)',
      PUBLISHED: 'เผยแพร่แล้ว (Published)',
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
    return status ? map[status.toUpperCase()] || status : '-';
  }
}

export default Pmdt15Component;