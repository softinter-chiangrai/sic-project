// src/app/feature/pm/dt/pmdt08/pmdt08A/pmdt08A.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, signal, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize, Subscription, interval, takeWhile, tap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { SicApprovalComponent } from '../../../../../core/component/sic-approval/sic-approval.component';
import { SicDatePipe } from '../../../../../core/pipes/sic-date.pipe';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { BusinessService } from '../../../../../core/services/business.service';
import { AuthService } from '../../../../../core/auth/auth.service';
import { Pmdt08Service } from '../pmdt08.service';
import { PmSpecificationModel } from '../pmdt08.model';
import { Pmdt08PreviewComponent } from '../pmdt08-preview/Pmdt08PreviewComponent';
import { SpecificationExportService } from '../specification-export.service';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { HttpClient } from '@angular/common/http';
import { SicCheckboxComponent } from '../../../../../core/component/sic-checkbox/sic-checkbox.component';

@Component({
    selector: 'app-pmdt08a',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        SicButtonComponent,
        SicComboboxComponent,
        SicInputComponent,
        SicNumberComponent,
        SicTiptapEditorComponent,
        SicUploadComponent,
        SicCheckboxComponent,
        SicApprovalComponent,
        SicDatePipe,
        Pmdt08PreviewComponent
    ],
    templateUrl: './pmdt08A.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .pmdt08-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            height: calc(100vh - 200px);
            min-height: 600px;
        }
        .pmdt08-layout--split { grid-template-columns: 1fr 1fr; }
        .pmdt08-layout--preview-only { grid-template-columns: 1fr; }
        .pmdt08-layout--edit-only { grid-template-columns: 1fr; }
        .pmdt08-panel {
            overflow-y: auto;
            padding: 0.5rem;
            background: var(--sidebar);
            border-radius: 0.75rem;
            border: 1px solid var(--border);
        }
        .pmdt08-panel--preview { background: var(--bg); }
        @media (max-width: 768px) {
            .pmdt08-layout { grid-template-columns: 1fr; height: auto; }
        }
        .auto-save-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: var(--text-muted);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            background: var(--sidebar-hover);
        }
        .auto-save-indicator.saving { color: var(--crm-primary); }
        .auto-save-indicator.saved { color: var(--crm-success); }
        .view-mode-toggle {
            display: flex;
            gap: 0.25rem;
            background: var(--bg);
            border-radius: 0.5rem;
            padding: 0.25rem;
            border: 1px solid var(--border);
        }
        .view-mode-toggle button {
            padding: 0.25rem 0.75rem;
            border: none;
            border-radius: 0.375rem;
            background: transparent;
            color: var(--text-muted);
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.15s;
        }
        .view-mode-toggle button.active {
            background: var(--crm-primary);
            color: white;
        }
        .view-mode-toggle button:hover:not(.active) {
            background: var(--sidebar-hover);
        }
    `]
})
export class Pmdt08AComponent implements OnInit, OnDestroy, CanComponentDeactivate {
    // Dependencies
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    public service = inject(Pmdt08Service);
    public exportService = inject(SpecificationExportService);
    private dialog = inject(DialogService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);
    private navigation = inject(NavigationService);
    private customerState = inject(CustomerStateService);
    private auth = inject(AuthService);
    private approvalService = inject(ApprovalService);
    private http = inject(HttpClient);
    private businessService = inject(BusinessService);

    apiBaseUrl = environment.apiBaseUrl;
    userApiUrl = '';
    businessId: string | null = null;

    // Form
    form!: FormGroup;
    isEdit = false;
    isViewOnly = false;
    specId: string | null = null;
    isLoading = false;
    isSaving = false;
    isAutoSaving = false;
    lastAutoSaveTime: Date | null = null;

    // View Mode
    viewMode: 'edit' | 'split' | 'preview' = 'split';

    // Approval Flow
    flows: ApprovalFlow[] = [];
    selectedFlowId: string | null = null;
    isLoadingFlows = false;

    // Auto-save
    private autoSaveSubscription: Subscription | null = null;
    private formChangeSubscription: Subscription | null = null;
    private autoSaveEnabled = true;
    private autoSaveInterval = 30000;

    pageDirty = () => this.isViewOnly ? false : (this.form?.dirty ?? false);

    ngOnInit(): void {
        this.initForm();
        this.loadFlows();

        this.businessId = this.businessService.getCurrentBusinessId();
        if (this.businessId) {
            this.userApiUrl = `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${this.businessId}`;
        } else {
            const stored = localStorage.getItem('businessId');
            if (stored) {
                this.businessId = stored;
                this.userApiUrl = `${environment.apiBaseUrl}/api/business/combobox-members?businessId=${stored}`;
            } else {
                this.userApiUrl = `${environment.apiBaseUrl}/api/business/combobox-members`;
            }
        }

        const isViewRoute = this.router.url.includes('/view');
        if (isViewRoute) this.isViewOnly = true;

        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.isEdit = !this.isViewOnly;
                this.specId = id;
                this.loadSpecification(id);
            } else {
                // New spec
                this.route.queryParams.subscribe(qParams => {
                    const pId = qParams['projectId'] || this.customerState.getProjectId();
                    if (pId) {
                        this.form.patchValue({ projectId: pId });
                        this.fetchProjectName(pId);
                    }
                });
                const userName = this.getUserNameFromToken();
                if (userName) this.form.patchValue({ createdBy: userName });
            }
        });

        this.setupAutoSave();
    }

    ngOnDestroy(): void {
        this.autoSaveSubscription?.unsubscribe();
        this.formChangeSubscription?.unsubscribe();
    }

    initForm(): void {
        this.form = this.fb.group({
            id: [null],
            specificationCode: [null, [Validators.required, Validators.maxLength(50)]],
            title: [null, [Validators.required, Validators.maxLength(255)]],
            module: [null, [Validators.maxLength(100)]],
            version: [{ value: 'v1.0', disabled: true }],
            status: ['Draft'],
            priority: ['Medium'],
            owner: [null, [Validators.maxLength(100)]],
            estimatedManday: [null, [Validators.min(0)]],
            description: [null, [Validators.required]],
            uploadGroupId: [null],
            isAiGenerated: [false],
            aiGeneratedAt: [null],
            generatedFromRequirementId: [null],
            generatedFromDiagramId: [null],
            projectId: [null],
            projectName: [null],
            createdBy: [null],
            isActive: [true],
            state: [null],
            rowVersion: [null]
        });
    }

    loadSpecification(id: string) {
        this.isLoading = true;
        this.service.getSpecification(id).subscribe({
            next: (data) => {
                this.form.patchValue(data);
                this.isLoading = false;
                this.form.markAsPristine();
                if (this.isViewOnly) this.form.disable();

                if (!data.projectName && data.projectId) {
                    this.fetchProjectName(data.projectId);
                }
                if (!data.createdBy) {
                    const userName = this.getUserNameFromToken();
                    if (userName) this.form.patchValue({ createdBy: userName });
                }
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoading = false;
                this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบ Specification นี้');
                this.navigation.navigate(['/feature/pm/pmdt08']);
            }
        });
    }

    private fetchProjectName(projectId: string): void {
        this.http.get<any>(this.service.apiGetComboboxProject).subscribe({
            next: (res) => {
                const list = Array.isArray(res) ? res : (res.data || []);
                const project = list.find((p: any) => String(p.value || p.id) === String(projectId));
                if (project) {
                    const name = project.projectName || project.name || project.text;
                    if (name) {
                        this.form.patchValue({ projectName: name });
                        this.cdr.markForCheck();
                    }
                }
            },
            error: () => {}
        });
    }

    private getUserNameFromToken(): string | null {
        const token = this.auth.getAccessToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.name || payload.preferred_username || payload.displayName || null;
        } catch { return null; }
    }

    loadFlows() {
        this.isLoadingFlows = true;
        this.approvalService.getFlowsByDocumentType('SPECIFICATION').subscribe({
            next: (flows) => {
                this.flows = flows;
                this.isLoadingFlows = false;
                if (flows.length === 1) this.selectedFlowId = flows[0].id;
            },
            error: () => { this.isLoadingFlows = false; }
        });
    }

    // ===== Auto-save =====
    private setupAutoSave(): void {
        if (!this.autoSaveEnabled) return;
        this.autoSaveSubscription = interval(this.autoSaveInterval)
            .pipe(
                takeWhile(() => this.autoSaveEnabled),
                tap(() => {
                    if (this.form.dirty && this.form.valid) {
                        this.performAutoSave();
                    }
                })
            )
            .subscribe();
    }

    private extractUploadGroupId(rawGroupId: any): string | null {
        if (!rawGroupId) return null;
        if (typeof rawGroupId === 'string') return rawGroupId.trim() || null;
        if (Array.isArray(rawGroupId) && rawGroupId.length > 0) {
            const firstFile = rawGroupId[0];
            if (typeof firstFile === 'string') return firstFile;
            return firstFile?.uploadGroupId || firstFile?.id || firstFile?.uploadId || null;
        }
        if (typeof rawGroupId === 'object') {
            return rawGroupId.uploadGroupId || rawGroupId.id || rawGroupId.uploadId || null;
        }
        return null;
    }

    private prepareSubmitData(): PmSpecificationModel {
        const rawData = { ...this.form.value };
        const uploadGroupId = this.extractUploadGroupId(rawData.uploadGroupId);
        rawData.uploadGroupId = uploadGroupId || null;

        if (rawData.estimatedManday !== null && rawData.estimatedManday !== undefined && (rawData.estimatedManday as any) !== '') {
            const num = Number(rawData.estimatedManday);
            rawData.estimatedManday = isNaN(num) ? undefined : num;
        } else {
            rawData.estimatedManday = undefined;
        }

        return rawData;
    }

    private performAutoSave(): void {
        if (this.isSaving || this.isAutoSaving) return;
        const data = this.prepareSubmitData();
        if (!data.title && !data.description) return;

        this.isAutoSaving = true;
        this.lastAutoSaveTime = new Date();

        this.service.autoSave(data).subscribe({
            next: (response: any) => {
                this.isAutoSaving = false;
                if (response) {
                    this.form.patchValue(response);
                    if (response.id) {
                        this.specId = response.id;
                        this.isEdit = true;
                    }
                }
                this.form.markAsPristine({ onlySelf: true });
                this.cdr.markForCheck();
            },
            error: () => {
                this.isAutoSaving = false;
                this.cdr.markForCheck();
            }
        });
    }

    getAutoSaveStatus(): string {
        if (this.isAutoSaving) return 'saving';
        if (this.lastAutoSaveTime) {
            const diff = Date.now() - this.lastAutoSaveTime.getTime();
            if (diff < 5000) return 'saved';
        }
        if (this.form.dirty) return 'dirty';
        return 'idle';
    }

    getAutoSaveText(): string {
        const status = this.getAutoSaveStatus();
        switch (status) {
            case 'saving': return '💾 กำลังบันทึกอัตโนมัติ...';
            case 'saved': return '✅ บันทึกอัตโนมัติ ' + this.formatTimeDiff(this.lastAutoSaveTime);
            case 'dirty': return '⏳ ยังไม่ได้บันทึก';
            default: return '💾 บันทึกอัตโนมัติ';
        }
    }

    private formatTimeDiff(date: Date | null): string {
        if (!date) return '';
        const diff = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diff < 60) return `(${diff} วินาทีที่แล้ว)`;
        return `(${Math.floor(diff / 60)} นาทีที่แล้ว)`;
    }

    // ===== View Mode =====
    setViewMode(mode: 'edit' | 'split' | 'preview'): void {
        this.viewMode = mode;
        this.cdr.markForCheck();
    }

    // ===== Preview Data =====
    getPreviewData(): PmSpecificationModel {
        return this.prepareSubmitData();
    }

    // ===== Export =====
    async exportSpecification(format: 'pdf' | 'docx'): Promise<void> {
        try {
            const data = this.prepareSubmitData();
            const blob = await this.exportService.exportSpecification(data, format);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Specification_${data.specificationCode || 'Export'}_${new Date().getTime()}.${format === 'pdf' ? 'pdf' : format === 'docx' ? 'docx' : 'html'}`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            this.dialog.error('ส่งออกไฟล์ไม่สำเร็จ', 'เกิดข้อผิดพลาดในการส่งออกไฟล์');
        }
    }

    // ===== Submit =====
    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        if (!this.selectedFlowId) {
            this.dialog.warn('กรุณาเลือกกระบวนการอนุมัติ', 'จำเป็นต้องเลือกกระบวนการอนุมัติทุกครั้ง');
            return;
        }

        this.isSaving = true;
        const data = this.prepareSubmitData();
        data.state = this.isEdit ? 3 : 4;
        if (!this.isEdit) data.rowVersion = 0;

        this.service.save(data).subscribe({
            next: (response: any) => {
                this.form.markAsPristine();
                let savedId = data.id || this.specId;
                if (response && response.id) {
                    savedId = response.id;
                    this.form.patchValue(response);
                    this.specId = savedId;
                    this.isEdit = true;
                }

                this.approvalService.submitForApproval({
                    documentType: 'SPECIFICATION',
                    documentId: savedId!,
                    documentCode: data.specificationCode,
                    documentTitle: data.title,
                    version: data.version,
                    flowId: this.selectedFlowId!,
                    comment: 'ส่งขออนุมัติ Specification'
                }).subscribe({
                    next: () => {
                        this.isSaving = false;
                        this.dialog.success('บันทึกและส่งขออนุมัติสำเร็จ', 'Specification ถูกบันทึกและส่งเข้าสู่กระบวนการอนุมัติแล้ว').then(() => {
                            this.navigateBack(data.projectId);
                        });
                    },
                    error: (err) => {
                        this.isSaving = false;
                        this.dialog.error('บันทึกสำเร็จ แต่ส่งขออนุมัติไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาดในการส่งอนุมัติ');
                    }
                });
            },
            error: (error) => {
                this.isSaving = false;
                this.dialog.error('บันทึกไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาด');
            }
        });
    }

    private navigateBack(projectId?: string): void {
        if (projectId) {
            this.navigation.navigate(['/feature/pm/pmdt08'], { queryParams: { projectId } });
        } else {
            this.navigation.navigate(['/feature/pm/pmdt08']);
        }
    }

    onBack(): void {
        const projectId = this.form.get('projectId')?.value;
        if (this.form.dirty) {
            this.dialog.confirm('ยืนยัน', 'ข้อมูลยังไม่ได้บันทึก ต้องการออกใช่หรือไม่?')
                .then(ok => ok && this.navigateBack(projectId));
        } else {
            this.navigateBack(projectId);
        }
    }
}