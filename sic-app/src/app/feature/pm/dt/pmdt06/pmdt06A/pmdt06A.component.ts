// src/app/feature/pm/dt/pmdt07/pmdt07A/pmdt07A.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { SicButtonComponent } from 'sic-ng';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicCardComponent } from 'sic-ng';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from 'sic-ng';
import { SicInputComponent } from 'sic-ng';
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import { DialogService } from '../../../../../core/services/dialog.service';
import { LanguageService } from '../../../../../core/services/language.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { BusinessService } from '../../../../../core/services/business.service';
import { ImpactAnalysisService, ImpactAnalysis } from '../impact-analysis.service';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';

import { SicDatePipe } from '../../../../../core/pipes/sic-date.pipe';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { ChangeRequestFormModel, Pmdt06APageData } from './pmdt06A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicTraceLinkPanelComponent } from '../../../../../core/component/sic-trace-link-panel/sic-trace-link-panel.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-pmdt06a',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SicButtonComponent,
        SicVersionBadgeComponent,
        SicInputComponent,
        SicInputAreaComponent,
        SicComboboxComponent,
        SicNumberComponent,
        SicCardComponent,
        SicDatePipe,
        SicTiptapEditorComponent,
        SicTraceLinkPanelComponent,
        TranslateModule,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './pmdt06A.component.html',
})
export class Pmdt06AComponent implements OnInit, CanComponentDeactivate {
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private languageService = inject(LanguageService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private dialog = inject(DialogService);
    private navigation = inject(NavigationService);
    private customerState = inject(CustomerStateService);
    private approvalService = inject(ApprovalService);
    private businessService = inject(BusinessService);
    private impactService = inject(ImpactAnalysisService);
    private cdr = inject(ChangeDetectorRef);
    private translate = inject(TranslateService);
    private baseUrl = environment.apiBaseUrl + '/api/pm/change-requests';

    get businessId() {
        return this.businessService.getCurrentBusinessId();
    }

    environment = environment;
    readonly Math = Math;

    isEdit = false;
    isView = false;
    currentStatus: string | null = null;
    currentIsLocked = false;
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
    apiGetComboboxCustomer = `${environment.apiBaseUrl}/api/pm/customers/combobox`;
    apiGetComboboxProject = `${environment.apiBaseUrl}/api/pm/customer-projects/combobox`;
    projectParams: Record<string, any> = {};

    formData: SicFromData<any> = new SicFromData<any>(this.fb.group({
        id: [null],
        customerId: [null],
        projectId: [null],
        crCode: [null, Validators.required],
        targetType: ['REQUIREMENT', Validators.required],
        targetId: [null, Validators.required],
        title: [null, Validators.required],
        description: [null],
        changeReason: [null],
        priority: ['MEDIUM', Validators.required],
        targetVersion: [null],
        assigneeId: [null],
        assigneeIds: [[]],
        approvalFlowId: [null],
        rowVersion: [null],
    }));

    loadCustomerFromProject(projectId: string): void {
        if (!projectId) return;
        this.http.get<any>(`${environment.apiBaseUrl}/api/pm/customer-projects/${projectId}`).subscribe({
            next: (project) => {
                if (project?.customerId) {
                    this.form.patchValue({ customerId: project.customerId });
                    this.projectParams = { customerId: project.customerId };
                    this.cdr.markForCheck();
                }
            },
            error: () => {},
        });
    }

    onCustomerSelected(item: any): void {
        const customerId = item?.value ?? item?.id ?? null;
        if (customerId) {
            this.projectParams = { customerId };
        } else {
            this.projectParams = {};
        }

        const currentProjectId = this.form.get('projectId')?.value;
        if (currentProjectId) {
            this.http.get<any>(`${environment.apiBaseUrl}/api/pm/customer-projects/${currentProjectId}`).subscribe({
                next: (project) => {
                    if (project?.customerId !== customerId) {
                        this.form.patchValue({ projectId: null, targetId: null });
                        this.projectId = null;
                        this.cdr.markForCheck();
                    }
                },
                error: () => {
                    this.form.patchValue({ projectId: null, targetId: null });
                    this.projectId = null;
                    this.cdr.markForCheck();
                }
            });
        }
        this.cdr.markForCheck();
    }

    onProjectSelected(item: any): void {
        const selectedProjectId = item?.value ?? item?.id ?? '';
        this.projectId = selectedProjectId || null;
        this.form.patchValue({ projectId: this.projectId, targetId: null });
        if (selectedProjectId) {
            this.loadCustomerFromProject(selectedProjectId);
        }
        this.cdr.markForCheck();
    }

    get form(): FormGroup {
        return this.formData.formGroup;
    }

    selectedTargetType = signal('REQUIREMENT');
    get targetTypeOptions() {
        return [
            { value: 'PROJECT', text: this.translate.instant('PMDT06_COL_PROJECT') },
            { value: 'REQUIREMENT', text: this.translate.instant('PMDT06_TARGET_REQ_FULL') },
            { value: 'SPECIFICATION', text: this.translate.instant('PMDT06_TARGET_SPEC_FULL') },
            { value: 'DIAGRAM', text: this.translate.instant('PMDT06_TARGET_DIAGRAM_FULL') },
            { value: 'CONTRACT', text: this.translate.instant('PMDT06_TARGET_CONTRACT') },
            { value: 'DESIGN_REVIEW', text: this.translate.instant('PMDT06_TARGET_DESIGN_REVIEW') },
            { value: 'DELIVERY', text: this.translate.instant('PMDT06_TARGET_DELIVERY') },
            { value: 'USER_MANUAL', text: this.translate.instant('PMDT06_TARGET_USER_MANUAL') },
            { value: 'INVOICE', text: this.translate.instant('PMDT06_TARGET_INVOICE') },
            { value: 'MA_TICKET', text: this.translate.instant('PMDT06_TARGET_MA_TICKET') },
            { value: 'MA_RENEWAL', text: this.translate.instant('PMDT06_TARGET_MA_RENEWAL') },
        ];
    }
    targetDocumentOptions = signal<any[]>([]);
    isTargetLocked = signal(false);
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
        if (type === 'PROJECT') {
            return environment.apiBaseUrl + '/api/pm/requirement/combobox-project';
        } else if (type === 'REQUIREMENT') {
            return environment.apiBaseUrl + '/api/pm/requirement/combobox';
        } else if (type === 'SPECIFICATION') {
            return environment.apiBaseUrl + '/api/pm/specifications/combobox';
        } else if (type === 'DIAGRAM') {
            return environment.apiBaseUrl + '/api/diagram/tabs/combobox';
        } else if (type === 'CONTRACT') {
            return environment.apiBaseUrl + '/api/pm/contracts/combobox';
        } else if (type === 'DESIGN_REVIEW') {
            return environment.apiBaseUrl + '/api/pm/design-reviews/combobox';
        } else if (type === 'DELIVERY') {
            return environment.apiBaseUrl + '/api/pm/delivery/combobox';
        } else if (type === 'USER_MANUAL') {
            return environment.apiBaseUrl + '/api/pm/manual/paging';
        } else if (type === 'INVOICE') {
            return environment.apiBaseUrl + '/api/pm/invoices/paging';
        } else if (type === 'MA_TICKET') {
            return environment.apiBaseUrl + '/api/pm/ma-tickets/paging';
        } else if (type === 'MA_RENEWAL') {
            return environment.apiBaseUrl + '/api/pm/ma-renewals/paging';
        }
        return '';
    });

    ngOnInit() {
        const currentUrl = this.router.url;
        if (currentUrl.endsWith('/view') || currentUrl.includes('/view?')) {
            this.isView = true;
        }

        const page: Pmdt06APageData = this.route.snapshot.data['form'];
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEdit = !this.isView;
            this.changeRequestId = id;
            if (page?.data) {
                this.applyChangeRequestData(page.data);
            } else {
                this.loadChangeRequest(id);
            }
            // โหลด Impact Analysis เฉพาะตอนแก้ไข/ดูรายละเอียด
            this.loadImpactAnalysis(id);
        }

        this.form.get('targetType')?.valueChanges.subscribe((val) => {
            this.selectedTargetType.set(val);
            this.form.get('targetId')?.setValue(null);
            this.impactData.set(null);
            this.showImpactSection.set(false);
        });

        this.form.get('targetId')?.valueChanges.subscribe((val) => {
            if (val) {
                this.triggerImpactAnalysis();
            } else {
                this.impactData.set(null);
                this.showImpactSection.set(false);
            }
        });

        this.route.queryParams.subscribe((qParams) => {
            if (qParams['projectId']) {
                this.projectId = qParams['projectId'];
                this.form.patchValue({ projectId: this.projectId });
            }

            // มาจากปุ่ม "ขอแก้ไข (Open Change Request)" ของเอกสารที่ถูกล็อค — เติมค่า target ให้อัตโนมัติและล็อคไม่ให้แก้ไข
            // (ใช้เฉพาะตอนสร้างใหม่ ไม่ใช่ตอนแก้ไข CR เดิม ซึ่งค่า targetType/targetId จะมาจาก loadChangeRequest แทน)
            if (!this.changeRequestId && qParams['targetType'] && qParams['targetId']) {
                this.isTargetLocked.set(true);
                this.selectedTargetType.set(qParams['targetType']);
                this.form.get('targetType')?.setValue(qParams['targetType'], { emitEvent: false });
                if (qParams['targetTitle']) {
                    this.targetDocumentOptions.set([
                        { value: qParams['targetId'], text: qParams['targetTitle'] }
                    ]);
                }
                this.form.patchValue({
                    targetId: qParams['targetId'],
                    title: qParams['targetTitle'] ? `${this.translate.instant('PMDT06_CR_TITLE_PREFIX')} ${qParams['targetTitle']}` : null,
                });
                this.triggerImpactAnalysis();
            }
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
                    this.flows = flows || [];
                    this.cdr.detectChanges();
                },
                error: () => {
                    console.warn('ไม่สามารถโหลด Approval Flow สำหรับ Change Request');
                },
            });
    }

    onFlowChange(event: any) {
        const flowId = event?.id ?? event?.value ?? event ?? null;
        this.selectedFlowId = flowId;
        this.form.patchValue({ approvalFlowId: flowId });
        this.cdr.detectChanges();
    }

    loadApprovalFlowForCR(crId: string) {
        this.approvalService.getDocumentStatus('CHANGE_REQUEST', crId).subscribe({
            next: (approval) => {
                let flowId: string | null = null;
                if (approval && (approval as any).flowId) {
                    flowId = (approval as any).flowId;
                } else if (approval && (approval as any).flow?.id) {
                    flowId = (approval as any).flow.id;
                }
                if (flowId) {
                    this.selectedFlowId = flowId;
                    this.form.patchValue({ approvalFlowId: flowId });
                }
                this.cdr.detectChanges();
            },
            error: () => {
                // ไม่มี approval หรือ error
            }
        });
    }

    loadChangeRequest(id: string) {
        this.isLoading = true;
        this.http
            .get<ChangeRequestFormModel>(`${this.baseUrl}/${id}`)
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (data) => this.applyChangeRequestData(data),
                error: () => {
                    this.dialog.error(this.translate.instant('PMDT06_LOAD_FAIL_TITLE'), this.translate.instant('PMDT06_CR_NOT_FOUND_MSG'));
                    this.navigation.navigate(['/feature/pm/change-request']);
                },
            });
    }

    private applyChangeRequestData(data: ChangeRequestFormModel) {
        const id = data.id || this.changeRequestId;
        if (data.targetType) {
            this.selectedTargetType.set(data.targetType);
        }
        this.currentStatus = (data as any).status ?? null;
        this.currentIsLocked = !!(data as any).isLocked;
        this.formData.patchValue(data);
        if (id) {
            this.loadApprovalFlowForCR(id);
        }
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
                        this.cdr.detectChanges();
                    } else {
                        // ถ้ายังไม่มี Impact ให้วิเคราะห์ทันที
                        this.triggerImpactAnalysis();
                    }
                },
                error: () => {
                    // ถ้ายังไม่มี Impact ให้วิเคราะห์ทันที
                    this.triggerImpactAnalysis();
                }
            });
    }

    triggerImpactAnalysis() {
        const targetType = this.form.get('targetType')?.value || this.selectedTargetType();
        const targetId = this.form.get('targetId')?.value;
        if (!targetType || !targetId) {
            return;
        }

        this.isLoadingImpact.set(true);
        if (this.changeRequestId) {
            this.impactService.autoDetect(this.changeRequestId)
                .pipe(finalize(() => this.isLoadingImpact.set(false)))
                .subscribe({
                    next: (data) => {
                        this.impactData.set(data);
                        this.showImpactSection.set(true);
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        console.error('Auto detect impact failed:', err);
                    }
                });
        } else {
            this.impactService.preview(targetType, targetId)
                .pipe(finalize(() => this.isLoadingImpact.set(false)))
                .subscribe({
                    next: (data) => {
                        this.impactData.set(data);
                        this.showImpactSection.set(true);
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        console.error('Preview impact failed:', err);
                    }
                });
        }
    }

    autoDetectImpact() {
        this.triggerImpactAnalysis();
    }

    refreshImpact() {
        this.triggerImpactAnalysis();
    }

    // ===== CRUD =====
    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.dialog.warn(this.translate.instant('PMDT06_FORM_INVALID_TITLE'), this.translate.instant('PMDT06_FILL_ALL_FIELDS_MSG'));
            return;
        }

        this.isSaving = true;
        const data = { ...this.form.getRawValue() };

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
                            documentTitle: data.title || this.translate.instant('PMDT06_DEFAULT_CR_TITLE'),
                            flowId: this.selectedFlowId,
                            comment: this.translate.instant('PMDT06A_SUBMIT_APPROVAL_COMMENT'),
                        })
                        .pipe(finalize(() => (this.isSaving = false)))
                        .subscribe({
                            next: () => {
                                this.isSaved = true;
                                this.form.markAsPristine();
                                this.dialog.success(this.translate.instant('PMDT06_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT06_SAVE_SUCCESS_MSG')).then(() => {
                                    this.navigateBack();
                                });
                            },
                            error: (err) => {
                                this.isSaved = true;
                                this.form.markAsPristine();
                                this.dialog.success(this.translate.instant('PMDT06_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT06_SAVE_SUCCESS_MSG')).then(() => {
                                    this.navigateBack();
                                });
                            },
                        });
                } else {
                    this.isSaving = false;
                    this.isSaved = true;
                    this.form.markAsPristine();
                    this.dialog.success(this.translate.instant('PMDT06_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT06_SAVE_SUCCESS_MSG')).then(() => {
                        this.navigateBack();
                    });
                }
            },
            error: (err) => {
                this.isSaving = false;
                this.dialog.error(this.translate.instant('PMDT06_SAVE_FAIL_TITLE'), err.error?.message || this.translate.instant('PMDT06_GENERIC_ERROR'));
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

        this.dialog.confirm(this.translate.instant('PMDT06_CONFIRM_DELETE_TITLE'), this.translate.instant('PMDT06_CONFIRM_DELETE_MSG')).then((ok) => {
            if (ok) {
                this.isLoading = true;
                this.http.delete(`${this.baseUrl}/${id}`)
                    .pipe(finalize(() => { this.isLoading = false; }))
                    .subscribe({
                        next: () => {
                            this.isSaved = true;
                            this.form.markAsPristine();
                            this.dialog.success(this.translate.instant('PMDT06_DELETE_SUCCESS_TITLE'), this.translate.instant('PMDT06_DELETE_SUCCESS_MSG')).then(() => {
                                this.navigateBack();
                            });
                        },
                        error: () => this.dialog.error(this.translate.instant('PMDT06_DELETE_FAIL_TITLE'), this.translate.instant('PMDT06_DELETE_ERROR_MSG')),
                    });
            }
        });
    }

    exportPdf() {
        const id = this.changeRequestId || this.form.get('id')?.value;
        if (!id) {
            this.dialog.warn(this.translate.instant('PMDT06_NOT_SAVED_TITLE'), this.translate.instant('PMDT06_SAVE_BEFORE_PRINT_MSG'));
            return;
        }

        this.isLoading = true;
        const url = `${this.baseUrl}/${id}/export-pdf`;
        const lang = this.languageService.getCurrentLanguage();
        this.http.get(url, { params: { lang }, responseType: 'blob' })
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
                    this.dialog.error(this.translate.instant('PMDT06_PRINT_FAIL_TITLE'), this.translate.instant('PMDT06_PRINT_FAIL_MSG'));
                },
            });
    }

    // ===== Helper =====
    getImpactLabel(count: number | undefined, label: string): string {
        if (!count || count === 0) return `${label}: -`;
        return `${label}: ${count} ${this.translate.instant('PMDT06_ITEMS_SUFFIX')}`;
    }

    getSaveButtonLabel(): string {
        if (this.isSaving) return this.translate.instant('PMDT06_SAVING_LABEL');
        if (this.selectedFlowId) {
            return this.isEdit ? this.translate.instant('PMDT06_SAVE_AND_SUBMIT_BTN') : this.translate.instant('PMDT06_CREATE_AND_SUBMIT_BTN');
        }
        return this.isEdit ? this.translate.instant('PMDT06_SAVE_BTN') : this.translate.instant('PMDT06_CREATE_BTN');
    }

    openItemDetail(type: 'PROJECT' | 'CUSTOMER' | 'REQ' | 'SPEC' | 'DIAGRAM' | 'TASK' | 'TC' | 'BUG', id?: string) {
        if (!id) return;
        let url = '';
        const base = '/feature/pm';
        const projId = this.projectId || this.form.get('projectId')?.value || '';

        switch (type) {
            case 'PROJECT':
                url = `${base}/project/${id}/edit`;
                break;
            case 'CUSTOMER':
                url = `${base}/customer/${id}/edit`;
                break;
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
        return status === 'AUTO' ? this.translate.instant('PMDT06_IMPACT_STATUS_AUTO') : this.translate.instant('PMDT06_IMPACT_STATUS_MANUAL');
    }
}