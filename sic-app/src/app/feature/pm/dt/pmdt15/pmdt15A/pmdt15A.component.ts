import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '../../../../../core/config/ai-models.config';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SicButtonComponent } from 'sic-ng';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from 'sic-ng';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-base-model';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { ApprovalService } from '../../pmdt03/approval.service';
import { ApprovalFlow } from '../../pmdt03/approval.model';

import { Pmdt15AForm } from './pmdt15A.form';
import { Pmdt15AService } from './pmdt15A.service';
import { PmUserManualModel, PmUserManualSectionModel } from './pmdt15A.model';
import { Pmdt15APageData } from './pmdt15A.resolver';
import { AiHistoryService, AiHistoryItem } from '../../../../../core/services/ai-history.service';
import { smartPatchFormAiDraft } from '../../../../../core/utils/ai-form-patch.util';
import { AiAttachmentPayload, filesToAiAttachments } from '../../../../../core/utils/ai-attachment.util';
import { tryAiAutoOpen } from '../../../../../core/utils/ai-navigator-deeplink.util';
import { SicAiAttachmentPickerComponent } from '../../../../../core/component/sic-ai-attachment-picker/sic-ai-attachment-picker.component';

@Component({
  selector: 'app-pmdt15a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SicButtonComponent,
    SicVersionBadgeComponent,
    SicComboboxComponent,
    SicInputComponent,
    SicTiptapEditorComponent,
    SicUploadComponent,
    TranslateModule,
    SicAiAttachmentPickerComponent,
  ],
  templateUrl: './pmdt15A.component.html',
  styleUrls: ['./pmdt15A.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt15AComponent implements OnInit, CanComponentDeactivate {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(Pmdt15AService);
  private readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly approvalService = inject(ApprovalService);
  private readonly http = inject(HttpClient);
  private readonly aiHistoryService = inject(AiHistoryService);
  private readonly translate = inject(TranslateService);

  formData!: SicFromData<PmUserManualModel>;
  id = signal<string | null>(null);
  isEdit = signal(false);
  isSaving = signal(false);
  isPrinting = signal(false);
  isLocked = signal(false);

  // Approval Flow
  approvalFlowsApi = `${apiBaseUrl}/api/pm/approvals/flows/document-type/USER_MANUAL`;
  flows = signal<ApprovalFlow[]>([]);
  selectedFlowId = signal<string | null>(null);
  isLoadingFlows = signal(false);

  sections = signal<PmUserManualSectionModel[]>([]);
  activeSectionIndex = signal<number>(0);
  selectedSectionIndex = computed(() => this.activeSectionIndex());
  selectedSection = computed(() => {
    const list = this.sections();
    const idx = this.activeSectionIndex();
    return list[idx] || null;
  });

  onSectionFieldChange(index: number, field: string, value: any): void {
    if (this.isLocked()) return;
    const current = [...this.sections()];
    if (current[index]) {
      (current[index] as any)[field] = value;
      if (current[index].id) {
        current[index].state = SicEntityState.Modified;
      }
      this.sections.set(current);
      this.formData.markAsDirty();
      this.cdr.markForCheck();
    }
  }

  typeOptions = [
    { label: this.translate.instant('PMDT15_TYPE_USER_A'), value: 'USER' },
    { label: this.translate.instant('PMDT15_TYPE_ADMIN_A'), value: 'ADMIN' },
    { label: this.translate.instant('PMDT15_TYPE_INSTALL_A'), value: 'INSTALLATION' },
    { label: this.translate.instant('PMDT15_TYPE_OPERATION'), value: 'OPERATION' },
    { label: this.translate.instant('PMDT15_TYPE_TROUBLESHOOT'), value: 'TROUBLESHOOT' },
  ];

  deliveryOptions = signal<Array<{ value: string; text: string }>>([]);
  apiGetComboboxProject = `${apiBaseUrl}/api/pm/customer-projects/combobox`;
  isProjectDerived = signal(false);

  // AI Generator Modal State
  showAiModal = signal(false);
  isGeneratingAi = signal(false);
  aiAssistTab = signal<'generate' | 'history'>('generate');
  aiModel = signal(DEFAULT_AI_MODEL);
  aiModels = AI_MODEL_OPTIONS;
  aiManualType = signal('USER');
  aiSelectedRequirementIds = signal<string[]>([]);
  aiSelectedSpecificationIds = signal<string[]>([]);
  aiPrompt = signal('');
  aiReplaceMode = signal<'replace' | 'append'>('replace');
  requirementOptions = signal<Array<{ value: string; text: string }>>([]);
  specificationOptions = signal<Array<{ value: string; text: string }>>([]);
  isLoadingAiOptions = signal(false);
  aiHistories = signal<AiHistoryItem[]>([]);
  aiCurrentDraft = signal<any | null>(null);
  aiCurrentVersionNo = signal<number | null>(null);
  previewHistoryId = signal<string | null>(null);
  copiedId = signal<string | null>(null);
  aiAttachedFiles = signal<File[]>([]);

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  ngOnInit(): void {
    const rawForm = Pmdt15AForm.createForm(this.fb);
    this.formData = new SicFromData<PmUserManualModel>(rawForm);

    this.initDefaultSections();
    this.loadApprovalFlows();

    this.route.queryParams.subscribe((qParams) => {
      const queryProj = qParams['projectId'];
      if (queryProj) {
        this.formData.patchValue({ projectId: queryProj } as any);
        this.loadDeliveryOptions(queryProj);
        this.loadAiComboboxOptions(queryProj);
        this.cdr.markForCheck();
      } else {
        this.loadDeliveryOptions();
        this.loadAiComboboxOptions();
      }

      // Global AI Navigator ส่งผู้ใช้มาที่นี่พร้อมสั่งให้เปิด AI Draft Modal และกรอกข้อมูลทันที
      tryAiAutoOpen({
        params: qParams,
        router: this.router,
        route: this.route,
        moduleType: 'USER_MANUAL',
        canOpen: () => !this.isLocked(),
        setPrompt: (p) => this.aiPrompt.set(p),
        open: () => this.openAiModal(),
        generate: () => this.generateWithAi(),
      });
    });

    const page: Pmdt15APageData = this.route.snapshot.data['pageData'];
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.isEdit.set(true);
      this.id.set(paramId);
      if (page?.data) {
        this.applyManualData(page.data);
      } else {
        this.loadData(paramId);
      }
    }
    this.cdr.markForCheck();
  }

  // ผู้ใช้เลือกโครงการเองจาก Combobox (ไม่ต้องเคยเข้าหน้าโครงการมาก่อน) — โหลด Delivery/AI options ของโครงการที่เลือกใหม่
  onProjectSelected(item: any): void {
    const projId = item?.value ?? item?.id ?? null;
    this.loadDeliveryOptions(projId || undefined);
    this.loadAiComboboxOptions(projId || undefined);
    this.cdr.markForCheck();
  }

  // เลือก Specification/Delivery แล้วผูกโครงการให้อัตโนมัติ (ตัวเลือกหลักตามแผนผังความสัมพันธ์)
  onRelatedSpecSelected(item: any): void {
    const specId = item?.value ?? item?.id ?? null;
    if (!specId) {
      this.isProjectDerived.set(false);
      this.cdr.markForCheck();
      return;
    }
    this.formData.patchValue({ deliveryId: null } as any);
    this.http.get<any>(`${apiBaseUrl}/api/pm/specifications/${specId}`).subscribe({
      next: (spec) => {
        const projId = spec?.projectId || spec?.project?.id;
        if (projId) {
          this.formData.patchValue({ projectId: projId } as any);
          this.isProjectDerived.set(true);
          this.loadDeliveryOptions(projId);
        }
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck(),
    });
  }

  onDeliverySelected(item: any): void {
    const deliveryId = item?.value ?? item?.id ?? null;
    if (!deliveryId) {
      this.isProjectDerived.set(!!this.formData.form.get('relatedSpecId')?.value);
      this.cdr.markForCheck();
      return;
    }
    this.http.get<any>(`${apiBaseUrl}/api/pm/delivery/${deliveryId}`).subscribe({
      next: (delivery) => {
        const projId = delivery?.projectId;
        if (projId) {
          this.formData.patchValue({ projectId: projId } as any);
          this.isProjectDerived.set(true);
        }
        this.cdr.markForCheck();
      },
      error: () => this.cdr.markForCheck(),
    });
  }

  loadAiComboboxOptions(projectId?: string): void {
    const projId = projectId || (this.formData?.form?.value as any)?.projectId || this.route.snapshot.queryParams['projectId'];
    this.isLoadingAiOptions.set(true);

    this.service.getRequirementCombobox(projId).subscribe({
      next: (res) => {
        this.requirementOptions.set(res || []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.requirementOptions.set([]);
        this.cdr.markForCheck();
      },
    });

    this.service.getSpecificationCombobox(projId).subscribe({
      next: (res) => {
        this.specificationOptions.set(res || []);
        this.isLoadingAiOptions.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.specificationOptions.set([]);
        this.isLoadingAiOptions.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  loadAiHistory(): void {
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.aiHistories.set(this.aiHistoryService.getHistories('user_manual', targetId));
  }

  deleteAiHistory(id: string, e: MouseEvent): void {
    e.stopPropagation();
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.dialog.confirm(this.translate.instant('PMDT15_CONFIRM_DELETE_TITLE'), this.translate.instant('PMDT15_CONFIRM_DEL_HIST_MSG')).then((ok: boolean) => {
      if (ok) {
        this.aiHistoryService.deleteHistory('user_manual', targetId, id);
        this.loadAiHistory();
        this.cdr.markForCheck();
      }
    });
  }

  clearAllAiHistory(): void {
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.dialog.confirm(this.translate.instant('PMDT15_CONFIRM_CLEAR_TITLE'), this.translate.instant('PMDT15_CONFIRM_CLEAR_MSG')).then((ok: boolean) => {
      if (ok) {
        this.aiHistoryService.clearHistories('user_manual', targetId);
        this.loadAiHistory();
        this.cdr.markForCheck();
      }
    });
  }

  openAiModal(): void {
    if (this.isLocked()) {
      this.dialog.warn(this.translate.instant('PMDT15_CANNOT_PROCEED_TITLE'), this.translate.instant('PMDT15_DOC_LOCKED_MSG'));
      return;
    }
    const currentType = (this.formData?.form?.value as any)?.manualType || 'USER';
    this.aiManualType.set(currentType);
    this.aiPrompt.set('');
    this.aiAssistTab.set('generate');
    this.loadAiHistory();

    const projId = (this.formData?.form?.value as any)?.projectId || this.route.snapshot.queryParams['projectId'];
    this.loadAiComboboxOptions(projId);
    this.showAiModal.set(true);
    this.cdr.markForCheck();
  }

  closeAiModal(): void {
    if (this.isGeneratingAi()) return;
    this.showAiModal.set(false);
    this.cdr.markForCheck();
  }

  async generateWithAi(): Promise<void> {
    if (this.isGeneratingAi()) return;

    const projId = (this.formData?.form?.value as any)?.projectId || this.route.snapshot.queryParams['projectId'];
    const currentTitle = (this.formData?.form?.value as any)?.manualTitle;
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';

    this.isGeneratingAi.set(true);
    this.cdr.markForCheck();

    const reqIds = this.aiSelectedRequirementIds();
    const specIds = this.aiSelectedSpecificationIds();

    let attachments: AiAttachmentPayload[] = [];
    if (this.aiAttachedFiles().length) {
      attachments = await filesToAiAttachments(this.aiAttachedFiles());
    }

    this.service.generateDraft({
      projectId: projId || undefined,
      manualTitle: currentTitle || undefined,
      manualType: this.aiManualType(),
      requirementIds: reqIds.length > 0 ? reqIds : undefined,
      specificationIds: specIds.length > 0 ? specIds : undefined,
      prompt: this.aiPrompt() || undefined,
      model: this.aiModel() || undefined,
      attachments,
    }).pipe(
      finalize(() => {
        this.isGeneratingAi.set(false);
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (draft) => {
        if (!draft || !draft.sections || draft.sections.length === 0) {
          this.dialog.warn(this.translate.instant('PMDT15_NO_DATA_TITLE'), this.translate.instant('PMDT15_AI_GEN_FAILED_MSG'));
          return;
        }

        const historyItem = this.aiHistoryService.addHistory(
          'user_manual',
          targetId,
          draft,
          this.aiPrompt(),
          this.aiModel()
        );

        this.aiCurrentDraft.set(draft);
        this.aiCurrentVersionNo.set(historyItem.versionNo);
        this.loadAiHistory();

        // ดึงข้อมูลหัวข้อคู่มือและเนื้อหาแต่ละ Section (Tiptap) ลงในฟอร์มทันที
        this.pasteDraftToForm(draft, 'replace');

        this.dialog.success(this.translate.instant('PMDT15_GEN_SUCCESS_TITLE'), this.translate.instant('PMDT15_AI_DRAFT_SUCCESS_MSG', { v: historyItem.versionNo }));
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('AI manual generation error:', err);
        this.dialog.error(this.translate.instant('PMDT15_ERROR_OCCURRED_TITLE'), err?.error?.message || err?.message || this.translate.instant('PMDT15_AI_GEN_ERROR_MSG'));
      },
    });
  }

  pasteDraftToForm(draft: any, mode: 'replace' | 'append' = 'replace'): void {
    if (this.isLocked()) {
      this.dialog.warn(this.translate.instant('PMDT15_CANNOT_PROCEED_TITLE'), this.translate.instant('PMDT15_DOC_LOCKED_MSG'));
      return;
    }
    if (!draft || !draft.sections || draft.sections.length === 0) {
      this.dialog.warn(this.translate.instant('PMDT15_NO_DATA_TITLE'), this.translate.instant('PMDT15_NO_SECTION_DATA_MSG'));
      return;
    }

    // Smart Preserve: ในโหมด replace กรอกเฉพาะช่องที่ผู้ใช้ยังไม่ได้กรอก ห้ามเขียนทับสิ่งที่ผู้ใช้พิมพ์ไว้แล้ว
    // ในโหมด append จะไม่แตะหัวข้อคู่มือ/ประเภทเลย (เพิ่มเฉพาะ Section ใหม่ต่อท้าย)
    if (mode === 'replace') {
      smartPatchFormAiDraft(
        this.formData.form,
        {
          manualTitle: draft.manualTitle,
          manualType: draft.manualType,
        },
        ['id'],
      );
    }

    const newSectionsList: PmUserManualSectionModel[] = draft.sections.map((s: any, idx: number) => ({
      sectionCode: s.sectionCode || `SEC-${idx + 1}`,
      sectionTitle: s.sectionTitle || this.translate.instant('PMDT15_DEFAULT_SECTION_TITLE', { n: idx + 1 }),
      content: s.content || '',
      sortOrder: s.sortOrder || (idx + 1),
      state: SicEntityState.Added,
    }));

    if (mode === 'replace') {
      const existing = this.sections().filter((s) => !!s.id).map((s) => ({
        ...s,
        state: SicEntityState.Deleted,
      }));
      this.sections.set([...existing, ...newSectionsList]);
      const firstVisibleIdx = this.sections().findIndex((s) => s.state !== SicEntityState.Deleted);
      this.activeSectionIndex.set(firstVisibleIdx >= 0 ? firstVisibleIdx : 0);
    } else {
      const current = [...this.sections()];
      const startOrder = current.length;
      newSectionsList.forEach((s, i) => {
        s.sortOrder = startOrder + i + 1;
        current.push(s);
      });
      this.sections.set(current);
      this.activeSectionIndex.set(current.length - 1);
    }

    this.formData.markAsDirty();
    this.showAiModal.set(false);
    this.dialog.success(this.translate.instant('PMDT15_APPLY_SUCCESS_TITLE'), this.translate.instant('PMDT15_APPLY_SUCCESS_MSG'));
    this.cdr.markForCheck();
  }

  copyDraft(draft: any, historyId?: string): void {
    if (!draft) return;
    const text = typeof draft === 'string' ? draft : JSON.stringify(draft, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId.set(historyId || 'current');
      setTimeout(() => this.copiedId.set(null), 2000);
      this.cdr.markForCheck();
    });
  }

  loadApprovalFlows(): void {
    this.isLoadingFlows.set(true);
    this.approvalService.getFlowsByDocumentType('USER_MANUAL').subscribe({
      next: (flows) => {
        this.flows.set(flows || []);
        this.isLoadingFlows.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingFlows.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  loadDeliveryOptions(projectId?: string): void {
    this.service.getDeliveryCombobox(projectId).subscribe({
      next: (res) => {
        this.deliveryOptions.set(res || []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.deliveryOptions.set([]);
        this.cdr.markForCheck();
      },
    });
  }

  loadData(id: string): void {
    this.service.getById(id).subscribe({
      next: (data) => this.applyManualData(data),
      error: (err) => {
        this.dialog.error(this.translate.instant('PMDT15_ERROR_WORD'), err.message || this.translate.instant('PMDT15_LOAD_DATA_FAILED_MSG'));
        this.cdr.markForCheck();
      },
    });
  }

  private applyManualData(data: PmUserManualModel): void {
    this.formData.form.patchValue(data);
    if (data.projectId) {
      this.loadDeliveryOptions(data.projectId);
    }
    this.isProjectDerived.set(!!(data as any).relatedSpecId || !!data.deliveryId);
    if (data.sections && data.sections.length > 0) {
      this.sections.set(data.sections);
    } else {
      this.initDefaultSections();
    }
    if (data.isLocked) {
      this.isLocked.set(true);
      this.formData.form.disable();
    } else {
      this.isLocked.set(false);
      const isViewRoute = this.router.url.includes('/view');
      if (isViewRoute) {
        this.formData.form.disable();
      } else {
        this.formData.form.enable();
      }
    }
    this.formData.resetModel(this.formData.form.getRawValue() as any);
    this.cdr.markForCheck();
  }

  initDefaultSections(): void {
    const defaults: PmUserManualSectionModel[] = [
      { sectionCode: 'SEC-1', sectionTitle: `1. ${this.translate.instant('PMDT15A_DEFAULT_SECTION_1_TITLE')}`, content: this.translate.instant('PMDT15A_DEFAULT_SECTION_1_CONTENT'), sortOrder: 1 },
      { sectionCode: 'SEC-2', sectionTitle: `2. ${this.translate.instant('PMDT15A_DEFAULT_SECTION_2_TITLE')}`, content: this.translate.instant('PMDT15A_DEFAULT_SECTION_2_CONTENT'), sortOrder: 2 },
      { sectionCode: 'SEC-3', sectionTitle: `3. ${this.translate.instant('PMDT15A_DEFAULT_SECTION_3_TITLE')}`, content: this.translate.instant('PMDT15A_DEFAULT_SECTION_3_CONTENT'), sortOrder: 3 },
      { sectionCode: 'SEC-4', sectionTitle: `4. ${this.translate.instant('PMDT15A_DEFAULT_SECTION_4_TITLE')}`, content: this.translate.instant('PMDT15A_DEFAULT_SECTION_4_CONTENT'), sortOrder: 4 },
    ];
    this.sections.set(defaults);
    this.cdr.markForCheck();
  }

  addSection(): void {
    if (this.isLocked()) return;
    const current = [...this.sections()];
    const newSec: PmUserManualSectionModel = {
      sectionCode: `SEC-${current.length + 1}`,
      sectionTitle: `${current.length + 1}. ${this.translate.instant('PMDT15A_NEW_SECTION_TITLE')}`,
      content: '',
      sortOrder: current.length + 1,
      state: SicEntityState.Added,
    };
    current.push(newSec);
    this.sections.set(current);
    this.activeSectionIndex.set(current.length - 1);
    this.formData.markAsDirty();
    this.cdr.markForCheck();
  }

  removeSection(index: number): void {
    if (this.isLocked()) return;
    const current = [...this.sections()];
    const item = current[index];
    if (item.id) {
      item.state = SicEntityState.Deleted;
    } else {
      current.splice(index, 1);
    }
    this.sections.set(current);
    if (this.activeSectionIndex() >= current.length) {
      this.activeSectionIndex.set(Math.max(0, current.length - 1));
    }
    this.formData.markAsDirty();
    this.cdr.markForCheck();
  }

  selectSection(index: number): void {
    this.activeSectionIndex.set(index);
    this.cdr.markForCheck();
  }

  updateActiveSectionContent(content: string): void {
    if (this.isLocked()) return;
    const current = [...this.sections()];
    const idx = this.activeSectionIndex();
    if (current[idx]) {
      current[idx].content = content;
      if (current[idx].id) {
        current[idx].state = SicEntityState.Modified;
      }
      this.sections.set(current);
      this.formData.markAsDirty();
      this.cdr.markForCheck();
    }
  }

  updateActiveSectionTitle(title: string): void {
    if (this.isLocked()) return;
    const current = [...this.sections()];
    const idx = this.activeSectionIndex();
    if (current[idx]) {
      current[idx].sectionTitle = title;
      if (current[idx].id) {
        current[idx].state = SicEntityState.Modified;
      }
      this.sections.set(current);
      this.formData.markAsDirty();
      this.cdr.markForCheck();
    }
  }

  onSubmit(): void {
    if (this.isLocked()) return;
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn(this.translate.instant('PMDT15A_WARNING_TITLE'), this.translate.instant('PMDT15A_REQUIRED_FIELDS_MSG'));
      return;
    }

    const rawVal = this.formData.form.getRawValue();
    const targetId = this.id() || rawVal.id;
    const isEditMode = !!targetId || this.isEdit();
    const sectionsPayload = this.sections().map((s) => ({
      ...s,
      state: s.state !== undefined ? s.state : (s.id ? SicEntityState.Modified : SicEntityState.Added),
    }));
    const payload = {
      ...rawVal,
      id: targetId || undefined,
      state: isEditMode ? SicEntityState.Modified : SicEntityState.Added,
      sections: sectionsPayload,
    };

    this.isSaving.set(true);
    this.service.save(payload).subscribe({
      next: (res: any) => {
        const savedId = res?.id || (typeof res === 'string' ? res : null) || this.id();
        const formVal = this.formData.form.getRawValue() as any;

        if (this.selectedFlowId() && savedId) {
          this.approvalService.submitForApproval({
            documentType: 'USER_MANUAL',
            documentId: savedId,
            documentCode: formVal.manualCode || payload.manualCode,
            documentTitle: formVal.manualTitle ? (this.translate.instant('PMDT15A_MANUAL_DOC_TYPE') + ' ' + formVal.manualTitle) : this.translate.instant('PMDT15A_MANUAL_DOC_TYPE'),
            version: res?.version || formVal.version,
            flowId: this.selectedFlowId()!,
            comment: this.translate.instant('PMDT15A_SUBMIT_APPROVAL_COMMENT')
          }).subscribe({
            next: () => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success(this.translate.instant('PMDT15A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT15A_SAVE_SUCCESS_MSG'));
              const queryProj = this.route.snapshot.queryParams['projectId'] || (this.formData.form.value as any)?.projectId;
              this.router.navigate(['/feature/pm/manual'], {
                queryParams: queryProj ? { projectId: queryProj } : undefined,
              });
            },
            error: (err) => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success(this.translate.instant('PMDT15A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT15A_SAVE_SUCCESS_MSG'));
              const queryProj = this.route.snapshot.queryParams['projectId'] || (this.formData.form.value as any)?.projectId;
              this.router.navigate(['/feature/pm/manual'], {
                queryParams: queryProj ? { projectId: queryProj } : undefined,
              });
            }
          });
        } else {
          this.isSaved = true;
          this.dialog.success(this.translate.instant('PMDT15A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT15A_SAVE_SUCCESS_MSG'));
          this.formData.markAsPristine();
          const queryProj = this.route.snapshot.queryParams['projectId'] || (this.formData.form.value as any)?.projectId;
          this.router.navigate(['/feature/pm/manual'], {
            queryParams: queryProj ? { projectId: queryProj } : undefined,
          });
          this.isSaving.set(false);
        }
      },
      error: (err) => {
        this.dialog.error(this.translate.instant('PMDT15A_ERROR_TITLE'), err.message || this.translate.instant('PMDT15A_SAVE_FAILED_MSG'));
        this.isSaving.set(false);
      },
    });
  }

  printPdf(): void {
    const manualId = this.id();
    if (!manualId) {
      this.dialog.warn(this.translate.instant('PMDT15A_MANUAL_ID_NOT_FOUND_TITLE'), this.translate.instant('PMDT15A_SAVE_BEFORE_PRINT_MSG'));
      return;
    }

    this.isPrinting.set(true);
    const url = `${apiBaseUrl}/api/pm/manual/${manualId}/export-pdf`;
    this.http.get(url, { responseType: 'blob' })
      .pipe(finalize(() => this.isPrinting.set(false)))
      .subscribe({
        next: (blob) => {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (!printWindow) {
            const a = document.createElement('a');
            a.href = pdfUrl;
            a.download = `user-manual-${this.formData?.form?.controls['manualCode']?.value || manualId}.pdf`;
            a.target = '_blank';
            a.click();
          }
        },
        error: (err) => {
          console.error('Print user manual error:', err);
          this.dialog.error(this.translate.instant('PMDT15A_PRINT_ERROR_TITLE'), this.translate.instant('PMDT15A_PRINT_ERROR_MSG') + ': ' + (err?.error?.message || err?.message || ''));
        },
      });
  }

  onBack(): void {
    const queryProj = this.route.snapshot.queryParams['projectId'] || (this.formData.form.value as any)?.projectId;
    this.router.navigate(['/feature/pm/manual'], {
      queryParams: queryProj ? { projectId: queryProj } : undefined,
    });
  }

  requestChange(): void {
    const rawVal = this.formData.form.getRawValue() as any;
    this.router.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId: rawVal.projectId,
        targetType: 'USER_MANUAL',
        targetId: this.id(),
        targetTitle: rawVal.manualTitle,
      },
    });
  }
}

export default Pmdt15AComponent;