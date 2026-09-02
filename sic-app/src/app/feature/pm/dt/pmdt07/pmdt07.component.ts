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

import { environment } from '../../../../../environments/environment';
import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';

@Component({
    selector: 'app-pmdt07',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, SicTableActionsComponent, SicComboboxComponent],
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

    Math = Math;

    ngOnInit(): void {
        const qReqId = this.route.snapshot.queryParams['requirementId'];
        const qProjId = this.route.snapshot.queryParams['projectId'];
        if (qReqId) {
            this.customerState.setRequirement(qReqId);
        }
        if (qProjId) {
            this.customerState.setProject(qProjId);
        }

        if (qReqId || qProjId) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {},
                replaceUrl: true,
            });
        }

        const resolved = this.route.snapshot.data['form'] || this.route.snapshot.data['pageData'];
        if (resolved && resolved.data) {
            const data = resolved.data || [];
            this.specs.set(data);
            this.totalItems.set(resolved.pageable?.totalElements || data.length || 0);
            this.loadApprovalStatuses(data);
        } else {
            this.loadData();
        }
    }

    loadData(): void {
        this.isLoading.set(true);
        const requirementId = this.customerState.getRequirementId();
        const projectId = this.customerState.getProjectId();
        const params = {
            projectId: projectId || undefined,
            requirementId: requirementId || undefined,
            keyword: this.searchTerm() || undefined,
            status: this.filterStatus() === 'all' ? undefined : this.filterStatus(),
            page: this.currentPage() - 1,
            size: this.pageSize(),
            sortBy: 'createdDate',
            sortDir: 'desc',
        };

        this.service.getList(params)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (res: PaginationResponse<PmSpecificationModel>) => {
                    const data = res.data || [];
                    this.specs.set(data);
                    this.totalItems.set(res.pageable?.totalElements || 0);
                    this.loadApprovalStatuses(data);
                },
                error: () => {
                    this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการ Specification ได้');
                    this.specs.set([]);
                    this.totalItems.set(0);
                },
            });
    }

    loadApprovalStatuses(specifications: PmSpecificationModel[]): void {
        specifications.forEach((spec) => {
            if (!spec.id) return;
            this.approvalService.getDocumentStatus('SPECIFICATION', spec.id).subscribe({
                next: (approval) => {
                    this.specs.update((list) =>
                        list.map((item) =>
                            item.id === spec.id ? { ...item, approvalStatus: approval.status } : item
                        )
                    );
                },
                error: () => {
                    // ไม่มีสถานะอนุมัติ ปล่อย null
                },
            });
        });
    }

    onSearch(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchTerm.set(input.value);
        this.currentPage.set(1);
        this.loadData();
    }

    clearSearch(): void {
        this.searchTerm.set('');
        this.currentPage.set(1);
        this.loadData();
    }

    readonly statusOptions = [
        { value: 'Draft', text: 'ร่าง' },
        { value: 'Review', text: 'ตรวจสอบ' },
        { value: 'Approved', text: 'อนุมัติแล้ว' },
        { value: 'Released', text: 'เผยแพร่' },
        { value: 'Changed', text: 'เปลี่ยนแปลง' },
    ];

    onFilterChange(value: any): void {
        const val = value !== undefined && value !== null ? (typeof value === 'object' && value.target ? value.target.value : value) : 'all';
        this.filterStatus.set(val || 'all');
        this.currentPage.set(1);
        this.loadData();
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.totalPages()) return;
        this.currentPage.set(page);
        this.loadData();
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

    deleteSpec(id: string): void {
        this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบ Specification นี้ใช่หรือไม่?')
            .then((ok) => {
                if (ok) {
                    this.service.delete(id).subscribe({
                        next: () => {
                            this.dialog.success('ลบสำเร็จ', 'Specification ถูกลบแล้ว');
                            this.loadData();
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