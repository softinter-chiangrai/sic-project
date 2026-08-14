import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { DialogService } from '../../../../core/services/dialog.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../core/services/customer-state.service';
import { Pmdt08Service } from './pmdt08.service';
import { PmSpecificationModel } from './pmdt08.model';
import { PaginationResponse } from '../../../../core/model/pagination.model';

import { SicTableActionsComponent } from '../../../../core/component/sic-table-actions/sic-table-actions.component';
import { SicComboboxComponent } from '../../../../core/component/sic-combobox/sic-combobox.component';

@Component({
    selector: 'app-pmdt08',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, SicTableActionsComponent, SicComboboxComponent],
    templateUrl: './pmdt08.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmdt08Component implements OnInit {
    private route = inject(ActivatedRoute);
    public service = inject(Pmdt08Service);
    private router = inject(Router);
    private dialog = inject(DialogService);
    private navigation = inject(NavigationService);
    public customerState = inject(CustomerStateService);
    private http = inject(HttpClient);

    isLoading = signal(false);
    specs = signal<PmSpecificationModel[]>([]);
    totalItems = signal(0);
    currentPage = signal(1);
    pageSize = signal(10);
    searchTerm = signal('');
    filterStatus = signal('all');

    // ===== AI Generator Modal State =====
    showAiModal = signal(false);
    isGeneratingAi = signal(false);
    requirementOptions = signal<any[]>([]);
    aiForm = {
        requirementId: '',
        diagramId: '',
        specificationType: 'UI Specification',
        prompt: '',
    };
    aiResult = signal<any>(null);

    specificationTypeOptions = [
        'UI Specification',
        'API Specification',
        'Business Rule Specification',
        'Report Specification',
        'Data Specification',
        'Integration Specification',
        'Permission Specification'
    ];

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
        const resolved = this.route.snapshot.data['form'] || this.route.snapshot.data['pageData'];
        if (resolved && resolved.data) {
            this.specs.set(resolved.data || []);
            this.totalItems.set(resolved.pageable?.totalElements || resolved.data.length || 0);
        } else {
            this.loadData();
        }
    }

    loadData(): void {
        this.isLoading.set(true);
        const requirementId = this.route.snapshot.queryParams['requirementId'] || this.customerState.getRequirementId();
        const projectId = this.route.snapshot.queryParams['projectId'] || this.customerState.getProjectId();
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
                    this.specs.set(res.data || []);
                    this.totalItems.set(res.pageable?.totalElements || 0);
                },
                error: () => {
                    this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถโหลดรายการ Specification ได้');
                    this.specs.set([]);
                    this.totalItems.set(0);
                },
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

    onFilterChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        this.filterStatus.set(select.value);
        this.currentPage.set(1);
        this.loadData();
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.totalPages()) return;
        this.currentPage.set(page);
        this.loadData();
    }

    goToAdd(): void {
        const projectId = this.customerState.getProjectId();
        const requirementId = this.customerState.getRequirementId();
        const queryParams: any = {};
        if (projectId) queryParams.projectId = projectId;
        if (requirementId) queryParams.requirementId = requirementId;

        this.navigation.navigate(['/feature/pm/pmdt08/new'], { queryParams });
    }

    // ===== AI Generator Methods =====
    openAiModal(): void {
        const currentReqId = this.customerState.getRequirementId();
        this.aiForm.requirementId = currentReqId || '';
        this.aiForm.diagramId = '';
        this.aiResult.set(null);
        this.showAiModal.set(true);
    }

    closeAiModal(): void {
        this.showAiModal.set(false);
        this.aiResult.set(null);
    }

    generateAiSpec(): void {
        const projectId = this.customerState.getProjectId();
        this.isGeneratingAi.set(true);

        this.service.generateDraft({
            projectId: projectId || undefined,
            requirementId: this.aiForm.requirementId || undefined,
            diagramId: this.aiForm.diagramId || undefined,
            specificationType: this.aiForm.specificationType,
            prompt: this.aiForm.prompt || undefined,
        }).pipe(finalize(() => this.isGeneratingAi.set(false))).subscribe({
            next: (result) => {
                this.aiResult.set(result);
            },
            error: (err) => {
                this.dialog.error('AI ไม่สามารถสร้างข้อมูลได้', err.error?.message || 'เกิดข้อผิดพลาดในการติดต่อ AI Service');
            }
        });
    }

    useAiResult(): void {
        const result = this.aiResult();
        if (!result) return;

        const projectId = this.customerState.getProjectId();
        const requirementId = this.aiForm.requirementId || this.customerState.getRequirementId();
        const diagramId = this.aiForm.diagramId;
        const queryParams: any = {};
        if (projectId) queryParams.projectId = projectId;
        if (requirementId) queryParams.requirementId = requirementId;
        if (diagramId) queryParams.diagramId = diagramId;

        this.closeAiModal();

        // Pass generated AI data via router navigation state
        this.router.navigate(['/feature/pm/pmdt08/new'], {
            queryParams,
            state: {
                aiDraft: {
                    title: result.title,
                    specificationType: result.specificationType || this.aiForm.specificationType,
                    priority: result.priority || 'Medium',
                    estimatedManday: result.estimatedManday || 1,
                    description: result.generatedHtmlDescription || result.description || '',
                    requirementId: requirementId || undefined,
                    diagramId: diagramId || undefined,
                    projectId: projectId || undefined,
                }
            }
        });
    }

    goToEdit(id: string): void {
        const projectId = this.customerState.getProjectId();
        const requirementId = this.customerState.getRequirementId();
        const queryParams: any = {};
        if (projectId) queryParams.projectId = projectId;
        if (requirementId) queryParams.requirementId = requirementId;

        this.navigation.navigate(['/feature/pm/pmdt08', id, 'edit'], { queryParams });
    }

    goToView(id: string): void {
        const projectId = this.customerState.getProjectId();
        const requirementId = this.customerState.getRequirementId();
        const queryParams: any = {};
        if (projectId) queryParams.projectId = projectId;
        if (requirementId) queryParams.requirementId = requirementId;

        this.navigation.navigate(['/feature/pm/pmdt08', id, 'view'], { queryParams });
    }

    printDocument(spec: PmSpecificationModel): void {
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
        <title>Specification - ${spec.specificationCode || ''}</title>
        <style>
          body { font-family: 'Sarabun', sans-serif; padding: 24px; color: #333; line-height: 1.6; }
          h1 { font-size: 20px; border-bottom: 2px solid #ddd; padding-bottom: 8px; margin-bottom: 16px; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .info-table td { padding: 8px 12px; border: 1px solid #eee; }
          .info-table td.label { font-weight: bold; background-color: #f9f9f9; width: 25%; }
          .content { font-size: 14px; margin-top: 16px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>[${spec.specificationCode || '-'}] ${spec.title || 'Specification Detail'}</h1>
        <table class="info-table">
          <tr>
            <td class="label">รหัสเอกสาร</td>
            <td>${spec.specificationCode || '-'}</td>
            <td class="label">เวอร์ชัน</td>
            <td>${spec.version || '1.0'}</td>
          </tr>
          <tr>
            <td class="label">ชื่อโครงการ</td>
            <td>${spec.projectName || '-'}</td>
            <td class="label">ประเภท</td>
            <td>${spec.specificationType || spec.specType || '-'}</td>
          </tr>
          <tr>
            <td class="label">ความสำคัญ (Priority)</td>
            <td>${spec.priority || '-'}</td>
            <td class="label">สถานะ</td>
            <td>${this.getStatusText(spec.status || 'Draft')}</td>
          </tr>
          <tr>
            <td class="label">ผู้สร้าง</td>
            <td>${spec.createdBy || '-'}</td>
            <td class="label">Manday (วัน)</td>
            <td>${spec.estimatedManday || 0}</td>
          </tr>
        </table>
        <div class="content">
          <h3>รายละเอียด / ข้อกำหนด</h3>
          <div>${spec.description || '-'}</div>
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
        const map: Record<string, string> = {
            Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
            Review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            Released: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        };
        return map[status] || 'bg-gray-100 text-gray-600';
    }

    getStatusText(status: string): string {
        const map: Record<string, string> = {
            Draft: 'ร่าง',
            Review: 'ตรวจสอบ',
            Approved: 'อนุมัติ',
            Released: 'เผยแพร่',
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
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    }
}