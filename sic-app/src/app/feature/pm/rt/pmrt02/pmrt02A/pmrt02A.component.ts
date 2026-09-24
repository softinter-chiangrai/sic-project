import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '../../../../../core/config/ai-models.config';

// src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { SicButtonComponent } from 'sic-ng';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from 'sic-ng';
import { SicInputComponent } from 'sic-ng';
import { SicNumberComponent } from '../../../../../core/component/sic-number/sic-number.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { DialogService } from '../../../../../core/services/dialog.service';
import { ApprovalService } from '../../../dt/pmdt03/approval.service';
import type { ApprovalFlow } from '../../../dt/pmdt03/approval.model';
import { Pmrt02AService } from './pmrt02A.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { AiHistoryService, AiHistoryItem } from '../../../../../core/services/ai-history.service';
import { Pmrt02AModel, Pmrt02APageData, ProjectModel } from './pmrt02A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { smartPatchFormAiDraft } from '../../../../../core/utils/ai-form-patch.util';
import { AiAttachmentPayload, filesToAiAttachments } from '../../../../../core/utils/ai-attachment.util';
import { tryAiAutoOpen } from '../../../../../core/utils/ai-navigator-deeplink.util';
import { SicAiAttachmentPickerComponent } from '../../../../../core/component/sic-ai-attachment-picker/sic-ai-attachment-picker.component';


@Component({
  selector: 'app-pmrt02a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicDatepickerComponent,
    SicNumberComponent,
    SicComboboxComponent,
    SicTiptapEditorComponent,
    SicVersionBadgeComponent,
    TranslateModule,
    SicAiAttachmentPickerComponent,
  ],
  templateUrl: './pmrt02A.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [],
})
export class Pmrt02AComponent implements OnInit, CanComponentDeactivate {
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly dialog = inject(DialogService);
  private readonly fb = inject(FormBuilder);
  private projectService = inject(Pmrt02AService);
  private customerState = inject(CustomerStateService);
  private approvalService = inject(ApprovalService);
  private navigation = inject(NavigationService);
  private cdr = inject(ChangeDetectorRef);
  private aiHistoryService = inject(AiHistoryService);
  private translate = inject(TranslateService);

  formData!: SicFromData<Pmrt02AModel>;
  get form(): FormGroup {
    return this.formData?.formGroup;
  }
  isEdit = false;
  isViewOnly = false;
  isLocked = false;
  projectId: string | null = null;
  isLoading = false;
  isSaving = false;

  customerName = signal<string>('');
  apiGetComboboxCustomer = `${environment.apiBaseUrl}/api/pm/customers/combobox`;

  // ===== AI Assistant =====
  showAiModal = signal(false);
  aiActiveTab = signal<'generate' | 'history'>('generate');
  isGeneratingAi = signal(false);
  aiModel = signal(DEFAULT_AI_MODEL);
  aiPrompt = signal('');
  aiHistories = signal<AiHistoryItem<any>[]>([]);
  aiCurrentDraft = signal<any>(null);
  aiCurrentVersionNo = signal<number | null>(null);
  copiedId = signal<string | null>(null);
  aiAttachedFiles = signal<File[]>([]);

  aiModels = AI_MODEL_OPTIONS;

  // ===== Approval Flow =====
  flows: ApprovalFlow[] = [];
  selectedFlowId: string | null = null;
  isLoadingFlows = false;
  documenttypeapiUrl = environment.apiBaseUrl + '/api/pm/approvals/flows/document-type/PROJECT';

  isSaved = false;
  pageDirty = () => (this.isViewOnly || this.isLocked) ? false : (this.isSaved ? false : (this.formData?.isChanged ?? false));

  statusOptions = [
    { value: 'Prospect', text: 'Prospect' },
    { value: 'Contract Drafting', text: 'Contract Drafting' },
    { value: 'Contract Signed', text: 'Contract Signed' },
    { value: 'Requirement Gathering', text: 'Requirement Gathering' },
    { value: 'Requirement Approval', text: 'Requirement Approval' },
    { value: 'System Analysis', text: 'System Analysis' },
    { value: 'DFD Design', text: 'DFD Design' },
    { value: 'ER Design', text: 'ER Design' },
    { value: 'Specification Design', text: 'Specification Design' },
    { value: 'Specification Approval', text: 'Specification Approval' },
    { value: 'Planning', text: 'Planning' },
    { value: 'Development', text: 'Development' },
    { value: 'Internal Testing', text: 'Internal Testing' },
    { value: 'UAT', text: 'UAT' },
    { value: 'Bug Fixing', text: 'Bug Fixing' },
    { value: 'Ready for Delivery', text: 'Ready for Delivery' },
    { value: 'Delivered', text: 'Delivered' },
    { value: 'Invoicing', text: 'Invoicing' },
    { value: 'Closed', text: 'Closed' },
    { value: 'MA Active', text: 'MA Active' },
  ];
  priorityOptions = [
    { value: 'Low', text: 'Low' },
    { value: 'Medium', text: 'Medium' },
    { value: 'High', text: 'High' },
    { value: 'Critical', text: 'Critical' },
  ];

