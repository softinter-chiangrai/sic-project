import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { DialogService } from '../../../../core/services/dialog.service';
import { LanguageService } from '../../../../core/services/language.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { Pmdt07Service } from './pmdt07.service';
import { PmSpecificationModel } from './pmdt07.model';
import { PaginationResponse } from '../../../../core/model/pagination.model';
import { ApprovalService } from '../pmdt03/approval.service';
import { resolveRequirementId } from '../../../../core/utils/resolve-context.util';

import { environment } from '../../../../../environments/environment';
import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';
import { SicGridLoadRequest, SicGridPanelComponent, SicGridPanelConfig, SicGridPanelTemplate, SicGridRowData } from 'sic-ng';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-pmdt07',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, SicTableActionsComponent, SicComboboxComponent, SicGridPanelComponent, SicGridPanelTemplate, TranslateModule],
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
    private languageService = inject(LanguageService);
    private translate = inject(TranslateService);

    isLoading = signal(false);
    specs = signal<PmSpecificationModel[]>([]);
    totalItems = signal(0);
    currentPage = signal(1);
    pageSize = signal(10);
    searchTerm = signal('');
    filterStatus = signal('all');

    @ViewChild('grid') gridRef?: SicGridPanelComponent;

    // ===== Navbar context filter (client-side) =====
    // The resolver/handleGridLoad now always fetch ALL projects' specifications;
    // the navbar project-context selection filters what's shown, client-side.
    readonly selectedProjectIds = this.customerState.currentSelectedProjectIds;
    readonly filteredSpecs = computed(() => {
        const ids = this.selectedProjectIds();
        const all = this.specs();
        if (!ids || ids.length === 0) return all;
        const idSet = new Set(ids);
        return all.filter((s) => s.projectId && idSet.has(s.projectId));
    });

    constructor() {
        // Keep the grid in sync whenever the navbar project selection changes,
        // without refetching from the server.
        effect(() => {
            const filtered = this.filteredSpecs();
            if (!this.gridRef) return;
            this.totalItems.set(filtered.length);
            this.gridRef.setRows(filtered as unknown as SicGridRowData[], { totalElements: filtered.length });
        });
    }

    gridConfig: SicGridPanelConfig = {
        id: 'id',
        // Data is now fetched once (all projects) per load/reload and filtered+paginated
        // entirely client-side — see filteredSpecs / handleGridLoad.
        lazy: false,
        selectable: false,
        showToolbar: false,
        pageSize: this.pageSize(),
        column: [
            { label: this.translate.instant('PMDT07_COL_CODE'), name: 'specificationCode', type: 'code', minWidth: 100 },
            { label: this.translate.instant('PMDT07_COL_TITLE'), name: 'title', type: 'text', minWidth: 200 },
            { label: this.translate.instant('PMDT07_COL_TYPE'), name: 'specificationType', type: 'typeTag', minWidth: 140 },
            { label: this.translate.instant('PMDT07_COL_VERSION'), name: 'version', type: 'versionText', minWidth: 80 },
            { label: this.translate.instant('PMDT07_COL_STATUS'), name: 'status', type: 'statusBadge', minWidth: 100 },
            { label: this.translate.instant('PMDT07_COL_APPROVAL'), name: 'approvalStatus', type: 'approvalBadge', minWidth: 100 },
            { label: this.translate.instant('PMDT07_COL_MANDAY'), name: 'estimatedManday', type: 'mandayText', minWidth: 80 },
            { label: this.translate.instant('PMDT07_COL_ACTIONS'), name: 'rowActions', type: 'rowActions', align: 'center', sortable: false, minWidth: 160 },
        ],
    };

    // resolver อาจ preload ข้อมูลหน้าแรกมาให้แล้ว — ใช้แทนการยิง HTTP รอบแรกใน handleGridLoad()
    private initialResolverData: { data: PmSpecificationModel[]; totalElements: number } | null = null;

    ngOnInit(): void {
        // อ่านสถานะ filter/pagination จาก query params เพื่อคงค่าไว้เมื่อ refresh หน้า
        const qKeyword = this.route.snapshot.queryParams['q'];
        const qStatus = this.route.snapshot.queryParams['status'];
        const qPage = this.route.snapshot.queryParams['page'];
        if (qKeyword !== undefined) this.searchTerm.set(qKeyword);
        if (qStatus !== undefined) this.filterStatus.set(qStatus);
        if (qPage !== undefined) this.currentPage.set(+qPage || 1);

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
            const { data } = this.initialResolverData;
            this.initialResolverData = null;
            this.specs.set(data);
            const filtered = this.filteredSpecs();
            this.totalItems.set(filtered.length);
            grid.setRows(filtered as unknown as SicGridRowData[], { totalElements: filtered.length }, request.requestId);
            this.loadApprovalStatuses(filtered, grid, request.requestId);
            return;
        }

        this.isLoading.set(true);
        this.syncFiltersToUrl();

        // Always fetch ALL projects' specifications (no projectId filter) — the navbar
        // context-switcher filters client-side via filteredSpecs(). requirementId stays
        // server-side since it's not part of the navbar project filter.
        const requirementId = resolveRequirementId(this.route, this.customerState);
        const params = {
            requirementId: requirementId || undefined,
            keyword: this.searchTerm() || undefined,
            status: this.filterStatus() === 'all' ? undefined : this.filterStatus(),
            page: 0,
            size: 1000,
            sortBy: 'createdDate',
            sortDirection: 'desc',
        };

        this.service.getList(params)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (res: PaginationResponse<PmSpecificationModel>) => {
                    const data = res.data || [];
                    this.specs.set(data);
                    const filtered = this.filteredSpecs();
                    this.totalItems.set(filtered.length);
                    grid.setRows(filtered as unknown as SicGridRowData[], { totalElements: filtered.length }, request.requestId);
                    this.loadApprovalStatuses(filtered, grid, request.requestId);
                },
                error: () => {
                    this.dialog.error(this.translate.instant('PMDT07_LOAD_FAIL_TITLE'), this.translate.instant('PMDT07_LOAD_FAIL_MSG'));
                    this.specs.set([]);
                    this.totalItems.set(0);
                    grid.setLoadError(this.translate.instant('PMDT07_LOAD_FAIL_TITLE'), request.requestId);
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
                    const filtered = this.filteredSpecs();
                    grid.setRows(filtered as unknown as SicGridRowData[], { totalElements: filtered.length }, requestId);
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
        { value: 'Draft', text: this.translate.instant('PMDT07_STATUS_DRAFT') },
        { value: 'Review', text: this.translate.instant('PMDT07_STATUS_REVIEW') },
        { value: 'Approved', text: this.translate.instant('PMDT07_STATUS_APPROVED') },
        { value: 'Released', text: this.translate.instant('PMDT07_STATUS_RELEASED') },
        { value: 'Changed', text: this.translate.instant('PMDT07_STATUS_CHANGED') },
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
            this.dialog.warn(this.translate.instant('PMDT07_NO_SPEC_ID_TITLE'), this.translate.instant('PMDT07_PRINT_NO_ID_MSG'));
            return;
        }

        this.isLoading.set(true);
        const url = `${environment.apiBaseUrl}/api/pm/specifications/${spec.id}/export-pdf`;
        const lang = this.languageService.getCurrentLanguage();
        this.http.get(url, { params: { lang }, responseType: 'blob' })
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
                    this.dialog.error(this.translate.instant('PMDT07_PRINT_FAIL_TITLE'), this.translate.instant('PMDT07_PRINT_FAIL_MSG'));
                },
            });
    }

    deleteSpec(id: string, grid: SicGridPanelComponent): void {
        this.dialog.confirm(this.translate.instant('PMDT07_CONFIRM_DELETE_TITLE'), this.translate.instant('PMDT07_CONFIRM_DELETE_MSG'))
            .then((ok) => {
                if (ok) {
                    this.service.delete(id).subscribe({
                        next: () => {
                            this.dialog.success(this.translate.instant('PMDT07_DELETE_SUCCESS_TITLE'), this.translate.instant('PMDT07_DELETE_SUCCESS_MSG'));
                            grid.reload();
                        },
                        error: (err) => {
                            this.dialog.error(this.translate.instant('PMDT07_DELETE_FAIL_TITLE'), err.error?.message || this.translate.instant('PMDT07_GENERIC_ERROR'));
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
        if (['draft', 'ร่าง'].includes(s)) return this.translate.instant('PMDT07_STATUS_DRAFT');
        if (['review', 'in review', 'in_review', 'ตรวจสอบ', 'อยู่ระหว่างตรวจสอบ'].includes(s)) return this.translate.instant('PMDT07_STATUS_REVIEW');
        if (['approved', 'อนุมัติ', 'อนุมัติแล้ว'].includes(s)) return this.translate.instant('PMDT07_STATUS_APPROVED');
        if (['released', 'เผยแพร่'].includes(s)) return this.translate.instant('PMDT07_STATUS_RELEASED');
        if (['changed', 'เปลี่ยนแปลง'].includes(s)) return this.translate.instant('PMDT07_STATUS_CHANGED');
        if (['cancelled', 'ยกเลิก'].includes(s)) return this.translate.instant('PMDT07_STATUS_CANCELLED');
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
            PENDING: this.translate.instant('PMDT07_APPROVAL_PENDING'),
            IN_REVIEW: this.translate.instant('PMDT07_APPROVAL_IN_REVIEW'),
            APPROVED: this.translate.instant('PMDT07_STATUS_APPROVED'),
            REJECTED: this.translate.instant('PMDT07_APPROVAL_REJECTED'),
            NEED_REVISION: this.translate.instant('PMDT07_APPROVAL_NEED_REVISION'),
            CANCELLED: this.translate.instant('PMDT07_STATUS_CANCELLED'),
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