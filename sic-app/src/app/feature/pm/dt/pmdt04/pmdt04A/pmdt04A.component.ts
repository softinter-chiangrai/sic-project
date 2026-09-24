// src/app/feature/pm/dt/pmdt05/pmdt05.component.ts
import { CommonModule } from '@angular/common';
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '../../../../../core/config/ai-models.config';
import {
  Component,
  inject,
  Injectable,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription, interval, takeWhile } from 'rxjs';
import { delay, finalize, tap } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../../core/auth/auth.service';

// Components
import { SicButtonComponent } from 'sic-ng';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputAreaComponent } from 'sic-ng';
import { SicInputComponent } from 'sic-ng';
import { SicCardComponent } from 'sic-ng';
import { SicCheckboxComponent } from 'sic-ng';
import { SicDatePipe } from '../../../../../core/pipes/sic-date.pipe';

// ✅ เปลี่ยนเป็น sic-tiptap-editor
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { SicUploadComponent } from '../../../../../core/component/sic-upload/sic-upload.component';

// Services
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { RequirementExportService } from './requirement-export.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';

// Preview Component
import { SicRequirementPreviewComponent } from './pmdt04-preview/pmdt04-preview.component';

import { Pmdt04APageData, RequirementModel } from './pmdt04A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { SicEntityState } from '../../../../../core/model/sic-entity-state';
import { Pmdt04AForm } from './pmdt04A.form';
import { AiHistoryService } from '../../../../../core/services/ai-history.service';
import { smartPatchFormAiDraft } from '../../../../../core/utils/ai-form-patch.util';
import { AiAttachmentPayload, filesToAiAttachments } from '../../../../../core/utils/ai-attachment.util';
import { tryAiAutoOpen } from '../../../../../core/utils/ai-navigator-deeplink.util';
import { SicAiAttachmentPickerComponent } from '../../../../../core/component/sic-ai-attachment-picker/sic-ai-attachment-picker.component';

// ===== Service =====
@Injectable({ providedIn: 'root' })
export class Pmdt04AService {
  private http = inject(HttpClient);

  apiGetComboboxCustomer = `${environment.apiBaseUrl}/api/pm/customers/combobox`;
  apiGetComboboxProject = `${environment.apiBaseUrl}/api/pm/customer-projects/combobox`;
  apiGetLovRequirementType = `${environment.apiBaseUrl}/api/pm/requirement/lov-type`;
  apiGetLovPriority = `${environment.apiBaseUrl}/api/pm/requirement/lov-priority`;
  apiGetLovStatus = `${environment.apiBaseUrl}/api/pm/requirement/lov-status`;
  apiGetApprovals = `${environment.apiBaseUrl}/api/pm/approvals/flows/document-type/REQUIREMENT`;

  save(req: RequirementModel): Observable<any> {
    console.log('📝 Saving requirement:', req);
    const data = { ...req };
    delete data.projectName;
    return this.http.post(`${environment.apiBaseUrl}/api/pm/requirement/save`, data);
  }

  getRequirement(id: string): Observable<RequirementModel> {
    return this.http.get<RequirementModel>(`${environment.apiBaseUrl}/api/pm/requirement/${id}`);
  }

  autoSave(req: RequirementModel): Observable<any> {
    console.log('💾 Auto-saving requirement:', req);
    const data = { ...req };
    delete data.projectName;
    return this.http.post(`${environment.apiBaseUrl}/api/pm/requirement/save`, data);
  }

  generateAiDraft(payload: {
    projectId?: string;
    title?: string;
    prompt?: string;
    requirementType?: string;
    model?: string;
    attachments?: AiAttachmentPayload[];
  }): Observable<{
    title?: string;
    description?: string;
    acceptanceCriteria?: string;
    businessValue?: string;
    requirementType?: string;
    priority?: string;
  }> {
    return this.http.post<any>(`${environment.apiBaseUrl}/api/pm/requirement/ai/generate`, payload);
  }
}

