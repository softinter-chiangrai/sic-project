// src/app/feature/pm/dt/pmdt08/pmdt08A/pmdt08A.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, signal, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '../../../../../core/config/ai-models.config';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize, Subscription, interval, takeWhile, tap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from 'sic-ng';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from 'sic-ng';
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { SicApprovalComponent } from '../../../../../core/component/sic-approval/sic-approval.component';
import { SicDatePipe } from '../../../../../core/pipes/sic-date.pipe';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { LanguageService } from '../../../../../core/services/language.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { BusinessService } from '../../../../../core/services/business.service';
import { AuthService } from '../../../../../core/auth/auth.service';

import { Pmdt07Service } from '../pmdt07.service';
import { PmSpecificationModel } from '../pmdt07.model';
import { Pmdt07AResolvedPageData } from '../pmdt07.resolver';
import { Pmdt07AForm } from './pmdt07A.form';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { Pmdt07PreviewComponent } from '../pmdt07-preview/pmdt07-preview.component';
import { SpecificationExportService } from '../specification-export.service';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { HttpClient } from '@angular/common/http';
import { SicCheckboxComponent } from 'sic-ng';
import { AiHistoryService } from '../../../../../core/services/ai-history.service';
import { SicTraceLinkPanelComponent } from '../../../../../core/component/sic-trace-link-panel/sic-trace-link-panel.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { smartPatchFormAiDraft } from '../../../../../core/utils/ai-form-patch.util';
import { AiAttachmentPayload, filesToAiAttachments } from '../../../../../core/utils/ai-attachment.util';
import { tryAiAutoOpen } from '../../../../../core/utils/ai-navigator-deeplink.util';
import { SicAiAttachmentPickerComponent } from '../../../../../core/component/sic-ai-attachment-picker/sic-ai-attachment-picker.component';

