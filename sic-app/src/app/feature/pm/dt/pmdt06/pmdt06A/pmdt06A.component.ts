// src/app/feature/pm/dt/pmdt07/pmdt07A/pmdt07A.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicCardComponent } from '../../../../../core/component/sic-card/sic-card.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { BusinessService } from '../../../../../core/services/business.service';
import { ImpactAnalysisService, ImpactAnalysis } from '../impact-analysis.service';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';

import { SicDatePipe } from '../../../../../core/pipes/sic-date.pipe';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { ChangeRequestFormModel } from './pmdt06A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';

@Component({
    selector: 'app-pmdt06a',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SicButtonComponent,
        SicInputComponent,
        SicInputAreaComponent,
        SicComboboxComponent,
        SicNumberComponent,
        SicCardComponent,
        SicDatePipe,
        SicTiptapEditorComponent,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './pmdt06A.component.html',
})
export class Pmdt06AComponent implements OnInit, CanComponentDeactivate {
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private dialog = inject(DialogService);
    private navigation = inject(NavigationService);
    private customerState = inject(CustomerStateService);
    private approvalService = inject(ApprovalService);
    private businessService = inject(BusinessService);
    private impactService = inject(ImpactAnalysisService);
    private baseUrl = environment.apiBaseUrl + '/api/pm/change-requests';

    get businessId() {
        return this.businessService.getCurrentBusinessId();
    }

    environment = environment;
    readonly Math = Math;

    isEdit = false;
    isView = false;
    changeRequestId: string | null = null;
    isLoading = false;
    isSaving = false;
    projectId: string | null = null;

    // ===== Approval Flow =====
    flows: ApprovalFlow[] = [];
    selectedFlowId: string | null = null;
    isLoadingFlows = false;

    // ===== Impact Analysis =====
    impactData = signal<ImpactAnalysis | null>(null);
    isLoadingImpact = signal(false);
    showImpactSection = signal(false);

    // ===== Form =====
    formData: SicFromData<any> = new SicFromData<any>(this.fb.group({
        id: [null],
        projectId: [null],
        crCode: [null, Validators.required],
        targetType: ['REQUIREMENT', Validators.required],
        targetId: [null, Validators.required],
        title: [null, Validators.required],
        description: [null],
        changeReason: [null],
        targetVersion: [null],
        assigneeId: [null],
        assigneeIds: [[], Validators.required],
        rowVersion: [null],
    }));

    get form(): FormGroup {
        return this.formData.formGroup;
    }

    selectedTargetType = signal('REQUIREMENT');
    readonly targetTypeOptions = [
        { value: 'REQUIREMENT', text: 'ความต้องการระบบ (Requirement)' },
        { value: 'SPECIFICATION', text: 'ข้อกำหนดระบบ (Specification)' },
    ];
    selectedAssignees = signal<{ userId: string; userName: string }[]>([]);
    selectedAssigneeIds = computed(() => this.selectedAssignees().map(a => a.userId));

    documenttypeapiUrl = environment.apiBaseUrl + '/api/pm/approvals/flows/document-type/CHANGE_REQUEST';

    isSaved = false;
    pageDirty = () => this.isView ? false : (this.isSaved ? false : (this.formData?.isChanged ?? false));

    // ===== Methods =====

    onAssigneeSelectionChanged(items: any[]) {
        if (!Array.isArray(items)) {
            this.selectedAssignees.set([]);
            this.form.get('assigneeId')?.setValue(null);
            return;
        }

        const assignees = items.map(item => ({
            userId: item.value || item.userId || item.id,
            userName: item.text || item.userName || item.name || item.fullName
        }));

        this.selectedAssignees.set(assignees);
        this.form.get('assigneeId')?.setValue(assignees[0]?.userId || null);
    }

    targetDocumentApiUrl = computed(() => {
        const type = this.selectedTargetType();
        if (type === 'REQUIREMENT') {
            return environment.apiBaseUrl + '/api/pm/requirement/combobox';
        } else if (type === 'SPECIFICATION') {
            return environment.apiBaseUrl + '/api/pm/specifications/combobox';
        }
        return '';
    });

    ngOnInit() {
        const currentUrl = this.router.url;
        if (currentUrl.endsWith('/view') || currentUrl.includes('/view?')) {
            this.isView = true;
        }

        this.route.params.subscribe((params) => {
            const id = params['id'];
            if (id) {
                this.isEdit = !this.isView;
                this.changeRequestId = id;
                this.loadChangeRequest(id);
                // โหลด Impact Analysis เฉพาะตอนแก้ไข/ดูรายละเอียด
                this.loadImpactAnalysis(id);
            }
        });

        this.route.queryParams.subscribe((qParams) => {
            if (qParams['projectId']) {
                this.projectId = qParams['projectId'];
                this.form.patchValue({ projectId: this.projectId });
            }
        });

        this.form.get('targetType')?.valueChanges.subscribe((val) => {
            this.selectedTargetType.set(val);
            this.form.get('targetId')?.setValue(null);
        });

        this.loadFlows();
    }

