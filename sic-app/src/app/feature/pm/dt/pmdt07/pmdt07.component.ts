import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { Pmdt07Service } from './pmdt07.service';
import { PmSpecificationModel } from './pmdt07.model';
import { PaginationResponse } from '../../../../core/model/pagination.model';
import { ApprovalService } from '../pmdt03/approval.service';
import { resolveProjectId, resolveRequirementId } from '../../../../core/utils/resolve-context.util';

import { environment } from '../../../../../environments/environment';
import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridRowData } from 'sic-ng';

@Component({
    selector: 'app-pmdt07',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, SicTableActionsComponent, SicComboboxComponent, SicGridPanelComponent],
    templateUrl: './pmdt07.component.html',
    changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt07Component implements OnInit {
    private route = inject(ActivatedRoute);
    public service = inject(Pmdt07Service);
    private router = inject(Router);
    private dialog = inject(DialogService);
    private navigation = inject(NavigationService);
    public customerState = inject(CustomerStateService);
    private approvalService = inject(ApprovalService);
    private http = inject(HttpClient);

    isLoading = signal(false);
    specs = signal<PmSpecificationModel[]>([]);
    totalItems = signal(0);
    currentPage = signal(1);
    pageSize = signal(10);
    searchTerm = signal('');
    filterStatus = signal('all');

    gridConfig: SicGridPanelConfig = {
        id: 'id',
        selectable: false,
        showToolbar: false,
        pageSize: this.pageSize(),
        column: [
            { label: 'รหัส', name: 'specificationCode', type: 'code', minWidth: 100 },
            { label: 'ชื่อเรื่อง', name: 'title', type: 'text', minWidth: 200 },
            { label: 'ประเภท', name: 'specificationType', type: 'typeTag', minWidth: 140 },
            { label: 'เวอร์ชัน', name: 'version', type: 'versionText', minWidth: 80 },
            { label: 'สถานะ', name: 'status', type: 'statusBadge', minWidth: 100 },
            { label: 'อนุมัติ', name: 'approvalStatus', type: 'approvalBadge', minWidth: 100 },
            { label: 'Manday', name: 'estimatedManday', type: 'mandayText', minWidth: 80 },
            { label: 'จัดการ', name: 'rowActions', type: 'rowActions', align: 'center', minWidth: 160 },
        ],
    };

    // resolver อาจ preload ข้อมูลหน้าแรกมาให้แล้ว — ใช้แทนการยิง HTTP รอบแรกใน handleGridLoad()
    private initialResolverData: { data: PmSpecificationModel[]; totalElements: number } | null = null;

    ngOnInit(): void {
        const qReqId = this.route.snapshot.queryParams['requirementId'];
        const qProjId = this.route.snapshot.queryParams['projectId'];
        if (qReqId) {
            this.customerState.setRequirement(qReqId);
        }
        if (qProjId) {
            this.customerState.setProject(qProjId);
        }

        // อ่านสถานะ filter/pagination จาก query params เพื่อคงค่าไว้เมื่อ refresh หน้า
        const qKeyword = this.route.snapshot.queryParams['q'];
        const qStatus = this.route.snapshot.queryParams['status'];
        const qPage = this.route.snapshot.queryParams['page'];
        if (qKeyword !== undefined) this.searchTerm.set(qKeyword);
        if (qStatus !== undefined) this.filterStatus.set(qStatus);
        if (qPage !== undefined) this.currentPage.set(+qPage || 1);

        if (qReqId || qProjId) {
            // ล้าง requirementId/projectId ออกจาก URL แต่คงค่า q/status/page ไว้
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {
                    q: qKeyword !== undefined ? qKeyword : null,
                    status: qStatus !== undefined ? qStatus : null,
                    page: qPage !== undefined ? qPage : null,
                },
                replaceUrl: true,
            });
        }

        const resolved = this.route.snapshot.data['form'] || this.route.snapshot.data['pageData'];
        if (resolved && resolved.data) {
            const data = resolved.data || [];
            this.initialResolverData = { data, totalElements: resolved.pageable?.totalElements || data.length || 0 };
        }
    }

    // ===== URL State Sync =====
    private syncFiltersToUrl(): void {
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

    // goToPage(1) no-op เงียบๆ ถ้า grid อยู่หน้า 1 อยู่แล้ว
    private reloadFromPage1(grid: SicGridPanelComponent): void {
        if (grid.currentPage === 1) {
            grid.reload();
        } else {
            grid.goToPage(1);
        }
    }

    handleGridLoad(request: SicGridLoadRequest, grid: SicGridPanelComponent): void {
        if (this.initialResolverData) {
            const { data, totalElements } = this.initialResolverData;
            this.initialResolverData = null;
            this.specs.set(data);
            this.totalItems.set(totalElements);
            grid.setRows(data as unknown as SicGridRowData[], { totalElements }, request.requestId);
            this.loadApprovalStatuses(data, grid, request.requestId);
            return;
        }

        this.isLoading.set(true);
        this.currentPage.set(request.pageNumber);
        this.syncFiltersToUrl();

        const requirementId = resolveRequirementId(this.route, this.customerState);
        const projectId = resolveProjectId(this.route, this.customerState);
        const params = {
            projectId: projectId || undefined,
            requirementId: requirementId || undefined,
            keyword: this.searchTerm() || undefined,
            status: this.filterStatus() === 'all' ? undefined : this.filterStatus(),
            page: request.pageNumber,
            size: request.pageSize,
            sortBy: 'createdDate',
            sortDirection: 'desc',
        };

        this.service.getList(params)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (res: PaginationResponse<PmSpecificationModel>) => {
                    const data = res.data || [];
                    const totalElements = res.pageable?.totalElements || 0;
                    this.specs.set(data);
                    this.totalItems.set(totalElements);
                    grid.setRows(data as unknown as SicGridRowData[], { totalElements }, request.requestId);
                    this.loadApprovalStatuses(data, grid, request.requestId);
                },
                error: () => {
                    this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการ Specification ได้');
                    this.specs.set([]);
                    this.totalItems.set(0);
                    grid.setLoadError('โหลดข้อมูลไม่สำเร็จ', request.requestId);
                },
            });
    }

    loadApprovalStatuses(specifications: PmSpecificationModel[], grid: SicGridPanelComponent, requestId: number): void {
        specifications.forEach((spec) => {
            if (!spec.id) return;
            this.approvalService.getDocumentStatus('SPECIFICATION', spec.id).subscribe({
                next: (approval) => {
                    this.specs.update((list) =>
                        list.map((item) =>
                            item.id === spec.id ? { ...item, approvalStatus: approval.status } : item
                        )
                    );
                    grid.setRows(this.specs() as unknown as SicGridRowData[], { totalElements: this.totalItems() }, requestId);
                },
                error: () => {
                    // ไม่มีสถานะอนุมัติ ปล่อย null
                },
            });
        });
    }

    onSearch(event: Event, grid: SicGridPanelComponent): void {
        const input = event.target as HTMLInputElement;
        this.searchTerm.set(input.value);
        this.reloadFromPage1(grid);
    }

    clearSearch(grid: SicGridPanelComponent): void {
        this.searchTerm.set('');
        this.reloadFromPage1(grid);
    }

    readonly statusOptions = [
        { value: 'Draft', text: 'ร่าง' },
        { value: 'Review', text: 'ตรวจสอบ' },
        { value: 'Approved', text: 'อนุมัติแล้ว' },
        { value: 'Released', text: 'เผยแพร่' },
        { value: 'Changed', text: 'เปลี่ยนแปลง' },
    ];

    onFilterChange(value: any, grid: SicGridPanelComponent): void {
        const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
        this.filterStatus.set(val || 'all');
        this.reloadFromPage1(grid);
    }

    goToAdd(): void {
        this.navigation.navigate(['/feature/pm/specification/new']);
    }

    goToEdit(id: string): void {
        this.navigation.navigate(['/feature/pm/specification', id, 'edit']);
    }

    goToView(id: string): void {
        this.navigation.navigate(['/feature/pm/specification', id, 'view']);
    }

    printDocument(spec: PmSpecificationModel): void {
        if (!spec.id) {
            this.dialog.warn('ไม่พบรหัส Specification', 'ไม่สามารถพิมพ์เอกสารได้');
            return;
        }

        this.isLoading.set(true);
        const url = `${environment.apiBaseUrl}/api/pm/specifications/${spec.id}/export-pdf`;
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
                        a.target = '_blank';
                        a.click();
                    }
                },
                error: (err) => {
                    console.error('Print specification error:', err);
                    this.dialog.error('พิมพ์เอกสารไม่สำเร็จ', 'ไม่สามารถสร้างรายงาน Jasper Report ได้');
                },
            });
    }

    deleteSpec(id: string, grid: SicGridPanelComponent): void {
        this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบ Specification นี้ใช่หรือไม่?')
            .then((ok) => {
                if (ok) {
                    this.service.delete(id).subscribe({
                        next: () => {
                            this.dialog.success('ลบสำเร็จ', 'Specification ถูกลบแล้ว');
                            grid.reload();
                        },
                        error: (err) => {
                            this.dialog.error('ลบไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
                        },
                    });
                }
            });
    }

    getStatusClass(status: string): string {
        const s = (status || '').trim().toLowerCase();
        if (['draft', 'ร่าง'].includes(s)) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
        if (['review', 'in review', 'in_review', 'ตรวจสอบ', 'อยู่ระหว่างตรวจสอบ'].includes(s)) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        if (['approved', 'อนุมัติ', 'อนุมัติแล้ว'].includes(s)) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        if (['released', 'เผยแพร่'].includes(s)) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        if (['changed', 'เปลี่ยนแปลง'].includes(s)) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        if (['cancelled', 'ยกเลิก'].includes(s)) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }

    getStatusText(status: string): string {
        const s = (status || '').trim().toLowerCase();
        if (['draft', 'ร่าง'].includes(s)) return 'ร่าง';
        if (['review', 'in review', 'in_review', 'ตรวจสอบ', 'อยู่ระหว่างตรวจสอบ'].includes(s)) return 'ตรวจสอบ';
        if (['approved', 'อนุมัติ', 'อนุมัติแล้ว'].includes(s)) return 'อนุมัติแล้ว';
        if (['released', 'เผยแพร่'].includes(s)) return 'เผยแพร่';
        if (['changed', 'เปลี่ยนแปลง'].includes(s)) return 'เปลี่ยนแปลง';
        if (['cancelled', 'ยกเลิก'].includes(s)) return 'ยกเลิก';
        return status || '-';
    }

    getApprovalStatusClass(status?: string): string {
        const s = (status || '').trim().toUpperCase();
        const map: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            IN_REVIEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            NEED_REVISION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        };
        return map[s] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }

    getApprovalStatusText(status?: string): string {
        const s = (status || '').trim().toUpperCase();
        const map: Record<string, string> = {
            PENDING: 'รออนุมัติ',
            IN_REVIEW: 'อยู่ระหว่างตรวจสอบ',
            APPROVED: 'อนุมัติแล้ว',
            REJECTED: 'ปฏิเสธ',
            NEED_REVISION: 'ต้องแก้ไข',
            CANCELLED: 'ยกเลิก',
        };
        return map[s] || status || '-';
    }

    formatDate(dateStr: string): string {
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
}