  ngOnInit(): void {
    const page: Pmrt02APageData = this.route.snapshot.data['form'];
    this.formData = page.projectData;
    this.isEdit = page.isEdit;
    this.projectId = this.route.snapshot.paramMap.get('id');

    const data = this.formData.value;
    if (data.customerName) {
      this.customerName.set(data.customerName);
    }

    if (this.isEdit) {
      if (data.isApproved || data.isLocked || data.approvalStatus === 'APPROVED') {
        this.isLocked = true;
        this.isViewOnly = true;
      } else {
        this.isLocked = false;
        this.isViewOnly = this.router.url.includes('/view');
      }
      if (this.projectId) {
        this.loadApprovalFlowForProject(this.projectId);
      }
    }

    this.route.queryParams.subscribe((params) => {
      const mode = params['mode'];
      if (mode === 'view') {
        this.isViewOnly = true;
      }
      const customerId = params['customerId'];
      const customerName = params['customerName'] || '';
      if (customerId && !this.isEdit) {
        this.formData.formGroup.patchValue({ customerId: customerId });
        if (customerName) {
          this.customerName.set(customerName);
        }
      }

      // Global AI Navigator ส่งผู้ใช้มาที่นี่พร้อมสั่งให้เปิด AI Draft Modal และกรอกข้อมูลทันที
      tryAiAutoOpen({
        params,
        router: this.router,
        route: this.route,
        moduleType: 'PROJECT',
        canOpen: () => !this.isViewOnly && !this.isLocked,
        setPrompt: (p) => this.aiPrompt.set(p),
        open: () => this.openAiAssist(),
        generate: () => this.generateAiDraft(),
      });
    });

    if (this.isViewOnly || this.isLocked) {
      this.form.disable();
    }

    this.loadFlows();
  }

  // ผู้ใช้เลือกลูกค้าเองจาก Combobox (ไม่ต้องเคยเข้าหน้าลูกค้ามาก่อน)
  onCustomerSelected(item: any): void {
    this.customerName.set(item ? (item.text ?? item.label ?? '') : '');
  }

  loadFlows() {
    this.isLoadingFlows = true;
    this.approvalService
      .getFlowsByDocumentType('PROJECT')
      .pipe(finalize(() => (this.isLoadingFlows = false)))
      .subscribe({
        next: (flows) => {
          this.flows = flows || [];
          this.cdr.detectChanges();
        },
        error: () => {
          console.warn('ไม่สามารถโหลด Approval Flow สำหรับ Project');
        },
      });
  }

  onFlowChange(event: any) {
    const flowId = event?.id ?? event?.value ?? event ?? null;
    this.selectedFlowId = flowId;
    this.form.patchValue({ approvalFlowId: flowId });
    this.cdr.detectChanges();
  }

  goToCreateApprovalFlow(): void {
    this.router.navigate(['/feature/bu/approval-flow/new'], {
      queryParams: { documentType: 'PROJECT' },
    });
  }

  loadApprovalFlowForProject(prjId: string) {
    this.approvalService.getDocumentStatus('PROJECT', prjId).subscribe({
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

  onBack(): void {
    const customerId = this.form.get('customerId')?.value;
    if (customerId) {
      this.customerState.setCustomer(customerId);
      this.navigation.navigate(['/feature/pm/project']);
    } else {
      this.navigation.navigate(['/feature/pm/project']);
    }
  }

  requestChange(): void {
    this.navigation.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId: this.projectId,
        targetType: 'PROJECT',
        targetId: this.projectId,
        targetTitle: this.form.get('projectName')?.value || this.form.get('projectCode')?.value,
      },
    });
  }

  submit() {
    if (this.isViewOnly || this.isLocked) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn(this.translate.instant('PMRT02A_INVALID_FORM_TITLE'), this.translate.instant('PMRT02A_INVALID_FORM_MSG'));
      return;
    }