    loadFlows() {
        this.isLoadingFlows = true;
        this.approvalService
            .getFlowsByDocumentType('CHANGE_REQUEST')
            .pipe(finalize(() => (this.isLoadingFlows = false)))
            .subscribe({
                next: (flows) => {
                    this.flows = flows;
                    if (flows.length === 1) {
                        this.selectedFlowId = flows[0].id;
                    }
                },
                error: () => {
                    console.warn('ไม่สามารถโหลด Approval Flow สำหรับ Change Request');
                },
            });
    }

    loadChangeRequest(id: string) {
        this.isLoading = true;
        this.http
            .get<ChangeRequestFormModel>(`${this.baseUrl}/${id}`)

            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (data) => {
                    if (data.targetType) {
                        this.selectedTargetType.set(data.targetType);
                    }
                    this.formData.patchValue(data);
                    if (data.status === 'SUBMITTED' || data.status === 'APPROVED' || data.status === 'IMPLEMENTED') {
                        this.isView = true;
                        this.isEdit = false;
                        this.form.disable();
                    } else if (data.status === 'REJECTED') {
                        // If rejected, allow editing and re-submitting for approval
                        this.isView = false;
                        this.isEdit = true;
                        this.form.enable();
                    } else if (this.isView) {
                        this.form.disable();
                    }
                    if (data.assignees && data.assignees.length > 0) {
                        const assignees = data.assignees.map((a) => ({
                            userId: a.userId,
                            userName: a.userName || a.userId,
                        }));
                        this.selectedAssignees.set(assignees);
                        this.form.get('assigneeIds')?.setValue(assignees.map(a => a.userId));
                        this.form.get('assigneeId')?.setValue(data.assignees[0]?.userId || null);
                    } else if (data.assigneeId) {
                        this.selectedAssignees.set([{ userId: data.assigneeId, userName: data.assigneeName || data.assigneeId }]);
                        this.form.get('assigneeIds')?.setValue([data.assigneeId]);
                        this.form.get('assigneeId')?.setValue(data.assigneeId);
                    } else {
                        this.selectedAssignees.set([]);
                        this.form.get('assigneeIds')?.setValue([]);
                        this.form.get('assigneeId')?.setValue(null);
                    }
                    if (data.projectId) {
                        this.projectId = data.projectId;
                    }
                    if (this.isView) {
                        this.form.disable();
                    }
                    this.formData.resetModel(this.form.getRawValue());
                    this.isLoading = false;
                },
                error: () => {
                    this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบ Change Request นี้');
                    this.navigation.navigate(['/feature/pm/change-request']);
                },
            });
    }

    // ===== Impact Analysis Methods =====
    loadImpactAnalysis(id: string) {
        this.isLoadingImpact.set(true);
        this.impactService.getByChangeRequest(id)
            .pipe(finalize(() => this.isLoadingImpact.set(false)))
            .subscribe({
                next: (data) => {
                    if (data && data.id) {
                        this.impactData.set(data);
                        this.showImpactSection.set(true);
                    } else {
                        // ถ้ายังไม่มี Impact ให้ auto detect ทันที
                        this.autoDetectImpact();
                    }
                },
                error: () => {
                    // ถ้ายังไม่มี Impact ให้ auto detect ทันที
                    this.autoDetectImpact();
                }
            });
    }

    autoDetectImpact() {
        const id = this.changeRequestId;
        if (!id) return;

        this.isLoadingImpact.set(true);
        this.impactService.autoDetect(id)
            .pipe(finalize(() => this.isLoadingImpact.set(false)))
            .subscribe({
                next: (data) => {
                    this.impactData.set(data);
                    this.showImpactSection.set(true);
                    if (data && data.id) {
                        this.dialog.success('วิเคราะห์ผลกระทบ', 'ระบบวิเคราะห์ผลกระทบอัตโนมัติเรียบร้อย');
                    }
                },
                error: (err) => {
                    console.error('Auto detect impact failed:', err);
                    this.showImpactSection.set(false);
                }
            });
    }

    refreshImpact() {
        this.autoDetectImpact();
    }

    // ===== CRUD =====
    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.dialog.warn('ฟอร์มไม่ถูกต้อง', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        this.isSaving = true;
        const data = { ...this.form.value };

        if (!data.projectId && this.projectId) {
            data.projectId = this.projectId;
        }

        data.assignees = this.selectedAssignees().map(a => ({
            userId: a.userId,
            targetType: data.targetType,
            targetId: data.targetId
        }));

        if (this.isEdit && this.changeRequestId) {
            data.state = 3;
        } else {
            data.state = 4;
            data.rowVersion = 0;
        }

        const saveRequest = this.isEdit && this.changeRequestId
            ? this.http.put(`${this.baseUrl}/${this.changeRequestId}`, data)
            : this.http.post(this.baseUrl, data);

        saveRequest.subscribe({
            next: (res: any) => {
                const id = res?.id || (typeof res === 'string' ? res : null) || this.changeRequestId;

                if (this.selectedFlowId && id) {
                    this.approvalService
                        .submitForApproval({
                            documentType: 'CHANGE_REQUEST',
                            documentId: id,
                            documentCode: data.crCode || ('CR-' + id.substring(0, 8).toUpperCase()),
                            documentTitle: data.title || 'คำขอเปลี่ยนแปลง',
                            flowId: this.selectedFlowId,
                            comment: 'ส่งขออนุมัติ Change Request',
                        })
                        .pipe(finalize(() => (this.isSaving = false)))
                        .subscribe({
                            next: () => {
                                this.isSaved = true;
                                this.form.markAsPristine();
                                this.dialog.success('สำเร็จ', 'บันทึกและส่งขออนุมัติเรียบร้อย').then(() => {
                                    this.navigateBack();
                                });
                            },
                            error: (err) => {
                                this.dialog.error('ส่งขออนุมัติไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
                            },
                        });
                } else {
                    this.isSaving = false;
                    this.isSaved = true;
                    this.form.markAsPristine();
                    this.dialog.success('บันทึกสำเร็จ', 'Change Request ถูกบันทึกเรียบร้อย').then(() => {
                        this.navigateBack();
                    });
                }
            },
            error: (err) => {
                this.isSaving = false;
                this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
            },
        });
    }

    private navigateBack() {
        if (this.projectId) {
            this.navigation.navigate(['/feature/pm/change-request'], {
                queryParams: { projectId: this.projectId }
            });
        } else {
            this.navigation.navigate(['/feature/pm/change-request']);
        }
    }

    cancel() {
        this.navigateBack();
    }

    deleteChangeRequest() {
        const id = this.changeRequestId || this.form.get('id')?.value;
        if (!id) return;

        this.dialog.confirm('ยืนยันการลบ', 'คุณต้องการลบ Change Request นี้ใช่หรือไม่?').then((ok) => {
            if (ok) {
                this.isLoading = true;
                this.http.delete(`${this.baseUrl}/${id}`)
                    .pipe(finalize(() => { this.isLoading = false; }))
                    .subscribe({
                        next: () => {
                            this.isSaved = true;
                            this.form.markAsPristine();
                            this.dialog.success('ลบสำเร็จ', 'Change Request ถูกลบแล้ว').then(() => {
                                this.navigateBack();
                            });
                        },
                        error: () => this.dialog.error('ลบไม่สำเร็จ', 'เกิดข้อผิดพลาดในการลบ Change Request'),
                    });
            }
        });
    }

    exportPdf() {
        const id = this.changeRequestId || this.form.get('id')?.value;
        if (!id) {
            this.dialog.warn('ยังไม่ได้บันทึกข้อมูล', 'กรุณาบันทึก Change Request ก่อนพิมพ์เอกสาร');
            return;
        }

        this.isLoading = true;
        const url = `${this.baseUrl}/${id}/export-pdf`;
        this.http.get(url, { responseType: 'blob' })
            .pipe(finalize(() => {
                this.isLoading = false;
            }))
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

    // ===== Helper =====
    getImpactLabel(count: number | undefined, label: string): string {
        if (!count || count === 0) return `${label}: -`;
        return `${label}: ${count} รายการ`;
    }

    openItemDetail(type: 'REQ' | 'SPEC' | 'DIAGRAM' | 'TASK' | 'TC' | 'BUG', id?: string) {
        if (!id) return;
        let url = '';
        const base = '/feature/pm';
        const projId = this.projectId || this.form.get('projectId')?.value || '';

        switch (type) {
            case 'REQ':
                url = `${base}/requirement/${id}/edit`;
                break;
            case 'SPEC':
                url = `${base}/specification/${id}/edit`;
                break;
            case 'DIAGRAM':
                url = `${base}/diagram?tabId=${id}${projId ? '&projectId=' + projId : ''}`;
                break;
            case 'TASK':
                url = `${base}/task/${id}/edit`;
                break;
            case 'TC':
                url = `${base}/test-case/${id}/edit`;
                break;
            case 'BUG':
                url = `${base}/task/${id}/edit`;
                break;
        }

        if (url) {
            window.open(url, '_blank');
        }
    }

    getImpactStatusClass(status?: string): string {
        if (status === 'AUTO') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }

    getImpactStatusText(status?: string): string {
        return status === 'AUTO' ? 'วิเคราะห์อัตโนมัติ' : 'วิเคราะห์ด้วยตนเอง';
    }
}