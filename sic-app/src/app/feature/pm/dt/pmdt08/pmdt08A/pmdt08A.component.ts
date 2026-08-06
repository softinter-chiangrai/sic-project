// src/app/feature/pm/dt/pmdt08A/pmdt08A.component.ts

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { SicApprovalComponent } from '../../../../../core/component/sic-approval/sic-approval.component';
import { SicButtonComponent } from '../../../../../core/component/sic-button/sic-button.component';
import { SicCheckboxComponent } from '../../../../../core/component/sic-checkbox/sic-checkbox.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicGridPanelComponent, SicGridPanelTemplate, SicGridPanelConfig } from '../../../../../core/component/sic-gridpanel/sic-gridpanel.component';
import { SicInputAreaComponent } from '../../../../../core/component/sic-input-area/sic-input-area.component';
import { SicInputComponent } from '../../../../../core/component/sic-input/sic-input.component';
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { Pmdt08Form } from '../pmdt08.form';
import { PmSpecificationModel, Pmdt08FormData } from '../pmdt08.model';
import { Pmdt08Service } from '../pmdt08.service';



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
        SicInputAreaComponent,
        SicNumberComponent,
        SicCheckboxComponent,
        SicGridPanelComponent,
        SicGridPanelTemplate,
        SicUploadComponent,
        SicApprovalComponent,
    ],
    templateUrl: './pmdt08A.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [`
        .spec-tabs {
            display: flex;
            gap: 0.25rem;
            border-bottom: 1px solid var(--border);
            overflow-x: auto;
            padding: 0 0.5rem;
        }
        .spec-tabs button {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text-muted);
            border: none;
            border-bottom: 2px solid transparent;
            background: transparent;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .spec-tabs button:hover {
            color: var(--text-active);
            background: var(--sidebar-hover);
        }
        .spec-tabs button.active {
            color: var(--crm-primary);
            border-bottom-color: var(--crm-primary);
        }
        .spec-tab-content {
            padding: 1.5rem 0;
        }
    `]
})
export class Pmdt08AComponent implements OnInit, CanComponentDeactivate {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private dialog = inject(DialogService);
    private navigation = inject(NavigationService);
    private fb = inject(FormBuilder);
    private cdr = inject(ChangeDetectorRef);

    // ✅ ทำให้เป็น public เพื่อใช้ใน template
    public service = inject(Pmdt08Service);
    public customerState = inject(CustomerStateService);

    apiBaseUrl = environment.apiBaseUrl;

    formData!: SicFromData<PmSpecificationModel>;
    isEdit = false;
    specId: string | null = null;
    isLoading = false;
    isSaving = false;
    isGenerating = signal(false);
    generatedDraft: any = null;

    // Tab state
    activeTab = 'general';

    // Grid Configs for child data
    screenGridConfig!: SicGridPanelConfig;
    fieldGridConfig!: SicGridPanelConfig;
    validationGridConfig!: SicGridPanelConfig;
    businessRuleGridConfig!: SicGridPanelConfig;
    apiGridConfig!: SicGridPanelConfig;

    // Requirement & Diagram selection
    selectedRequirementId: string | null = null;
    selectedDiagramId: string | null = null;

    pageDirty = () => this.formData?.dirty ?? false;

    // ✅ Combobox URL สำหรับ Requirement
    get requirementComboboxUrl(): string {
        const projectId = this.customerState.getProjectId() || '';
        return `${this.apiBaseUrl}/api/pm/requirement/combobox?projectId=${projectId}`;
    }

    // ✅ Combobox URL สำหรับ Diagram
    get diagramComboboxUrl(): string {
        const projectId = this.customerState.getProjectId() || '';
        return `${this.apiBaseUrl}/api/diagram/tabs?projectId=${projectId}`;
    }

    ngOnInit(): void {
        const resolved: Pmdt08FormData = this.route.snapshot.data['form'];
        if (resolved && resolved.specification) {
            this.formData = resolved.specification;
            if (this.formData.value.id) {
                this.isEdit = true;
                this.specId = this.formData.value.id;
                this.loadRequirementAndDiagramLinks();
            }
        } else {
            const form = Pmdt08Form.createForm(this.fb);
            this.formData = new SicFromData<PmSpecificationModel>(form);
        }

        // Read query params for creation
        this.route.queryParams.subscribe(params => {
            if (params['projectId'] && !this.isEdit) {
                // Store project context if needed
            }
            if (params['requirementId']) {
                this.selectedRequirementId = params['requirementId'];
                this.formData.formGroup.patchValue({ generatedFromRequirementId: params['requirementId'] });
                this.addRequirementLink(params['requirementId']);
            }
            if (params['diagramId']) {
                this.selectedDiagramId = params['diagramId'];
                this.formData.formGroup.patchValue({ generatedFromDiagramId: params['diagramId'] });
            }
        });

        this.initGridConfigs();
    }

    loadRequirementAndDiagramLinks(): void {
        // Load existing requirements into the grid
        const reqs = this.formData.value.requirements || [];
        if (reqs.length > 0) {
            // The grid will handle display
        }
    }

    // ===== Grid Configs =====

    initGridConfigs(): void {
        this.screenGridConfig = {
            api: '', // No API, it's local data
            id: 'id',
            pageable: false,
            createRowValue: { isRequired: false },
            columns: [
                { label: 'ชื่อหน้าจอ', name: 'screenName', type: 'text', editable: true, width: 180, validators: [Validators.required] },
                { label: 'คำอธิบาย', name: 'description', type: 'area', editable: true, width: 250 },
                { label: 'การนำทาง', name: 'navigation', type: 'text', editable: true, width: 200 },
                { label: 'URL Mockup', name: 'mockupUrl', type: 'text', editable: true, width: 200 },
            ]
        };

        this.fieldGridConfig = {
            api: '',
            id: 'id',
            pageable: false,
            createRowValue: { isRequired: false },
            columns: [
                { label: 'ชื่อฟิลด์', name: 'fieldName', type: 'text', editable: true, width: 150, validators: [Validators.required] },
                { label: 'ชนิดข้อมูล', name: 'dataType', type: 'combobox', editable: true, width: 140,
                  apiUrl: `${this.apiBaseUrl}/api/db/parameter/lov?group=COMMON&parameterCode=DATA_TYPE`,
                  valueField: 'value', textField: 'text' },
                { label: 'Required', name: 'isRequired', type: 'checkbox', editable: true, width: 80 },
                { label: 'Max Length', name: 'maxLength', type: 'number', editable: true, width: 100 },
                { label: 'ค่าเริ่มต้น', name: 'defaultValue', type: 'text', editable: true, width: 120 },
                { label: 'คำอธิบาย', name: 'description', type: 'area', editable: true, width: 200 },
            ]
        };

        this.validationGridConfig = {
            api: '',
            id: 'id',
            pageable: false,
            createRowValue: {},
            columns: [
                { label: 'ชนิด', name: 'validationType', type: 'combobox', editable: true, width: 140,
                  apiUrl: `${this.apiBaseUrl}/api/db/parameter/lov?group=PM&parameterCode=VALIDATION_TYPE`,
                  valueField: 'value', textField: 'text' },
                { label: 'Rule', name: 'rule', type: 'area', editable: true, width: 250, validators: [Validators.required] },
                { label: 'Error Message', name: 'errorMessage', type: 'text', editable: true, width: 200 },
            ]
        };

        this.businessRuleGridConfig = {
            api: '',
            id: 'id',
            pageable: false,
            createRowValue: { severity: 'Medium' },
            columns: [
                { label: 'ชื่อกฎ', name: 'ruleName', type: 'text', editable: true, width: 180, validators: [Validators.required] },
                { label: 'คำอธิบาย', name: 'description', type: 'area', editable: true, width: 250 },
                { label: 'Severity', name: 'severity', type: 'combobox', editable: true, width: 120,
                  apiUrl: `${this.apiBaseUrl}/api/db/parameter/lov?group=COMMON&parameterCode=SEVERITY`,
                  valueField: 'value', textField: 'text' },
            ]
        };

        this.apiGridConfig = {
            api: '',
            id: 'id',
            pageable: false,
            createRowValue: { httpMethod: 'GET' },
            columns: [
                { label: 'Method', name: 'httpMethod', type: 'combobox', editable: true, width: 100,
                  options: [{ value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' }, { value: 'PUT', label: 'PUT' }, { value: 'DELETE', label: 'DELETE' }] },
                { label: 'URL', name: 'url', type: 'text', editable: true, width: 200, validators: [Validators.required] },
                { label: 'Authentication', name: 'authentication', type: 'text', editable: true, width: 120 },
            ]
        };
    }

    // ===== Requirement & Diagram Helpers =====

    addRequirementLink(reqId: string): void {
        const current = this.formData.value.requirements || [];
        if (!current.some(r => r.requirementId === reqId)) {
            current.push({ requirementId: reqId });
            this.formData.formGroup.patchValue({ requirements: current });
            this.formData.formGroup.markAsDirty();
        }
    }

    removeRequirementLink(index: number): void {
        const current = this.formData.value.requirements || [];
        current.splice(index, 1);
        this.formData.formGroup.patchValue({ requirements: current });
        this.formData.formGroup.markAsDirty();
    }

    getRequirementTitle(reqId: string): string {
        // In real implementation, fetch from cache or service
        return reqId;
    }

    onRequirementSelect(event: any): void {
        if (event && event.value) {
            this.addRequirementLink(event.value);
            // Clear the combobox selection after adding
            // The combobox will be cleared via ViewChild if needed
        }
    }

    onDiagramSelect(event: any): void {
        if (event && event.value) {
            this.selectedDiagramId = event.value;
            this.formData.formGroup.patchValue({ generatedFromDiagramId: event.value });
            this.formData.formGroup.markAsDirty();
        }
    }

    // ===== AI Generator =====

    generateDraft(): void {
        const reqId = this.selectedRequirementId || this.formData.value.generatedFromRequirementId;
        const diagramId = this.selectedDiagramId || this.formData.value.generatedFromDiagramId;

        if (!reqId || !diagramId) {
            this.dialog.warn('กรุณาเลือก Requirement และ Diagram', 'ต้องมีทั้ง 2 รายการเพื่อสร้าง Specification');
            return;
        }

        this.isGenerating.set(true);
        this.service.generateDraft(reqId, diagramId)
            .pipe(finalize(() => this.isGenerating.set(false)))
            .subscribe({
                next: (draft) => {
                    this.generatedDraft = draft;
                    this.dialog.success('สร้าง Draft สำเร็จ', 'AI ได้สร้าง Specification Draft เรียบร้อย');
                    this.applyDraftToForm(draft);
                },
                error: (err) => {
                    this.dialog.error('สร้าง Draft ไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
                }
            });
    }

    applyDraftToForm(draft: any): void {
        this.formData.formGroup.patchValue({
            title: draft.title,
            objective: draft.objective,
            scope: draft.scope,
            description: draft.description,
            priority: draft.priority || 'Medium',
            estimatedManday: draft.estimatedManday || 0,
        });
        this.formData.formGroup.markAsDirty();
        this.dialog.success('นำ Draft มาใช้', 'ข้อมูลถูกเติมลงในฟอร์มเรียบร้อย');
        this.generatedDraft = null;
    }

    // ===== CRUD =====

    navigateToList(): void {
        this.navigation.navigate(['/feature/pm/pmdt08']);
    }

    onBack(): void {
        if (this.formData.dirty) {
            this.dialog.confirm('ยืนยัน', 'ข้อมูลยังไม่ได้บันทึก ต้องการออกใช่หรือไม่?')
                .then(ok => ok && this.navigateToList());
        } else {
            this.navigateToList();
        }
    }

    submit(): void {
        // Collect all data from grids
        const requirements = this.formData.formGroup.get('requirements')?.value || [];
        const screens = this.collectGridData('screens');
        const fields = this.collectGridData('fields');
        const validations = this.collectGridData('validations');
        const businessRules = this.collectGridData('businessRules');
        const apis = this.collectGridData('apis');

        const data = this.formData.value;
        data.requirements = requirements;
        data.screens = screens;
        data.fields = fields;
        data.validations = validations;
        data.businessRules = businessRules;
        data.apis = apis;

        // Set state
        data.state = this.isEdit ? 3 : 4;
        if (!this.isEdit) data.rowVersion = 0;

        this.isSaving = true;
        this.service.save(data)
            .pipe(finalize(() => this.isSaving = false))
            .subscribe({
                next: () => {
                    this.dialog.success('บันทึกสำเร็จ', 'Specification ถูกบันทึกเรียบร้อย');
                    this.formData.markAsPristine();
                    this.navigateToList();
                },
                error: (err) => {
                    this.dialog.error('บันทึกไม่สำเร็จ', err.error?.message || 'เกิดข้อผิดพลาด');
                }
            });
    }

    private collectGridData(type: string): any[] {
        // In real implementation, get data from grid components via ViewChild or from form value
        // For now, return from form value
        return this.formData.formGroup.get(type)?.value || [];
    }

    // ===== Tab Switching =====
    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }
}