@Component({
    selector: 'app-pmdt07a',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SicButtonComponent,
        SicVersionBadgeComponent,
        SicComboboxComponent,
        SicInputComponent,
        SicNumberComponent,
        SicTiptapEditorComponent,
        SicUploadComponent,
        SicCheckboxComponent,
        SicApprovalComponent,
        SicDatePipe,
        Pmdt07PreviewComponent,
        SicTraceLinkPanelComponent,
        TranslateModule,
        SicAiAttachmentPickerComponent
    ],
    templateUrl: './pmdt07A.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
        .pmdt08-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            height: calc(100vh - 200px);
            min-height: 600px;
        }
        .pmdt08-layout--edit-only {
            grid-template-columns: 1fr;
        }
        .pmdt08-layout--preview-only {
            grid-template-columns: 1fr;
        }
        .pmdt08-panel {
            overflow-y: auto;
            padding: 1.5rem;
            background: var(--sidebar);
            border-radius: 0.75rem;
            border: 1px solid var(--border);
        }
        .pmdt08-panel--preview {
            background: var(--bg);
        }
        @media (max-width: 1024px) {
            .pmdt08-layout {
                grid-template-columns: 1fr;
                height: auto;
            }
        }
        .auto-save-indicator {
            display: flex;
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
export class Pmdt07AComponent implements OnInit, OnDestroy, CanComponentDeactivate {
    // Dependencies
    readonly route = inject(ActivatedRoute);
    readonly router = inject(Router);
    readonly service = inject(Pmdt07Service);
    readonly dialog = inject(DialogService);
    private readonly fb = inject(FormBuilder);
    private readonly navigation = inject(NavigationService);
    private readonly cdr = inject(ChangeDetectorRef);
    readonly customerState = inject(CustomerStateService);
    private readonly businessService = inject(BusinessService);
    readonly exportService = inject(SpecificationExportService);
    private readonly approvalService = inject(ApprovalService);
    private readonly http = inject(HttpClient);
    private readonly languageService = inject(LanguageService);
    private readonly auth = inject(AuthService);
    readonly aiHistoryService = inject(AiHistoryService);
    private readonly translate = inject(TranslateService);

    apiBaseUrl = environment.apiBaseUrl;
    userApiUrl = '';
    businessId: string | null = null;

    // Form
    formData!: SicFromData<PmSpecificationModel>;
    get form(): FormGroup {
        return this.formData?.formGroup;
    }
    isEdit = false;
    isViewOnly = false;
    isLocked = false;
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

    // AI Assistant State
    showAiAssistModal = false;
    isGeneratingAiAssist = false;
    aiAssistTab: 'generate' | 'history' = 'generate';
    aiAssistRequirementId = '';
    aiAssistDiagramIds: string[] = [];
    aiAssistPrompt = '';
    aiAssistModel = DEFAULT_AI_MODEL;
    aiModels = AI_MODEL_OPTIONS;
    aiHistories: any[] = [];
    aiCurrentDraft: any = null;
    aiCurrentVersionNo: number | null = null;
    previewHistoryId: string | null = null;
    copiedId: string | null = null;
    aiAttachedFiles = signal<File[]>([]);

    // Auto-save
    private autoSaveSubscription: Subscription | null = null;
    private formChangeSubscription: Subscription | null = null;
    private autoSaveEnabled = true;
    private autoSaveInterval = 30000;

    isSaved = false;
    pageDirty = () => this.isViewOnly ? false : (this.isSaved ? false : (this.formData?.isChanged ?? false));

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
        if (isViewRoute) {
            this.isViewOnly = true;
            this.viewMode = 'preview';
        }

        // Check if navigated with AI Draft State
        const aiDraft = history.state?.aiDraft;

        const resolvedData: Pmdt07AResolvedPageData = this.route.snapshot.data['form'];

        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.isEdit = !this.isViewOnly;
                this.specId = id;
                const resolvedSpec = resolvedData?.specification?.value;
                if (resolvedSpec?.id) {
                    this.applySpecificationData(resolvedSpec);
                } else {
                    this.loadSpecification(id);
                }
            } else {
                // New spec
                this.route.queryParams.subscribe(qParams => {
                    const pId = qParams['projectId'] || this.customerState.getProjectId();
                    if (pId) {
                        this.formData.patchValue({ projectId: pId } as any);
                        this.fetchProjectName(pId);
                    }
                    const reqId = qParams['requirementId'];
                    if (reqId) {
                        this.formData.patchValue({ 
                            requirementId: reqId,
                            generatedFromRequirementId: reqId 
                        } as any);
                    }
                    const diagId = qParams['diagramId'];
                    if (diagId) {
                        this.formData.patchValue({ generatedFromDiagramId: diagId } as any);
                    }

                    // Global AI Navigator ส่งผู้ใช้มาที่นี่พร้อมสั่งให้เปิด AI Draft Modal และกรอกข้อมูลทันที
                    tryAiAutoOpen({
                        params: qParams,
                        router: this.router,
                        route: this.route,
                        moduleType: 'SPECIFICATION',
                        canOpen: () => !this.isViewOnly,
                        setPrompt: (p) => (this.aiAssistPrompt = p),
                        open: () => this.openAiAssist(),
                        generate: () => this.generateWithAi(),
                    });
                });
                const userName = this.getUserNameFromToken();
                if (userName) this.formData.patchValue({ createdBy: userName } as any);
                this.formData.patchValue({ createdDate: new Date().toISOString() } as any);

                // Pre-fill from AI Draft if available
                if (aiDraft) {
                    this.form.patchValue({
                        title: aiDraft.title || this.form.value.title,
                        specificationType: aiDraft.specificationType || this.form.value.specificationType,
                        priority: aiDraft.priority || this.form.value.priority,
                        estimatedManday: aiDraft.estimatedManday || this.form.value.estimatedManday,
                        description: aiDraft.description || this.form.value.description,
                        projectId: aiDraft.projectId || this.form.value.projectId,
                        requirementId: aiDraft.requirementId || this.form.value.requirementId,
                        generatedFromRequirementId: aiDraft.requirementId || this.form.value.generatedFromRequirementId,
                        generatedFromDiagramId: aiDraft.diagramId || this.form.value.generatedFromDiagramId,
                    });
                    if (aiDraft.projectId) this.fetchProjectName(aiDraft.projectId);
                    this.form.markAsDirty();
                    this.cdr.markForCheck();
                } else {
                    this.formData.resetModel(this.form.getRawValue() as any);
                    this.cdr.markForCheck();
                }
            }
        });

        this.setupAutoSave();
    }

    // ===== AI Assistant In-Form =====
    openAiAssist(): void {
        const formVal = this.form.value;
        this.aiAssistRequirementId = formVal.requirementId || formVal.generatedFromRequirementId || '';
        const currentDiagId = formVal.generatedFromDiagramId;
        if (currentDiagId) {
            this.aiAssistDiagramIds = typeof currentDiagId === 'string' ? currentDiagId.split(',').map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(currentDiagId) ? currentDiagId : [String(currentDiagId)]);
        } else {
            this.aiAssistDiagramIds = [];
        }
        this.aiAssistPrompt = '';
        this.aiAssistTab = 'generate';
        this.loadAiHistory();
        this.showAiAssistModal = true;
        this.cdr.markForCheck();
    }

    closeAiAssist(): void {
        this.showAiAssistModal = false;
        this.cdr.markForCheck();
    }

    loadAiHistory(): void {
        const targetId = this.specId || this.form?.value?.id || 'new';
        this.aiHistories = this.aiHistoryService.getHistories('specification', targetId);
    }

    async generateWithAi(): Promise<void> {
        const formVal = this.form.value;
        const projectId = formVal.projectId;
        const requirementId = this.aiAssistRequirementId || formVal.requirementId || formVal.generatedFromRequirementId;
        const diagramIds = Array.isArray(this.aiAssistDiagramIds) ? this.aiAssistDiagramIds : (this.aiAssistDiagramIds ? [this.aiAssistDiagramIds] : []);
        const specType = formVal.specificationType || 'UI Specification';
        const targetId = this.specId || formVal.id || 'new';

        this.isGeneratingAiAssist = true;
        this.cdr.markForCheck();

        let attachments: AiAttachmentPayload[] = [];
        if (this.aiAttachedFiles().length) {
            attachments = await filesToAiAttachments(this.aiAttachedFiles());
        }

        this.service.generateDraft({
            projectId: projectId || undefined,
            requirementId: requirementId || undefined,
            diagramIds: diagramIds.length > 0 ? diagramIds : undefined,
            diagramId: diagramIds.length === 1 ? diagramIds[0] : undefined,
            specificationType: specType,
            prompt: this.aiAssistPrompt || undefined,
            model: this.aiAssistModel || undefined,
            attachments,
        }).pipe(finalize(() => {
            this.isGeneratingAiAssist = false;
            this.cdr.markForCheck();
        })).subscribe({
            next: (draft) => {
                if (!draft) {
                    this.dialog.warn(this.translate.instant('PMDT07_AI_NO_DATA_TITLE'), this.translate.instant('PMDT07_AI_NO_DATA_MSG'));
                    return;
                }

                const currentTitle = this.form.value.title;
                const titleToSet = (currentTitle && currentTitle.trim() !== '') ? currentTitle : (draft.title || currentTitle);

                const fullDraft = {
                    ...draft,
                    title: titleToSet,
                    specificationType: draft.specificationType || specType,
                    priority: draft.priority || this.form.value.priority || 'MEDIUM',
                    estimatedManday: draft.estimatedManday || this.form.value.estimatedManday,
                    description: draft.generatedHtmlDescription || draft.description || this.form.value.description,
                    requirementId: requirementId,
                    diagramIds: diagramIds,
                };

                const historyItem = this.aiHistoryService.addHistory(
                    'specification',
                    targetId,
                    fullDraft,
                    this.aiAssistPrompt,
                    this.aiAssistModel,
                    titleToSet
                );

                this.loadAiHistory();
                this.aiCurrentDraft = fullDraft;
                this.aiCurrentVersionNo = historyItem.versionNo;

                // ดึงข้อมูลหัวข้อและเนื้อหาที่ AI สร้างลงในฟอร์มทันที
                this.applyDraftToForm(fullDraft);
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.dialog.error(this.translate.instant('PMDT07_AI_GEN_FAIL_TITLE'), err.error?.message || this.translate.instant('PMDT07_AI_CONNECT_ERROR_MSG'));
            }
        });
    }

    pasteSpecificationDraft(draft: any): void {
        if (!draft) return;

        this.applyDraftToForm(draft);
        this.closeAiAssist();
        this.dialog.success(this.translate.instant('PMDT07_PASTE_SUCCESS_TITLE'), this.translate.instant('PMDT07_PASTE_SUCCESS_MSG'));
    }

    private applyDraftToForm(draft: any): void {
        if (!draft) return;
        // Smart Preserve: กรอกเฉพาะช่องที่ผู้ใช้ยังไม่ได้กรอก ห้ามเขียนทับสิ่งที่ผู้ใช้พิมพ์ไว้แล้ว
        smartPatchFormAiDraft(
            this.form,
            {
                title: draft.title,
                priority: draft.priority,
                estimatedManday: draft.estimatedManday,
                description: draft.generatedHtmlDescription || draft.description,
            },
            ['id'],
        );

        // ฟิลด์ความสัมพันธ์/เมทาดาทา — AI กำหนดค่าทับได้เสมอ ไม่ใช่ผู้ใช้พิมพ์เอง
        if (draft.requirementId) {
            this.form.patchValue({
                requirementId: draft.requirementId,
                generatedFromRequirementId: draft.requirementId
            });
        }
        if (draft.diagramIds && draft.diagramIds.length > 0) {
            this.form.patchValue({
                generatedFromDiagramId: draft.diagramIds.join(',')
            });
        }
        if (draft.specificationType) {
            this.form.patchValue({ specificationType: draft.specificationType });
        }
        this.form.markAsDirty();
    }

    deleteAiHistory(id: string, event: Event): void {
        event.stopPropagation();
        const targetId = this.specId || this.form?.value?.id || 'new';
        this.aiHistoryService.deleteHistory('specification', targetId, id);
        this.loadAiHistory();
        this.cdr.markForCheck();
    }

    togglePreview(id: string): void {
        this.previewHistoryId = this.previewHistoryId === id ? null : id;
    }

    copyDraft(draft: any, id?: string): void {
        if (!draft) return;
        const text = `Specification: ${draft.title || ''}\nType: ${draft.specificationType || ''}\nPriority: ${draft.priority || ''}\nManday: ${draft.estimatedManday || ''}\n\nDescription:\n${draft.description || ''}`;
        navigator.clipboard?.writeText(text).then(() => {
            this.copiedId = id || 'current';
            setTimeout(() => { this.copiedId = null; this.cdr.markForCheck(); }, 2000);
            this.cdr.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this.autoSaveSubscription?.unsubscribe();
        this.formChangeSubscription?.unsubscribe();
    }

    specificationTypeOptions = [
        { value: 'UI Specification', text: 'UI Specification' },
        { value: 'API Specification', text: 'API Specification' },
        { value: 'Business Rule Specification', text: 'Business Rule Specification' },
        { value: 'Report Specification', text: 'Report Specification' },
        { value: 'Data Specification', text: 'Data Specification' },
        { value: 'Integration Specification', text: 'Integration Specification' },
        { value: 'Permission Specification', text: 'Permission Specification' },
    ];

    initForm(): void {
        this.formData = new SicFromData<PmSpecificationModel>(Pmdt07AForm.createForm(this.fb));
    }

    loadSpecification(id: string) {
        this.isLoading = true;
        this.service.getSpecification(id).subscribe({
            next: (data) => {
                this.applySpecificationData(data);
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.dialog.error(this.translate.instant('PMDT07_LOAD_FAIL_TITLE'), this.translate.instant('PMDT07_SPEC_NOT_FOUND_MSG'));
                this.navigation.navigate(['/feature/pm/specification']);
            }
        });
    }

    private applySpecificationData(data: PmSpecificationModel) {
        this.form.patchValue(data);
        if (data.owner && typeof data.owner === 'string') {
            const owners = data.owner.split(',').map((s: string) => s.trim()).filter(Boolean);
            this.form.patchValue({ owner: owners });
        }
        if (!data.projectName && data.projectId) {
            this.fetchProjectName(data.projectId);
        }
        if (!data.createdBy) {
            const userName = this.getUserNameFromToken();
            if (userName) this.form.patchValue({ createdBy: userName });
        }
        if (data.isLocked) {
            this.isLocked = true;
            this.isViewOnly = true;
        } else {
            this.isLocked = false;
            const isViewRoute = this.router.url.includes('/view');
            this.isViewOnly = isViewRoute;
        }
        if (this.isViewOnly) {
            this.form.disable();
        } else {
            this.form.enable();
        }

        this.formData.resetModel(this.form.getRawValue() as any);
        this.cdr.markForCheck();
    }

    // ผู้ใช้เลือกโครงการเองจาก Combobox (ไม่ต้องเคยเข้าหน้าโครงการมาก่อน) — sync ชื่อโครงการ และล้าง Requirement เดิมที่อาจไม่ตรงกับโครงการใหม่
    onProjectSelected(item: any): void {
        const projectName = item ? (item.text ?? item.label ?? '') : '';
        this.form.patchValue({ projectName, requirementId: null });
        this.cdr.markForCheck();
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
                        this.formData.resetModel(this.form.getRawValue() as any);
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
        const rawData = { ...this.form.getRawValue() };
        const uploadGroupId = this.extractUploadGroupId(rawData.uploadGroupId);
        rawData.uploadGroupId = uploadGroupId || null;

        if (Array.isArray(rawData.owner)) {
            rawData.owner = rawData.owner.filter((o: any) => o !== null && o !== undefined && String(o).trim() !== '').join(', ');
        }

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

        if (this.specId || data.id) {
            data.id = (data.id || this.specId) ?? undefined;
            data.state = 3; // MODIFIED
            this.isEdit = true;
        } else {
            data.state = 4; // ADDED
            data.rowVersion = 0;
        }

        this.isAutoSaving = true;
        this.lastAutoSaveTime = new Date();

        this.service.autoSave(data).subscribe({
            next: (response: any) => {
                this.isAutoSaving = false;
                const savedId = typeof response === 'string' ? response : (response?.id || data.id || this.specId);
                if (savedId) {
                    this.specId = savedId;
                    this.isEdit = true;
                    this.form.patchValue({ id: savedId });
                }
                if (typeof response === 'object' && response !== null) {
                    this.form.patchValue(response);
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
            case 'saving': return this.translate.instant('PMDT07_AUTOSAVE_SAVING');
            case 'saved': return this.translate.instant('PMDT07_AUTOSAVE_SAVED') + ' ' + this.formatTimeDiff(this.lastAutoSaveTime);
            case 'dirty': return this.translate.instant('PMDT07_AUTOSAVE_DIRTY');
            default: return this.translate.instant('PMDT07_AUTOSAVE_IDLE');
        }
    }

    private formatTimeDiff(date: Date | null): string {
        if (!date) return '';
        const diff = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diff < 60) return `(${diff} ${this.translate.instant('PMDT07_SECONDS_AGO')})`;
        return `(${Math.floor(diff / 60)} ${this.translate.instant('PMDT07_MINUTES_AGO')})`;
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

    // ===== Print =====
    printSpecification(): void {
        const id = this.specId || this.form.getRawValue().id;
        if (!id) {
            this.dialog.warn(this.translate.instant('PMDT07_NOT_SAVED_TITLE'), this.translate.instant('PMDT07_SAVE_BEFORE_PRINT_MSG'));
            return;
        }

        this.isLoading = true;
        const url = `${this.apiBaseUrl}/api/pm/specifications/${id}/export-pdf`;
        const printLang = this.languageService.getCurrentLanguage();
        this.http.get(url, { params: { lang: printLang }, responseType: 'blob' })
            .pipe(finalize(() => {
                this.isLoading = false;
                this.cdr.markForCheck();
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
                    console.error('Print specification error:', err);
                    this.dialog.error(this.translate.instant('PMDT07_PRINT_FAIL_TITLE'), this.translate.instant('PMDT07_PRINT_FAIL_MSG'));
                },
            });
    }

    // ===== Export (JasperReports PDF) =====
    exportSpecification(): void {
        const id = this.specId || this.form.getRawValue().id;
        if (!id) {
            this.dialog.warn(this.translate.instant('PMDT07_NOT_SAVED_TITLE'), this.translate.instant('PMDT07_SAVE_BEFORE_EXPORT_MSG'));
            return;
        }

        this.isLoading = true;
        const url = `${this.apiBaseUrl}/api/pm/specifications/${id}/export-pdf`;
        const lang = this.languageService.getCurrentLanguage();
        this.http.get(url, { params: { lang }, responseType: 'blob' })
            .pipe(finalize(() => {
                this.isLoading = false;
                this.cdr.markForCheck();
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
                    console.error('Export specification error:', err);
                    this.dialog.error(this.translate.instant('PMDT07_OPEN_DOC_FAIL_TITLE'), this.translate.instant('PMDT07_PRINT_FAIL_MSG'));
                },
            });
    }

    // ===== Submit =====
    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.dialog.warn(this.translate.instant('PMDT07_FORM_INVALID_TITLE'), this.translate.instant('PMDT07_FILL_ALL_FIELDS_MSG'));
            return;
        }

        this.isSaving = true;
        const data = this.prepareSubmitData();
        if (this.specId || data.id) {
            data.id = (data.id || this.specId) ?? undefined;
            data.state = 3; // MODIFIED
            this.isEdit = true;
        } else {
            data.state = 4; // ADDED
            data.rowVersion = 0;
        }

        this.service.save(data).subscribe({
            next: (response: any) => {
                this.form.markAsPristine();
                let savedId = typeof response === 'string' ? response : (response?.id || data.id || this.specId);
                if (savedId) {
                    this.specId = savedId;
                    this.isEdit = true;
                    this.form.patchValue({ id: savedId });
                    if (typeof response === 'object' && response !== null) {
                        this.form.patchValue(response);
                    }
                }

                this.isSaved = true;

                if (this.selectedFlowId && savedId) {
                    this.approvalService.submitForApproval({
                        documentType: 'SPECIFICATION',
                        documentId: savedId,
                        documentCode: data.specificationCode,
                        documentTitle: data.title,
                        version: data.version,
                        flowId: this.selectedFlowId,
                        comment: this.translate.instant('PMDT07A_SUBMIT_APPROVAL_COMMENT')
                    }).subscribe({
                        next: () => {
                            this.isSaving = false;
                            this.dialog.success(this.translate.instant('PMDT07_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT07_SAVE_SUCCESS_MSG')).then(() => {
                                this.navigateBack(data.projectId);
                            });
                        },
                        error: (err) => {
                            this.isSaving = false;
                            this.dialog.success(this.translate.instant('PMDT07_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT07_SAVE_SUCCESS_MSG')).then(() => {
                                this.navigateBack(data.projectId);
                            });
                        }
                    });
                } else {
                    this.isSaving = false;
                    this.dialog.success(this.translate.instant('PMDT07_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT07_SAVE_SUCCESS_MSG')).then(() => {
                        this.navigateBack(data.projectId);
                    });
                }
            },
            error: (error) => {
                this.isSaving = false;
                const errorMsg = error.error?.message || error.error?.detail || error.message || this.translate.instant('PMDT07_SAVE_ERROR_MSG');
                this.dialog.error(this.translate.instant('PMDT07_SAVE_FAIL_TITLE'), errorMsg);
            }
        });
    }

    private navigateBack(projectId?: string): void {
        if (projectId) {
            this.customerState.setProject(projectId);
        }
        this.navigation.navigate(['/feature/pm/specification']);
    }

    onBack(): void {
        const projectId = this.form.get('projectId')?.value;
        this.navigateBack(projectId);
    }

    requestChange(): void {
        const projectId = this.form.get('projectId')?.value;
        this.navigation.navigate(['/feature/pm/change-request/new'], {
            queryParams: {
                projectId,
                targetType: 'SPECIFICATION',
                targetId: this.specId,
                targetTitle: this.form.get('title')?.value,
            },
        });
    }
}