// src/app/feature/pm/dt/pmdt04/pmdt04.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import type { ApprovalStatus } from '../pmdt03/approval.model';
import { ApprovalService } from '../pmdt03/approval.service';
import { resolveProjectId } from '../../../../core/utils/resolve-context.util';

import { RequirementItem } from './pmdt04.model';


import { FormsModule } from '@angular/forms';
import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';

@Component({
  selector: 'app-pmdt04',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SicTableActionsComponent, SicComboboxComponent, SicGridPanelComponent, SicGridPanelTemplate],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './pmdt04.component.html',
})
export class Pmdt04Component implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(DialogService);
  private approvalService = inject(ApprovalService);
  private navigation = inject(NavigationService);
  public customerState = inject(CustomerStateService); // ✅ เปลี่ยนเป็น public

  // ===== State =====
  protected searchTerm = signal('');
  protected filterStatus = signal('all');
  protected currentPage = signal(1);
  protected pageSize = signal(10);
  protected isLoading = signal(false);
  protected requirements = signal<RequirementItem[]>([]);

  protected totalItems = signal(0);

  // ===== Options =====
  readonly statusOptions = [
    { value: 'Draft', text: 'ร่าง' },
    { value: 'In Review', text: 'อยู่ระหว่างตรวจสอบ' },
    { value: 'Approved', text: 'อนุมัติแล้ว' },
    { value: 'Changed', text: 'เปลี่ยนแปลง' },
    { value: 'Cancelled', text: 'ยกเลิก' },
  ];

  // ===== Grid =====
  protected gridConfig: SicGridPanelConfig = {
    id: 'id',
    selectable: false,
    showToolbar: false,
    defaultSortField: 'requirementCode',
    pageSize: this.pageSize(),
    column: [
      { label: 'รหัส', name: 'requirementCode', type: 'code', sortable: true, minWidth: 100 },
      { label: 'ชื่อ', name: 'title', type: 'text', sortable: true, minWidth: 150 },
      { label: 'โครงการ', name: 'projectName', type: 'text', sortable: true, minWidth: 120 },
      { label: 'Priority', name: 'priority', type: 'priorityBadge', sortable: true, minWidth: 80 },
      { label: 'สถานะ', name: 'status', type: 'statusBadge', sortable: true, minWidth: 100 },
      { label: 'อนุมัติ', name: 'approvalStatus', type: 'approvalBadge', minWidth: 100 },
      { label: 'เวอร์ชัน', name: 'version', type: 'text', minWidth: 100 },
      { label: 'จัดการ', name: 'rowActions', type: 'rowActions', align: 'center', minWidth: 160 },
    ],
  };

  // resolver อาจ preload ข้อมูลหน้าแรกมาให้แล้ว — ใช้แทนการยิง HTTP รอบแรกใน handleGridLoad()
  private initialResolverData: { data: RequirementItem[]; totalElements: number } | null = null;

  ngOnInit() {
    const resolved = this.route.snapshot.data['form'] || this.route.snapshot.data['pageData'];
    if (resolved && resolved.data) {
      const data = resolved.data || [];
      this.initialResolverData = { data, totalElements: resolved.pageable?.totalElements || data.length || 0 };
    }
  }

  // goToPage(1) no-op เงียบๆ ถ้า grid อยู่หน้า 1 อยู่แล้ว
  private reloadFromPage1(grid: SicGridPanelComponent): void {
    if (grid.currentPage === 1) {
      grid.reload();
    } else {
      grid.goToPage(1);
    }
  }

  // ===== Load Data =====
  handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
    if (this.initialResolverData) {
      const { data, totalElements } = this.initialResolverData;
      this.initialResolverData = null;
      this.requirements.set(data);
      this.totalItems.set(totalElements);
      grid.setRows(data as unknown as SicGridRowData[], { totalElements }, request.requestId);
      this.loadApprovalStatuses(data, grid, request.requestId);
      return;
    }

    const projectId = resolveProjectId(this.route, this.customerState);

    this.isLoading.set(true);
    this.currentPage.set(request.pageNumber);
    let params = new HttpParams()
      .set('page', request.pageNumber.toString())
      .set('size', request.pageSize.toString())
      .set('keyword', this.searchTerm() || '')
      .set('status', this.filterStatus() === 'all' ? '' : this.filterStatus())
      .set('sortBy', request.sortField ?? 'requirementCode')
      .set('sortDirection', request.sortDescending ? 'desc' : 'asc');

    if (projectId) {
      params = params.set('projectId', projectId);
    }

    this.http
      .get<any>(`${environment.apiBaseUrl}/api/pm/requirement`, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          const data = res.data || [];
          const totalElements = res.pageable?.totalElements || 0;
          this.requirements.set(data);
          this.totalItems.set(totalElements);
          grid.setRows(data as unknown as SicGridRowData[], { totalElements }, request.requestId);
          this.loadApprovalStatuses(data, grid, request.requestId);
        },
        error: () => {
          this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการ Requirement ได้');
          this.requirements.set([]);
          this.totalItems.set(0);
          grid.setLoadError('โหลดข้อมูลไม่สำเร็จ', request.requestId);
        },
      });
  }

  loadApprovalStatuses(requirements: RequirementItem[], grid: SicGridPanelComponent, requestId: number) {
    requirements.forEach((req) => {
      this.approvalService.getDocumentStatus('REQUIREMENT', req.id).subscribe({
        next: (approval) => {
          this.requirements.update((list) =>
            list.map((item) =>
              item.id === req.id ? { ...item, approvalStatus: approval.status } : item,
            ),
          );
          grid.setRows(this.requirements() as unknown as SicGridRowData[], { totalElements: this.totalItems() }, requestId);
        },
        error: () => {
          // ไม่มีสถานะอนุมัติ หรือ error – ปล่อย null
        },
      });
    });
  }

  // ===== Event Handlers =====
  onSearch(event: Event, grid: SicGridPanelComponent) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.reloadFromPage1(grid);
  }

  clearSearch(grid: SicGridPanelComponent) {
    this.searchTerm.set('');
    this.reloadFromPage1(grid);
  }

  onFilterChange(value: any, grid: SicGridPanelComponent) {
    const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
    this.filterStatus.set(val || 'all');
    this.reloadFromPage1(grid);
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
    const projectId = resolveProjectId(this.route, this.customerState);
    const requirement = this.requirements().find(r => r.id === id);
    this.navigation.navigate(['/feature/pm/matrix'], {
      queryParams: {
        requirementId: id,
        projectId: projectId,
        requirementTitle: requirement?.title || ''
      }
    });
  }

  printDocument(req: RequirementItem) {
    if (!req.id) {
      this.dialog.warn('ไม่พบรหัส Requirement', 'ไม่สามารถพิมพ์เอกสารได้');
      return;
    }

    this.isLoading.set(true);
    const url = `${environment.apiBaseUrl}/api/pm/requirement/${req.id}/export?format=pdf`;
    this.http.get(url, { responseType: 'blob' })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (!printWindow) {
            // Fallback กรณีถูกบล็อก Popup
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.target = '_blank';
            a.click();
          }
        },
        error: (err) => {
          console.error('Print requirement error:', err);
          this.dialog.error('พิมพ์เอกสารไม่สำเร็จ', 'ไม่สามารถสร้างรายงาน Jasper Report ได้');
        },
      });
  }

  deleteRequirement(id: string, grid: SicGridPanelComponent) {
    this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบ Requirement นี้ใช่หรือไม่?').then((ok) => {
      if (ok) {
        this.http.delete(`${environment.apiBaseUrl}/api/pm/requirement/${id}`).subscribe({
          next: () => {
            this.dialog.success('ลบสำเร็จ', 'Requirement ถูกลบแล้ว');
            grid.reload();
          },
          error: () => this.dialog.error('ลบไม่สำเร็จ', 'เกิดข้อผิดพลาด'),
        });
      }
    });
  }

  // ===== Utility =====
  getStatusClass(status: string): string {
    const s = (status || '').trim().toLowerCase();
    if (['draft', 'ร่าง'].includes(s)) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    if (['in review', 'in_review', 'อยู่ระหว่างตรวจสอบ'].includes(s)) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (['approved', 'อนุมัติแล้ว'].includes(s)) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (['changed', 'เปลี่ยนแปลง'].includes(s)) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    if (['cancelled', 'ยกเลิก'].includes(s)) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }

  getStatusText(status: string): string {
    const s = (status || '').trim().toLowerCase();
    if (['draft', 'ร่าง'].includes(s)) return 'ร่าง';
    if (['in review', 'in_review', 'อยู่ระหว่างตรวจสอบ'].includes(s)) return 'อยู่ระหว่างตรวจสอบ';
    if (['approved', 'อนุมัติแล้ว'].includes(s)) return 'อนุมัติแล้ว';
    if (['changed', 'เปลี่ยนแปลง'].includes(s)) return 'เปลี่ยนแปลง';
    if (['cancelled', 'ยกเลิก'].includes(s)) return 'ยกเลิก';
    return status || '-';
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