    this.isSaving = true;
    const formRaw = this.form.getRawValue();
    const data: any = {
      ...formRaw,
      customerId: formRaw.customerId || null,
      contractId: formRaw.contractId || null,
      actualEndDate: formRaw.actualEndDate || null,
      budgetManday: formRaw.budgetManday !== null && formRaw.budgetManday !== undefined ? Number(formRaw.budgetManday) : 0,
      usedManday: formRaw.usedManday !== null && formRaw.usedManday !== undefined ? Number(formRaw.usedManday) : 0,
    };

    // ✅ ตรวจสอบ before call
    let request$;
    if (this.isEdit && this.projectId) {
      request$ = this.projectService.update(this.projectId, data);
    } else {
      request$ = this.projectService.create(data);
    }

    request$.subscribe({
      next: (res: any) => {
        const id = res?.id || (typeof res === 'string' ? res : null) || this.projectId;

        if (this.selectedFlowId && id) {
          this.approvalService
            .submitForApproval({
              documentType: 'PROJECT',
              documentId: id,
              documentCode: data.projectCode || ('PRJ-' + id.substring(0, 8).toUpperCase()),
              documentTitle: data.projectName || this.translate.instant('PMRT02A_NEW_PROJECT_DEFAULT_NAME'),
              flowId: this.selectedFlowId,
              comment: this.translate.instant('PMRT02A_SUBMIT_NEW_PROJECT_COMMENT'),
            })
            .pipe(finalize(() => (this.isSaving = false)))
            .subscribe({
              next: () => {
                this.isSaved = true;
                this.formData.markAsPristine();
                this.dialog.success(this.translate.instant('PMRT02A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMRT02A_SAVE_WITH_APPROVAL_MSG')).then(() => {
                  const customerId = this.form.get('customerId')?.value;
                  if (customerId) this.customerState.setCustomer(customerId);
                  this.navigation.navigate(['/feature/pm/project']);
                });
              },
              error: () => {
                this.isSaved = true;
                this.formData.markAsPristine();
                this.dialog.success(this.translate.instant('PMRT02A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMRT02A_SAVE_SUCCESS_MSG')).then(() => {
                  const customerId = this.form.get('customerId')?.value;
                  if (customerId) this.customerState.setCustomer(customerId);
                  this.navigation.navigate(['/feature/pm/project']);
                });
              },
            });
        } else {
          this.isSaving = false;
          this.isSaved = true;
          this.formData.markAsPristine();
          this.dialog.success(this.translate.instant('PMRT02A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMRT02A_SAVE_SUCCESS_MSG')).then(() => {
            const customerId = this.form.get('customerId')?.value;
            if (customerId) this.customerState.setCustomer(customerId);
            this.navigation.navigate(['/feature/pm/project']);
          });
        }
      },
      error: (err) => {
        this.isSaving = false;
        let errMsg = err.error?.message;
        if (err.error?.errors && typeof err.error.errors === 'object') {
          const detailList = Object.entries(err.error.errors).map(([k, v]) => `${k}: ${v}`).join('\n');
          errMsg = `${errMsg || 'Validation failed'}:\n${detailList}`;
        }
        this.dialog.error(this.translate.instant('PMRT02A_SAVE_ERROR_TITLE'), errMsg || this.translate.instant('PMRT02A_GENERIC_ERROR_MSG'));
      },
    });
  }

  // ===== AI Assistant Methods =====
  openAiAssist(): void {
    if (this.isLocked || this.isViewOnly) return;
    this.showAiModal.set(true);
    this.aiActiveTab.set('generate');
    this.loadAiHistory();
  }

  closeAiAssist(): void {
    this.showAiModal.set(false);
  }

  loadAiHistory(): void {
    const targetId = this.projectId || this.form?.get('id')?.value || 'new';
    this.aiHistories.set(this.aiHistoryService.getHistories('project', targetId));
  }

  deleteAiHistory(id: string, event: Event): void {
    event.stopPropagation();
    this.dialog.confirm(this.translate.instant('PMRT02A_CONFIRM_DELETE_HISTORY_TITLE'), this.translate.instant('PMRT02A_CONFIRM_DELETE_HISTORY_MSG')).then((ok: boolean) => {
      if (ok) {
        const targetId = this.projectId || this.form?.get('id')?.value || 'new';
        this.aiHistoryService.deleteHistory('project', targetId, id);
        this.loadAiHistory();
      }
    });
  }

  clearAllAiHistories(): void {
    this.dialog.confirm(this.translate.instant('PMRT02A_CONFIRM_CLEAR_HISTORY_TITLE'), this.translate.instant('PMRT02A_CONFIRM_CLEAR_HISTORY_MSG')).then((ok: boolean) => {
      if (ok) {
        const targetId = this.projectId || this.form?.get('id')?.value || 'new';
        this.aiHistoryService.clearHistories('project', targetId);
        this.loadAiHistory();
      }
    });
  }

  async generateAiDraft(): Promise<void> {
    if (this.isGeneratingAi()) return;

    this.isGeneratingAi.set(true);
    const targetId = this.projectId || this.form?.get('id')?.value || 'new';
    const currentCode = this.form?.get('projectCode')?.value;
    const currentName = this.form?.get('projectName')?.value;
    const customerId = this.form?.get('customerId')?.value;

    let attachments: AiAttachmentPayload[] = [];
    if (this.aiAttachedFiles().length) {
      attachments = await filesToAiAttachments(this.aiAttachedFiles());
    }

    this.projectService.generateDraft({
      customerId: customerId || undefined,
      projectCode: currentCode || undefined,
      projectName: currentName || undefined,
      prompt: this.aiPrompt() || undefined,
      model: this.aiModel() || undefined,
      attachments,
    }).subscribe({
      next: (draft) => {
        this.isGeneratingAi.set(false);
        if (!draft || (!draft.projectName && !draft.description && !draft.projectCode)) {
          this.dialog.warn(this.translate.instant('PMRT02A_NO_DATA_TITLE'), this.translate.instant('PMRT02A_AI_GENERATE_FAILED_MSG'));
          return;
        }

        const historyItem = this.aiHistoryService.addHistory(
          'project',
          targetId,
          draft,
          this.aiPrompt(),
          this.aiModel()
        );

        this.aiCurrentDraft.set(draft);
        this.aiCurrentVersionNo.set(historyItem.versionNo);
        this.loadAiHistory();

        // ดึงข้อมูลหัวข้อและเนื้อหา TipTap ลงในฟอร์มทันที
        this.applyDraftToForm(draft);

        this.dialog.success(this.translate.instant('PMRT02A_AI_GENERATE_SUCCESS_TITLE'), this.translate.instant('PMRT02A_AI_GENERATE_SUCCESS_MSG', { version: historyItem.versionNo }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isGeneratingAi.set(false);
        console.error('AI project generation error:', err);
        this.dialog.error(this.translate.instant('PMRT02A_GENERIC_ERROR_TITLE'), err?.error?.message || err?.message || this.translate.instant('PMRT02A_AI_GENERATE_ERROR_MSG'));
      },
    });
  }

  private applyDraftToForm(draft: any): void {
    if (!draft) return;
    // Smart Preserve: กรอกเฉพาะช่องที่ผู้ใช้ยังไม่ได้กรอก ห้ามเขียนทับสิ่งที่ผู้ใช้พิมพ์ไว้แล้ว
    // และห้ามแตะ projectCode (ระบบเป็นผู้กำหนด)
    smartPatchFormAiDraft(
      this.form,
      {
        projectCode: draft.projectCode,
        projectName: draft.projectName,
        description: draft.description,
        status: draft.status,
        startDate: draft.startDate,
        plannedEndDate: draft.endDate || draft.plannedEndDate,
      },
      ['id'],
      { status: this.statusOptions },
    );
  }

  pasteProjectDraft(draft: any): void {
    if (this.isLocked || this.isViewOnly) {
      this.dialog.warn(this.translate.instant('PMRT02A_ACTION_NOT_ALLOWED_TITLE'), this.translate.instant('PMRT02A_DOC_LOCKED_MSG'));
      return;
    }
    if (!draft) {
      this.dialog.warn(this.translate.instant('PMRT02A_NO_DATA_TITLE'), this.translate.instant('PMRT02A_NO_DRAFT_MSG'));
      return;
    }

    this.applyDraftToForm(draft);
    this.showAiModal.set(false);
    this.dialog.success(this.translate.instant('PMRT02A_PASTE_SUCCESS_TITLE'), this.translate.instant('PMRT02A_PASTE_SUCCESS_MSG'));
  }

  copyDraft(draft: any, historyId?: string): void {
    if (!draft) return;
    const text = typeof draft === 'string' ? draft : JSON.stringify(draft, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId.set(historyId || 'current');
      setTimeout(() => this.copiedId.set(null), 2000);
    });
  }
}

