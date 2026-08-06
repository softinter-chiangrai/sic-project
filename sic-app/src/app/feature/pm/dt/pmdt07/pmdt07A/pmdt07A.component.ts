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

interface ChangeRequest {
    id?: string;
    projectId?: string;
    targetType: string;
    targetId: string;
    title: string;
    description?: string;
    changeReason?: string;
    assigneeId?: string;
    assigneeName?: string;
    assignees?: { id?: string; userId: string; userName?: string; targetType?: string; targetId?: string; status?: string }[];
    status?: string;
    rowVersion?: number;
}

@Component({
    selector: 'app-pmdt07a',
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
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './pmdt07A.component.html',
})
export class Pmdt07AComponent implements OnInit {
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
    form: FormGroup = this.fb.group({
        id: [null],
        projectId: [null],
        targetType: ['REQUIREMENT', Validators.required],
        targetId: [null, Validators.required],
        title: [null, Validators.required],
        description: [null],
        changeReason: [null],
        assigneeId: [null, Validators.required],
        rowVersion: [null],
    });

    selectedTargetType = signal('REQUIREMENT');
    selectedAssignees = signal<{ userId: string; userName: string }[]>([]);
    selectedAssigneeIds = computed(() => this.selectedAssignees().map(a => a.userId));

    documenttypeapiUrl = environment.apiBaseUrl + '/api/pm/approvals/flows/document-type/CHANGE_REQUEST';

    // ===== Methods =====

    onAssigneeSelected(item: any, combobox: any) {
        if (item && item.value) {
            const exists = this.selectedAssignees().some(a => a.userId === item.value);
            if (!exists) {
                this.selectedAssignees.update(arr => [...arr, { userId: item.value, userName: item.text }]);
                this.form.get('assigneeId')?.setValue(this.selectedAssignees()[0]?.userId || null);
                this.form.get('assigneeId')?.markAsDirty();
                this.form.get('assigneeId')?.markAsTouched();
            }
            combobox.writeValue(null);
        }
    }

    removeAssignee(userId: string) {
        this.selectedAssignees.update(arr => arr.filter(a => a.userId !== userId));
        this.form.get('assigneeId')?.setValue(this.selectedAssignees()[0]?.userId || null);
        this.form.get('assigneeId')?.markAsDirty();
        this.form.get('assigneeId')?.markAsTouched();
    }

    targetDocumentApiUrl = computed(() => {
        const type = this.selectedTargetType();
        if (type === 'REQUIREMENT') {
            return environment.apiBaseUrl + '/api/pm/requirement/combobox';
        } else if (type === 'SPECIFICATION') {
            return environment.apiBaseUrl + '/api/pm/specification/combobox';
        } else if (type === 'TASK') {
            return environment.apiBaseUrl + '/api/pm/tasks/combobox';
        }
        return '';
    });

    ngOnInit() {
        this.route.params.subscribe((params) => {
            const id = params['id'];
            if (id) {
                this.isEdit = true;
                this.changeRequestId = id;
                this.loadChangeRequest(id);
                // โหลด Impact Analysis เฉพาะตอนแก้ไข
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
            .get<ChangeRequest>(`${this.baseUrl}/${id}`)
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (data) => {
                    if (data.targetType) {
                        this.selectedTargetType.set(data.targetType);
                    }
                    this.form.patchValue(data);
                    if (data.assignees && data.assignees.length > 0) {
                        this.selectedAssignees.set(
                            data.assignees.map((a) => ({
                                userId: a.userId,
                                userName: a.userName || a.userId,
                            }))
                        );
                        this.form.get('assigneeId')?.setValue(data.assignees[0]?.userId || null);
                    } else if (data.assigneeId) {
                        this.selectedAssignees.set([{ userId: data.assigneeId, userName: data.assigneeName || data.assigneeId }]);
                        this.form.get('assigneeId')?.setValue(data.assigneeId);
                    } else {
                        this.selectedAssignees.set([]);
                        this.form.get('assigneeId')?.setValue(null);
                    }
                    if (data.projectId) {
                        this.projectId = data.projectId;
                    }
                    this.isLoading = false;
                },
                error: () => {
                    this.dialog.error('โหลดข้อมูลไม่สำเร็จ', 'ไม่พบ Change Request นี้');
                    this.navigation.navigate(['/feature/pm/pmdt07']);
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
                            documentCode: 'CR-' + id.substring(0, 8).toUpperCase(),
                            documentTitle: data.title || 'คำขอเปลี่ยนแปลง',
                            flowId: this.selectedFlowId,
                            comment: 'ส่งขออนุมัติ Change Request',
                        })
                        .pipe(finalize(() => (this.isSaving = false)))
                        .subscribe({
                            next: () => {
                                this.dialog.success('สำเร็จ', 'บันทึกและส่งขออนุมัติเรียบร้อย');
                                this.navigateBack();
                            },
                            error: (err) => {
                                this.dialog.error('ส่งขออนุมัติไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
                            },
                        });
                } else {
                    this.isSaving = false;
                    this.dialog.success('บันทึกสำเร็จ', 'Change Request ถูกบันทึกเรียบร้อย');
                    this.navigateBack();
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
            this.navigation.navigate(['/feature/pm/pmdt07'], {
                queryParams: { projectId: this.projectId }
            });
        } else {
            this.navigation.navigate(['/feature/pm/pmdt07']);
        }
    }

    cancel() {
        this.navigateBack();
    }

    // ===== Helper =====
    getImpactLabel(count: number | undefined, label: string): string {
        if (!count || count === 0) return `${label}: -`;
        return `${label}: ${count} รายการ`;
    }

    getImpactStatusClass(status?: string): string {
        if (status === 'AUTO') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }

    getImpactStatusText(status?: string): string {
        return status === 'AUTO' ? 'วิเคราะห์อัตโนมัติ' : 'วิเคราะห์ด้วยตนเอง';
    }
}