// ===== Component =====
@Component({
  selector: 'app-pmdt04a',
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
    SicInputAreaComponent,
    SicRequirementPreviewComponent,
    SicCardComponent,
    SicCheckboxComponent,
    SicTiptapEditorComponent,
    SicUploadComponent,
    SicDatePipe,
    TranslateModule,
    SicAiAttachmentPickerComponent,
  ],
  templateUrl: './pmdt04A.component.html',
  styleUrls: ['./pmdt04A.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt04AComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  // ===== Dependencies =====
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly service = inject(Pmdt04AService);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private readonly approvalService = inject(ApprovalService);
  private readonly exportService = inject(RequirementExportService);
  private readonly navigation = inject(NavigationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly customerState = inject(CustomerStateService);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);
  readonly aiHistoryService = inject(AiHistoryService);

  // ===== Form =====
  formData!: SicFromData<RequirementModel>;

  get form(): FormGroup {
    return this.formData?.formGroup;
  }

  isEdit = false;
  isViewOnly = false;
  isLocked = false;
  reqId: string | null = null;
  isLoading = false;
  isSaving = false;
  isAutoSaving = false;
  lastAutoSaveTime: Date | null = null;

  // ===== Approval Flow =====
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;
  isLoadingFlows = false;

  // ===== View Mode =====
  viewMode: 'edit' | 'split' | 'preview' = 'split';

  // ===== Auto-save =====
  private autoSaveSubscription: Subscription | null = null;
  private formChangeSubscription: Subscription | null = null;
  private autoSaveEnabled = true;
  private autoSaveInterval = 30000; // 30 seconds

  // ===== Source Options =====
  sourceOptions = [
    this.translate.instant('PMDT04_SOURCE_CUSTOMER'),
    'BA',
    this.translate.instant('PMDT04_SOURCE_DOCUMENT'),
    this.translate.instant('PMDT04_SOURCE_MEETING'),
  ];

  // ===== AI Assistant =====
  showAiAssistModal = false;
  isGeneratingAiAssist = false;
  aiAssistTab: 'generate' | 'history' = 'generate';
  aiAssistPrompt = '';
  aiAssistTitle = '';
  aiAssistType = 'FUNCTIONAL';
  aiAssistModel = DEFAULT_AI_MODEL;
  aiModels = AI_MODEL_OPTIONS;
  aiHistories: any[] = [];
  aiCurrentDraft: any = null;
  aiCurrentVersionNo: number | null = null;
  previewHistoryId: string | null = null;
  copiedId: string | null = null;
  aiAttachedFiles = signal<File[]>([]);
  projectParams: Record<string, any> = {};

  loadCustomerFromProject(projectId: string): void {
    if (!projectId) return;
    this.http.get<any>(`${environment.apiBaseUrl}/api/pm/customer-projects/${projectId}`).subscribe({
      next: (project) => {
        if (project?.customerId) {
          this.formData.patchValue({ customerId: project.customerId } as any);
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
            this.form.patchValue({ projectId: null, projectName: null });
            this.cdr.markForCheck();
          }
        },
        error: () => {
          this.form.patchValue({ projectId: null, projectName: null });
          this.cdr.markForCheck();
        }
      });
    }
    this.cdr.markForCheck();
  }

  // ===== CanDeactivate =====
  isSaved = false;
  pageDirty = () => this.isViewOnly ? false : (this.isSaved ? false : (this.formData?.isChanged ?? false));

  // ===== AI Assistant Modal Handlers =====
  openAiAssist(): void {
    const formVal = this.form.value;
    this.aiAssistTitle = formVal.title || '';
    this.aiAssistType = formVal.requirementType || 'FUNCTIONAL';
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
    const targetId = this.reqId || this.form?.value?.id || 'new';
    this.aiHistories = this.aiHistoryService.getHistories('requirement', targetId);
  }


  async generateWithAi(): Promise<void> {
    const formVal = this.form.value;
    const projectId = formVal.projectId;
    const targetId = this.reqId || formVal.id || 'new';

    this.isGeneratingAiAssist = true;
    this.cdr.markForCheck();

    let attachments: AiAttachmentPayload[] = [];
    if (this.aiAttachedFiles().length) {
      attachments = await filesToAiAttachments(this.aiAttachedFiles());
    }

    this.service.generateAiDraft({
      projectId: projectId || undefined,
      title: this.aiAssistTitle || formVal.title || undefined,
      requirementType: this.aiAssistType || formVal.requirementType || undefined,
      prompt: this.aiAssistPrompt || undefined,
      model: this.aiAssistModel || undefined,
      attachments,
    }).pipe(finalize(() => {
      this.isGeneratingAiAssist = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (draft) => {
        if (!draft) {
          this.dialog.warn(this.translate.instant('PMDT04_NO_DATA_TITLE'), this.translate.instant('PMDT04_AI_GENERATE_FAIL_MSG'));
          return;
        }

        const titleToSave = (draft.title && draft.title.trim() !== '')
          ? draft.title
          : (this.aiAssistTitle || formVal.title);

        const fullDraft = {
          ...draft,
          title: titleToSave,
          requirementType: draft.requirementType || this.aiAssistType || 'FUNCTIONAL',
          priority: draft.priority || 'MEDIUM',
        };

        const historyItem = this.aiHistoryService.addHistory(
          'requirement',
          targetId,
          fullDraft,
          this.aiAssistPrompt,
          this.aiAssistModel,
          titleToSave
        );

        this.loadAiHistory();
        this.aiCurrentDraft = fullDraft;
        this.aiCurrentVersionNo = historyItem.versionNo;

        // ดึงข้อมูลหัวข้อและเนื้อหาที่ AI สร้างลงในฟอร์มทันที
        this.applyDraftToForm(fullDraft);

        this.cdr.markForCheck();
      },
      error: (err) => {
        this.dialog.error(this.translate.instant('PMDT04_AI_CONTENT_FAIL_TITLE'), err.error?.message || this.translate.instant('PMDT04_AI_CONTACT_ERROR_MSG'));
      }
    });
  }

  pasteRequirementDraft(draft: any): void {
    if (!draft) return;

    this.applyDraftToForm(draft);
    this.closeAiAssist();
    this.dialog.success(this.translate.instant('PMDT04_PASTE_SUCCESS_TITLE'), this.translate.instant('PMDT04_PASTE_SUCCESS_MSG'));
  }

  private applyDraftToForm(draft: any): void {
    if (!draft) return;
    // Smart Preserve: กรอกเฉพาะช่องที่ผู้ใช้ยังไม่ได้กรอก ห้ามเขียนทับสิ่งที่ผู้ใช้พิมพ์ไว้แล้ว
    smartPatchFormAiDraft(
      this.form,
      {
        title: draft.title,
        description: draft.description,
        acceptanceCriteria: draft.acceptanceCriteria,
        businessValue: draft.businessValue,
        // requirementType is a required field with no form-level default (starts null) —
        // fall back to FUNCTIONAL when the AI draft omits it, same as the pre-refactor behavior,
        // so a fresh "Generate with AI" doesn't leave a required field empty and block Save.
        priority: draft.priority || 'MEDIUM',
        requirementType: draft.requirementType || 'FUNCTIONAL',
      },
      ['id'],
      {
        requirementType: this.service.apiGetLovRequirementType,
        priority: this.service.apiGetLovPriority,
      },
      this.http,
    );
  }

  deleteAiHistory(id: string, event: Event): void {
    event.stopPropagation();
    const targetId = this.reqId || this.form?.value?.id || 'new';
    this.aiHistoryService.deleteHistory('requirement', targetId, id);
    this.loadAiHistory();
    this.cdr.markForCheck();
  }

  togglePreview(id: string): void {
    this.previewHistoryId = this.previewHistoryId === id ? null : id;
  }

  copyDraft(draft: any, id?: string): void {
    if (!draft) return;
    const text = `Requirement: ${draft.title || ''}\nType: ${draft.requirementType || ''}\nPriority: ${draft.priority || ''}\n\nDescription:\n${draft.description || ''}\n\nAcceptance Criteria:\n${draft.acceptanceCriteria || ''}\n\nBusiness Value:\n${draft.businessValue || ''}`;
    navigator.clipboard?.writeText(text).then(() => {
      this.copiedId = id || 'current';
      setTimeout(() => { this.copiedId = null; this.cdr.markForCheck(); }, 2000);
      this.cdr.markForCheck();
    });
  }

  // ===== Lifecycle =====
  ngOnInit(): void {
    const pageData: Pmdt04APageData | undefined = this.route.snapshot.data['form'];
    this.formData = pageData?.requirementData ?? new SicFromData<RequirementModel>(Pmdt04AForm.createForm(this.fb));
    this.loadFlows();

    // Check if current route is view mode
    const isViewRoute = this.router.url.includes('/view');
    if (isViewRoute) {
      this.isViewOnly = true;
    }

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = !this.isViewOnly;
        this.reqId = id;
        if (pageData?.requirementDetail) {
          this.applyLoadedRequirement(pageData.requirementDetail);
        } else {
          this.loadRequirement(id);
        }
      } else {
        // New requirement - set default project from query params or customer state
        this.route.queryParams.subscribe((qParams) => {
          const pId = qParams['projectId'] || this.customerState.getProjectId();
          
          if (pId) {
            const pName = (this.customerState.getProjectId() && String(this.customerState.getProjectId()) === String(pId)) 
              ? this.customerState.getProjectName() 
              : null;
            // ✅ ใช้ formData.patchValue() — patch + re-snapshot อัตโนมัติ ไม่ทำให้ isChanged = true
            this.formData.patchValue({ projectId: pId, ...(pName ? { projectName: pName } : {}) } as any);
            if (!pName) {
              this.fetchProjectName(pId);
            }
          }

          // Global AI Navigator ส่งผู้ใช้มาที่นี่พร้อมสั่งให้เปิด AI Draft Modal และกรอกข้อมูลทันที
          tryAiAutoOpen({
            params: qParams,
            router: this.router,
            route: this.route,
            moduleType: 'REQUIREMENT',
            canOpen: () => !this.isViewOnly,
            setPrompt: (p) => (this.aiAssistPrompt = p),
            open: () => this.openAiAssist(),
            generate: () => this.generateWithAi(),
          });
        });

        // Set default createdBy for new requirement
        const userName = this.getUserNameFromToken();
        if (userName) {
          // ✅ ใช้ formData.patchValue() แทน form.patchValue()
          this.formData.patchValue({ createdBy: userName } as any);
        }
      }
    });

    // Setup auto-save
    this.setupAutoSave();

    // Watch for form changes to mark dirty
    this.formChangeSubscription = this.form.valueChanges.subscribe(() => {
      // Trigger dirty state
    });
  }

  ngOnDestroy(): void {
    this.autoSaveSubscription?.unsubscribe();
    this.formChangeSubscription?.unsubscribe();
  }

  // ===== Data Loading =====
  // Kept as a fallback for the rare case the resolver couldn't attach requirementDetail
  // (resolver failures already redirect to /not-found before the component loads).
  loadRequirement(id: string) {
    this.isLoading = true;
    this.service.getRequirement(id).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.applyLoadedRequirement(data);
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('❌ โหลดข้อมูลไม่สำเร็จ:', error);
        this.dialog.error(this.translate.instant('PMDT04_LOAD_FAIL_TITLE'), this.translate.instant('PMDT04_REQ_NOT_FOUND_MSG'));
        this.navigation.navigate(['/feature/pm/requirement']);
      },
    });
  }

  // Shared post-processing for a loaded RequirementModel, whether it came from the
  // route resolver (normal case) or the loadRequirement() fallback fetch above.
  private applyLoadedRequirement(data: RequirementModel): void {
    this.formData.formGroup.patchValue(data);

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

    // If loaded data doesn't have projectName but has projectId, try to fetch it
    if (data.projectId) {
      this.loadCustomerFromProject(data.projectId);
      const cachedName = (this.customerState.getProjectId() && String(this.customerState.getProjectId()) === String(data.projectId))
        ? this.customerState.getProjectName()
        : null;
      if (cachedName) {
        // ✅ ใช้ formData.patchValue() — ไม่ทำให้ isChanged = true
        this.formData.patchValue({ projectName: cachedName } as any);
      } else {
        this.fetchProjectName(data.projectId);
      }
    } else {
      // ✅ re-snapshot หลังโหลดข้อมูลเสร็จ
      this.formData.resetModel(this.form.getRawValue());
    }

    // If loaded data doesn't have createdBy, set it from token
    if (!data.createdBy) {
      const userName = this.getUserNameFromToken();
      if (userName) {
        // ✅ ใช้ formData.patchValue()
        this.formData.patchValue({ createdBy: userName } as any);
      }
    }

    console.log('✅ โหลดข้อมูล Requirement สำเร็จ:', data);
    this.cdr.detectChanges();
  }

  // ผู้ใช้เลือกโครงการเองจาก Combobox (ไม่ต้องเคยเข้าหน้าโครงการมาก่อน)
  onProjectSelected(item: any): void {
    const selectedProjectId = item?.value ?? item?.id ?? '';
    const projectName = item ? (item.text ?? item.label ?? '') : '';
    this.formData.patchValue({ projectName } as any);
    if (selectedProjectId) {
      this.loadCustomerFromProject(selectedProjectId);
      this.fetchProjectName(selectedProjectId);
    }
    this.cdr.markForCheck();
  }

  private fetchProjectName(projectId: string): void {
    console.log('🔍 [fetchProjectName] Fetching projects list from:', this.service.apiGetComboboxProject);
    this.http.get<any>(this.service.apiGetComboboxProject).subscribe({
      next: (res) => {
        console.log('🔍 [fetchProjectName] API Response:', res);
        const list = Array.isArray(res) ? res : (res.data || []);
        const project = list.find((p: any) => String(p.value || p.id || '') === String(projectId));
        if (project) {
          const name = project.projectName || project.name || project.text || project.projectNameTh || project.projectNameEn;
          console.log('🔍 [fetchProjectName] Matched project:', project, 'Resolved Name:', name);
          if (name) {
            // ✅ ใช้ formData.patchValue() — patch + re-snapshot อัตโนมัติ
            this.formData.patchValue({ projectName: name } as any);
            this.cdr.markForCheck();
          }
        } else {
          console.warn('🔍 [fetchProjectName] No project matched ID:', projectId, 'in list:', list);
        }
      },
      error: (err) => console.warn('❌ [fetchProjectName] Could not fetch project name:', err),
    });
  }

  private getUserNameFromToken(): string | null {
    const token = this.auth.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.name || payload.preferred_username || payload.displayName || payload.sub || null;
    } catch {
      return null;
    }
  }

  loadFlows() {
    this.isLoadingFlows = true;
    this.approvalService.getFlowsByDocumentType('REQUIREMENT').subscribe({
      next: (flows) => {
        this.flows = flows;
        this.isLoadingFlows = false;
      },
      error: () => {
        this.isLoadingFlows = false;
        console.warn(this.translate.instant('PMDT04_LOAD_APPROVAL_FLOW_FAIL'));
      },
    });
  }

  // ❌ ไม่ต้องมี onDescriptionChange และ onAcceptanceCriteriaChange

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

  private performAutoSave(): void {
    if (this.isSaving || this.isAutoSaving) return;

    const data = this.form.value as RequirementModel;
    if (!data.title && !data.description) return; // Skip empty

    this.isAutoSaving = true;
    this.lastAutoSaveTime = new Date();

    this.service.autoSave(data).subscribe({
      next: (response: any) => {
        this.isAutoSaving = false;

        // Patch the entire returned response to update uploadGroupId and other fields
        if (response) {
          // ✅ ใช้ formData.patchValue() — auto-save ไม่ควรทำให้ isChanged = true
          this.formData.patchValue(response);
          const savedId = response.id;
          if (savedId) {
            this.reqId = savedId;
            this.isEdit = true;
          }
        } else {
          // ✅ re-snapshot หลัง auto-save สำเร็จ
          this.formData.resetModel();
        }

        this.cdr.markForCheck();
      },
      error: () => {
        this.isAutoSaving = false;
        this.cdr.markForCheck();
      },
    });
  }

  manualAutoSave(): void {
    this.performAutoSave();
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
      case 'saving':
        return this.translate.instant('PMDT04_AUTOSAVE_SAVING');
      case 'saved':
        return this.translate.instant('PMDT04_AUTOSAVE_SAVED') + ' ' + this.formatTimeDiff(this.lastAutoSaveTime);
      case 'dirty':
        return this.translate.instant('PMDT04_AUTOSAVE_DIRTY');
      default:
        return this.translate.instant('PMDT04_AUTOSAVE_IDLE');
    }
  }

  private formatTimeDiff(date: Date | null): string {
    if (!date) return '';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return this.translate.instant('PMDT04_SECONDS_AGO', { count: diff });
    return this.translate.instant('PMDT04_MINUTES_AGO', { count: Math.floor(diff / 60) });
  }

  // ===== View Mode =====
  setViewMode(mode: 'edit' | 'split' | 'preview'): void {
    this.viewMode = mode;
    this.cdr.markForCheck();
  }

  // ===== Preview Data =====
  getPreviewData(): any {
    const value = this.form.value;
    return {
      requirementCode: value.requirementCode || '...',
      title: value.title || '...',
      description: value.description || `<em>${this.translate.instant('PMDT04_PLEASE_ENTER_DESCRIPTION')}</em>`,
      acceptanceCriteria: value.acceptanceCriteria || '',
      priority: value.priority || 'Must',
      requirementType: value.requirementType || '',
      source: value.source || '',
      businessValue: value.businessValue || '',
      createdBy: value.createdBy || this.translate.instant('PMDT04_DEFAULT_USER_LABEL'),
      version: value.version || 'v1.0',
      status: value.status || 'Draft',
      projectName: value.projectName || this.translate.instant('PMDT04_LOADING_ELLIPSIS'),
      createdAt: new Date().toISOString(),
    };
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Draft: this.translate.instant('PMDT04_STATUS_DRAFT'),
      'In Review': this.translate.instant('PMDT04_STATUS_IN_REVIEW'),
      Approved: this.translate.instant('PMDT04_STATUS_APPROVED'),
      Changed: this.translate.instant('PMDT04_STATUS_CHANGED'),
      Cancelled: this.translate.instant('PMDT04_STATUS_CANCELLED'),
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Draft: 'draft',
      'In Review': 'in-review',
      Approved: 'approved',
      Changed: 'changed',
      Cancelled: 'cancelled',
    };
    return map[status] || 'draft';
  }

  // ===== Export (JasperReports PDF) =====
  async exportRequirement(): Promise<void> {
    const id = this.reqId || this.form.get('id')?.value;
    if (!id) {
      this.dialog.warn(this.translate.instant('PMDT04_NOT_SAVED_TITLE'), this.translate.instant('PMDT04_SAVE_BEFORE_EXPORT_MSG'));
      return;
    }

    this.isSaving = true;

    try {
      if (this.form.dirty) {
        await new Promise<void>((resolve, reject) => {
          const rawFormVal = this.form.getRawValue();
          const targetId = this.reqId || rawFormVal.id || id;
          const isEditMode = !!targetId || this.isEdit;
          const exportSaveData = {
            ...rawFormVal,
            id: targetId || undefined,
            state: isEditMode ? SicEntityState.Modified : SicEntityState.Added,
          };
          this.service.save(exportSaveData).subscribe({
            next: () => {
              this.form.markAsPristine();
              resolve();
            },
            error: (err) => reject(err),
          });
        });
      }

      const blob = await this.exportService.exportWithJasper(id, 'pdf');
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, '_blank');
      if (!printWindow) {
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.target = '_blank';
        a.click();
      }
    } catch (error: any) {
      console.error('Export error:', error);
      this.dialog.error(this.translate.instant('PMDT04_EXPORT_FAIL_TITLE'), this.translate.instant('PMDT04_JASPER_FAIL_MSG'));
    } finally {
      this.isSaving = false;
      this.cdr.markForCheck();
    }
  }

  // ===== Submit =====
  submitForApproval() {
    if (!this.selectedFlowId) {
      this.dialog.warn(this.translate.instant('PMDT04_SELECT_APPROVAL_FLOW_TITLE'), this.translate.instant('PMDT04_SELECT_FLOW_BEFORE_SUBMIT_MSG'));
      return;
    }

    const data = this.form.value as RequirementModel;
    if (!data.id) {
      this.dialog.warn(this.translate.instant('PMDT04_NOT_SAVED_TITLE'), this.translate.instant('PMDT04_SAVE_BEFORE_SUBMIT_MSG'));
      return;
    }

    this.approvalService
      .submitForApproval({
        documentType: 'REQUIREMENT',
        documentId: data.id,
        documentCode: data.requirementCode,
        documentTitle: data.title,
        version: data.version,
        flowId: this.selectedFlowId,
        comment: this.translate.instant('PMDT04_SUBMIT_APPROVAL_COMMENT'),
      })
      .subscribe({
        next: () => {
          this.dialog.success(this.translate.instant('PMDT04_SUBMIT_SUCCESS_TITLE'), this.translate.instant('PMDT04_SUBMIT_SUCCESS_MSG'));
          this.form.patchValue({ status: 'In Review' });
        },
        error: (err) => {
          this.dialog.error(this.translate.instant('PMDT04_SUBMIT_FAIL_TITLE'), err.error?.message || this.translate.instant('PMDT04_GENERIC_ERROR_MSG'));
        },
      });
  }

  // ===== CRUD Actions =====
  onBack(): void {
    const projectId = this.form.get('projectId')?.value;
    this.navigateBack(projectId);
  }

  requestChange(): void {
    const projectId = this.form.get('projectId')?.value;
    this.navigation.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId,
        targetType: 'REQUIREMENT',
        targetId: this.reqId,
        targetTitle: this.form.get('title')?.value,
      },
    });
  }

  private navigateBack(projectId?: string): void {
    if (projectId) {
      this.navigation.navigate(['/feature/pm/requirement'], {
        queryParams: { projectId },
      });
    } else {
      this.navigation.navigate(['/feature/pm/requirement']);
    }
  }

  submit(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      this.dialog.warn(this.translate.instant('PMDT04_INVALID_FORM_TITLE'), this.translate.instant('PMDT04_FILL_VALID_FIELDS_MSG'));
      return;
    }

    this.isSaving = true;
    const rawVal = this.formData.form.getRawValue();
    const targetId = this.reqId || rawVal.id;
    const isEditMode = !!targetId || this.isEdit;
    const data = {
      ...rawVal,
      id: targetId || undefined,
      state: isEditMode ? SicEntityState.Modified : SicEntityState.Added,
    } as RequirementModel;

    if (!isEditMode) {
      data.rowVersion = 0;
    }

    this.service.save(data).subscribe({
      next: (response: any) => {
        // ✅ re-snapshot ก่อน — เพื่อให้ isChanged = false
        this.formData.markAsPristine();
        // ✅ flag isSaved = true ทันที — guard จะ bypass ไม่ถาม
        this.isSaved = true;
        
        // Resolve the saved requirement ID and patch the entire response (including uploadGroupId)
        let savedId = data.id || this.reqId;
        if (response && response.id) {
          savedId = response.id;
          // ✅ ใช้ formData.patchValue() แทน form.patchValue()
          this.formData.patchValue(response);
          this.reqId = savedId;
          this.isEdit = true;
        }

        if (this.selectedFlowId && savedId) {
          // Submit for approval automatically
          this.approvalService
            .submitForApproval({
              documentType: 'REQUIREMENT',
              documentId: savedId,
              documentCode: data.requirementCode,
              documentTitle: data.title,
              version: data.version,
              flowId: this.selectedFlowId,
              comment: this.translate.instant('PMDT04_AUTO_SUBMIT_APPROVAL_COMMENT'),
            })
            .subscribe({
              next: () => {
                this.isSaving = false;
                this.dialog.success(this.translate.instant('PMDT04_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT04_SAVE_SUCCESS_MSG')).then(() => {
                  this.navigateBack(data.projectId);
                });
              },
              error: (err) => {
                this.isSaving = false;
                this.dialog.success(this.translate.instant('PMDT04_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT04_SAVE_SUCCESS_MSG')).then(() => {
                  this.navigateBack(data.projectId);
                });
              },
            });
        } else {
          this.isSaving = false;
          this.dialog.success(this.translate.instant('PMDT04_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT04_SAVE_SUCCESS_MSG')).then(() => {
            this.navigateBack(data.projectId);
          });
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.dialog.error(this.translate.instant('PMDT04_SAVE_FAIL_TITLE'), error.message || this.translate.instant('PMDT04_GENERIC_ERROR_MSG'));
      },
    });
  }

  // ===== Helper =====
  get isMobile(): boolean {
    return window.innerWidth < 768;
  }

  get editPanelClass(): string {
    if (this.viewMode === 'edit') return 'pmdt05-panel pmdt05-panel--edit';
    if (this.viewMode === 'preview') return 'pmdt05-panel pmdt05-panel--preview';
    return 'pmdt05-panel pmdt05-panel--edit';
  }

  get previewPanelClass(): string {
    if (this.viewMode === 'preview') return 'pmdt05-panel pmdt05-panel--preview';
    return 'pmdt05-panel pmdt05-panel--preview';
  }
}

export default Pmdt04AComponent;