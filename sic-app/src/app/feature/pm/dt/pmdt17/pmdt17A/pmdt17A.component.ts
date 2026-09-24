import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '../../../../../core/config/ai-models.config';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { SicButtonComponent } from 'sic-ng';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicInputComponent } from 'sic-ng';
import { SicDatepickerComponent } from 'sic-ng';
import { SicTimepickerComponent } from '../../../../../core/component/sic-timepicker/sic-timepicker.component';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import { ApprovalService } from '../../pmdt03/approval.service';
import type { ApprovalFlow } from '../../pmdt03/approval.model';
import { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { CustomerStateService } from '../../../../../core/services/customer-state.service';
import { BusinessService } from '../../../../../core/services/business.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';

import { Pmdt17AService } from './pmdt17A.service';
import { Pmdt17AForm } from './pmdt17A.form';
import { PmMaTicketModel } from './pmdt17A.model';
import { SicEntityState } from '../../../../../core/model/sic-base-model';
import { apiBaseUrl } from '../../../../../core/config/api.config';
import { AiHistoryService, AiHistoryItem } from '../../../../../core/services/ai-history.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { smartPatchFormAiDraft } from '../../../../../core/utils/ai-form-patch.util';
import { AiAttachmentPayload, filesToAiAttachments } from '../../../../../core/utils/ai-attachment.util';
import { tryAiAutoOpen } from '../../../../../core/utils/ai-navigator-deeplink.util';
import { SicAiAttachmentPickerComponent } from '../../../../../core/component/sic-ai-attachment-picker/sic-ai-attachment-picker.component';

@Component({
  selector: 'app-pmdt17a',
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
    SicDatepickerComponent,
    SicTimepickerComponent,
    SicTiptapEditorComponent,
    TranslateModule,
    SicAiAttachmentPickerComponent,
  ],
  templateUrl: './pmdt17A.component.html',
  styleUrls: ['./pmdt17A.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Pmdt17AComponent implements OnInit, CanComponentDeactivate {
  private translate = inject(TranslateService);
  private service = inject(Pmdt17AService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(DialogService);
  private customerState = inject(CustomerStateService);
  private businessService = inject(BusinessService);
  private approvalService = inject(ApprovalService);
  private aiHistoryService = inject(AiHistoryService);

  formData!: SicFromData<PmMaTicketModel>;
  id = signal<string | null>(null);
  isSaving = signal(false);
  isEdit = signal(false);
  isView = signal(false);
  isLocked = signal(false);

  // Approval Flow
  approvalFlowsApi = `${apiBaseUrl}/api/pm/approvals/flows/document-type/MA_TICKET`;
  flows = signal<ApprovalFlow[]>([]);
  selectedFlowId = signal<string | null>(null);
  isLoadingFlows = signal(false);

  ticketTypeOptions = [
    { value: 'BUG_SUPPORT', label: this.translate.instant('PMDT17_TYPE_BUG_SUPPORT') },
    { value: 'DATA_ISSUE', label: this.translate.instant('PMDT17_TYPE_DATA_ISSUE') },
    { value: 'USER_SUPPORT', label: this.translate.instant('PMDT17_TYPE_USER_SUPPORT') },
    { value: 'CHANGE_REQUEST', label: this.translate.instant('PMDT17_TYPE_CHANGE_REQUEST') },
  ];

  severityOptions = [
    { value: 'LOW', label: this.translate.instant('PMDT17_SEV_LOW') },
    { value: 'MEDIUM', label: this.translate.instant('PMDT17_SEV_MEDIUM') },
    { value: 'HIGH', label: this.translate.instant('PMDT17_SEV_HIGH') },
    { value: 'CRITICAL', label: this.translate.instant('PMDT17_SEV_CRITICAL') },
  ];

  statusOptions = [
    { value: 'OPEN', label: this.translate.instant('PMDT17_STATUS_OPEN_INTAKE') },
    { value: 'IN_PROGRESS', label: this.translate.instant('PMDT17_STATUS_IN_PROGRESS') },
    { value: 'WAITING_CUSTOMER', label: this.translate.instant('PMDT17_STATUS_WAITING_CUST_SHORT') },
    { value: 'RESOLVED', label: this.translate.instant('PMDT17_STATUS_RESOLVED_DONE') },
    { value: 'CLOSED', label: this.translate.instant('PMDT17_STATUS_CLOSED_WORK') },
  ];

  apiMembersCombobox = `${apiBaseUrl}/api/business/combobox-members`;
  apiGetComboboxProject = `${apiBaseUrl}/api/pm/customer-projects/combobox`;
  businessId = this.businessService.getCurrentBusinessId();
  contractOptions = signal<Array<{ value: string; text: string }>>([]);
  isProjectDerived = signal(false);

  // AI Assistant State
  showAiModal = signal(false);
  isGeneratingAi = signal(false);
  aiAssistTab = signal<'generate' | 'history'>('generate');
  aiModel = signal(DEFAULT_AI_MODEL);
  aiPrompt = signal('');
  aiTicketType = signal('BUG_SUPPORT');
  aiPriority = signal('MEDIUM');
  aiModels = AI_MODEL_OPTIONS;
  aiHistories = signal<AiHistoryItem[]>([]);
  aiCurrentDraft = signal<any | null>(null);
  aiCurrentVersionNo = signal<number | null>(null);
  copiedId = signal<string | null>(null);
  aiAttachedFiles = signal<File[]>([]);

  isSaved = false;
  pageDirty = () => this.isSaved ? false : (this.formData?.isChanged ?? false);

  loadAiHistory(): void {
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.aiHistories.set(this.aiHistoryService.getHistories('ma_ticket', targetId));
  }

  deleteAiHistory(id: string, e: MouseEvent): void {
    e.stopPropagation();
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.dialog.confirm(
      this.translate.instant('PMDT17_CONFIRM_DELETE_TITLE'),
      this.translate.instant('PMDT17_CONFIRM_DELETE_HISTORY_MSG'),
    ).then((ok: boolean) => {
      if (ok) {
        this.aiHistoryService.deleteHistory('ma_ticket', targetId, id);
        this.loadAiHistory();
      }
    });
  }

  clearAllAiHistory(): void {
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';
    this.dialog.confirm(
      this.translate.instant('PMDT17_CONFIRM_CLEAR_HISTORY_TITLE'),
      this.translate.instant('PMDT17_CONFIRM_CLEAR_HISTORY_MSG'),
    ).then((ok: boolean) => {
      if (ok) {
        this.aiHistoryService.clearHistories('ma_ticket', targetId);
        this.loadAiHistory();
      }
    });
  }

  openAiModal(): void {
    if (this.isLocked() || this.isView()) {
      this.dialog.warn(
        this.translate.instant('PMDT17_CANNOT_PERFORM_TITLE'),
        this.translate.instant('PMDT17_DOC_VIEW_LOCKED_MSG'),
      );
      return;
    }
    const currentType = (this.formData?.form?.value as any)?.ticketType || 'BUG_SUPPORT';
    const currentSev = (this.formData?.form?.value as any)?.severity || 'MEDIUM';
    this.aiTicketType.set(currentType);
    this.aiPriority.set(currentSev);
    this.aiPrompt.set('');
    this.aiAssistTab.set('generate');
    this.loadAiHistory();
    this.showAiModal.set(true);
  }

  closeAiModal(): void {
    if (this.isGeneratingAi()) return;
    this.showAiModal.set(false);
  }

  async generateWithAi(): Promise<void> {
    if (this.isGeneratingAi()) return;

    const projId = (this.formData?.form?.value as any)?.projectId || this.customerState.getProjectId();
    const currentTitle = (this.formData?.form?.value as any)?.title;
    const targetId = this.id() || (this.formData?.form?.value as any)?.id || 'new';

    this.isGeneratingAi.set(true);

    let attachments: AiAttachmentPayload[] = [];
    if (this.aiAttachedFiles().length) {
      attachments = await filesToAiAttachments(this.aiAttachedFiles());
    }

    this.service.generateDraft({
      projectId: projId || undefined,
      title: currentTitle || undefined,
      ticketType: this.aiTicketType() || undefined,
      priority: this.aiPriority() || undefined,
      prompt: this.aiPrompt() || undefined,
      model: this.aiModel() || undefined,
      attachments,
    }).subscribe({
      next: (draft) => {
        this.isGeneratingAi.set(false);
        if (!draft) {
          this.dialog.warn(
            this.translate.instant('PMDT17_NO_DATA_FOUND_TITLE'),
            this.translate.instant('PMDT17_AI_GENERATE_FAILED_MSG'),
          );
          return;
        }

        const historyItem = this.aiHistoryService.addHistory(
          'ma_ticket',
          targetId,
          draft,
          this.aiPrompt(),
          this.aiModel()
        );

        this.aiCurrentDraft.set(draft);
        this.aiCurrentVersionNo.set(historyItem.versionNo);
        this.loadAiHistory();

        // ดึงข้อมูลหัวข้อ (Title) ประเภท ระดับความเร่งด่วน รายละเอียดปัญหา (Tiptap) และแนวทางแก้ไข (Tiptap) ลงในฟอร์มทันที
        this.applyDraftToForm(draft);

        this.dialog.success(
          this.translate.instant('PMDT17_AI_GENERATE_SUCCESS_TITLE'),
          this.translate.instant('PMDT17_AI_DRAFT_APPLIED_MSG').replace('{version}', String(historyItem.versionNo)),
        );
      },
      error: (err) => {
        this.isGeneratingAi.set(false);
        console.error('AI ma ticket generation error:', err);
        this.dialog.error(
          this.translate.instant('PMDT17_ERROR_TITLE'),
          err?.error?.message || err?.message || this.translate.instant('PMDT17_AI_CONTENT_FAILED_MSG'),
        );
      },
    });
  }

  private applyDraftToForm(draft: any): void {
    if (!draft) return;
    // Smart Preserve: กรอกเฉพาะช่องที่ผู้ใช้ยังไม่ได้กรอก ห้ามเขียนทับสิ่งที่ผู้ใช้พิมพ์ไว้แล้ว
    smartPatchFormAiDraft(
      this.formData.form,
      {
        title: draft.title,
        ticketType: draft.ticketType,
        severity: draft.severity || draft.priority,
        description: draft.description,
        resolutionSummary: draft.resolutionSummary || draft.resolution,
      },
      ['id'],
      { ticketType: this.ticketTypeOptions, severity: this.severityOptions },
    );
  }

  pasteMaTicketDraft(draft: any): void {
    if (this.isLocked() || this.isView()) {
      this.dialog.warn(
        this.translate.instant('PMDT17_CANNOT_PERFORM_TITLE'),
        this.translate.instant('PMDT17_DOC_VIEW_LOCKED_MSG'),
      );
      return;
    }
    if (!draft) {
      this.dialog.warn(
        this.translate.instant('PMDT17_NO_DATA_FOUND_TITLE'),
        this.translate.instant('PMDT17_NO_PASTE_DATA_MSG'),
      );
      return;
    }

    this.applyDraftToForm(draft);
    this.showAiModal.set(false);
    this.dialog.success(
      this.translate.instant('PMDT17_PASTE_SUCCESS_TITLE'),
      this.translate.instant('PMDT17_PASTE_SUCCESS_MSG'),
    );
  }

  copyDraft(draft: any, historyId?: string): void {
    if (!draft) return;
    const text = typeof draft === 'string' ? draft : JSON.stringify(draft, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId.set(historyId || 'current');
      setTimeout(() => this.copiedId.set(null), 2000);
    });
  }

  ngOnInit() {
    const rawForm = Pmdt17AForm.createForm(this.fb);
    this.formData = new SicFromData<PmMaTicketModel>(rawForm);

    const isViewRoute = this.router.url.includes('/view');
    if (isViewRoute) {
      this.isView.set(true);
    }

    this.loadApprovalFlows();

    const projId = this.customerState.getProjectId();
    const custId = this.customerState.getCustomerId();
    if (projId || custId) {
      this.formData.patchValue({
        ...(projId ? { projectId: projId } : {}),
        ...(custId ? { customerId: custId } : {}),
      } as any);
    }
    this.loadContractOptions(projId || undefined);

    this.route.params.subscribe((params) => {
      const paramId = params['id'];
      if (paramId) {
        this.id.set(paramId);
      }
      const isViewRoute = this.router.url.includes('/view');
      const isEditRoute = this.router.url.includes('/edit');
      this.isView.set(isViewRoute);
      this.isEdit.set(isEditRoute || (!isViewRoute && !!paramId));
      if (this.isView()) {
        this.formData?.form.disable();
      } else {
        this.formData?.form.enable();
      }
      if (paramId) {
        this.loadData(paramId);
      }
    });

    this.route.queryParams.subscribe((params) => {
      // Global AI Navigator ส่งผู้ใช้มาที่นี่พร้อมสั่งให้เปิด AI Draft Modal และกรอกข้อมูลทันที
      tryAiAutoOpen({
        params,
        router: this.router,
        route: this.route,
        moduleType: 'MA_TICKET',
        canOpen: () => !this.isView() && !this.isLocked(),
        setPrompt: (p) => this.aiPrompt.set(p),
        open: () => this.openAiModal(),
        generate: () => this.generateWithAi(),
      });
    });
  }

  loadContractOptions(projectId?: string): void {
    this.service.getContractCombobox(projectId).subscribe({
      next: (res) => this.contractOptions.set(res || []),
      error: () => this.contractOptions.set([]),
    });
  }

  // เลือกโครงการเองจาก Combobox (ไม่ต้องเคยเข้าหน้าโครงการมาก่อน)
  onProjectSelected(item: any): void {
    const projId = item?.value ?? item?.id ?? null;
    this.loadContractOptions(projId || undefined);
  }

  // เลือกสัญญาแล้วผูกลูกค้า/โครงการให้อัตโนมัติ (ตัวเลือกหลักตามแผนผังความสัมพันธ์)
  onContractSelected(item: any): void {
    const contractId = item?.value ?? item?.id ?? null;
    if (!contractId) {
      this.isProjectDerived.set(false);
      return;
    }
    this.service.getContractById(contractId).subscribe({
      next: (contract) => {
        this.formData.patchValue({
          projectId: contract?.projectId || null,
          customerId: contract?.customerId || null,
        } as any);
        this.isProjectDerived.set(!!contract?.projectId);
      },
    });
  }

  loadApprovalFlows(): void {
    this.isLoadingFlows.set(true);
    this.approvalService.getFlowsByDocumentType('MA_TICKET').subscribe({
      next: (flows) => {
        this.flows.set(flows);
        this.isLoadingFlows.set(false);
      },
      error: () => {
        this.isLoadingFlows.set(false);
      },
    });
  }

  loadData(id: string) {
    this.service.getById(id).subscribe({
      next: (data) => {
        this.formData.form.patchValue(data);
        if (data.isLocked) {
          this.isLocked.set(true);
          this.isView.set(true);
        } else {
          this.isLocked.set(false);
          this.isView.set(this.router.url.includes('/view'));
        }
        if (this.isView()) {
          this.formData.form.disable();
        } else {
          this.formData.form.enable();
        }
        this.formData.resetModel(this.formData.form.getRawValue() as any);
        if (data.projectId) {
          this.loadContractOptions(data.projectId);
        }
        this.isProjectDerived.set(!!data.contractId);
      },
      error: (err) => {
        this.dialog.error(this.translate.instant('PMDT17_ERROR_TITLE'), err.message || this.translate.instant('PMDT17_LOAD_TICKET_FAILED_MSG'));
      },
    });
  }

  goToEditMode(): void {
    if (this.id() && !this.isLocked()) {
      this.isView.set(false);
      this.isEdit.set(true);
      this.formData?.form.enable();
      this.router.navigate(['/feature/pm/ma-ticket', this.id(), 'edit']);
    }
  }

  requestChange(): void {
    const projectId = this.formData?.form.get('projectId')?.value;
    this.router.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId,
        targetType: 'MA_TICKET',
        targetId: this.id(),
        targetTitle: this.formData?.form.get('title')?.value,
      },
    });
  }

  submit() {
    this.formData.form.markAllAsTouched();
    if (this.formData.invalid) {
      this.dialog.warn(
        this.translate.instant('PMDT17_FILL_DATA_TITLE'),
        this.translate.instant('PMDT17_CHECK_FORM_MSG'),
      );
      return;
    }

    this.isSaving.set(true);
    const rawVal = this.formData.form.getRawValue();
    const targetId = this.id() || rawVal.id;
    const isEditMode = !!targetId || this.isEdit();
    const formValue = {
      ...rawVal,
      id: targetId || undefined,
      state: isEditMode ? SicEntityState.Modified : SicEntityState.Added,
    };
    this.service.save(formValue).subscribe({
      next: (res: any) => {
        const savedId = res?.id || (typeof res === 'string' ? res : null) || this.id();
        if (this.selectedFlowId() && savedId) {
          this.approvalService.submitForApproval({
            documentType: 'MA_TICKET',
            documentId: savedId,
            documentCode: formValue.ticketNo,
            documentTitle: formValue.title || (formValue.ticketNo ? ('MA Ticket ' + formValue.ticketNo) : 'MA Ticket'),
            flowId: this.selectedFlowId()!,
            comment: this.translate.instant('PMDT17_SUBMIT_APPROVAL_COMMENT')
          }).subscribe({
            next: () => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success(this.translate.instant('PMDT17_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT17_SAVE_TICKET_SUCCESS_MSG'));
              this.router.navigate(['/feature/pm/ma-ticket']);
            },
            error: (err) => {
              this.isSaving.set(false);
              this.isSaved = true;
              this.formData.markAsPristine();
              this.dialog.success(this.translate.instant('PMDT17_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT17_SAVE_TICKET_SUCCESS_MSG'));
              this.router.navigate(['/feature/pm/ma-ticket']);
            }
          });
        } else {
          this.isSaving.set(false);
          this.isSaved = true;
          this.formData.markAsPristine();
          this.dialog.success(this.translate.instant('PMDT17_SAVE_SUCCESS_TITLE'), this.translate.instant('PMDT17_SAVE_TICKET_SUCCESS_MSG'));
          this.router.navigate(['/feature/pm/ma-ticket']);
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.dialog.error(this.translate.instant('PMDT17_ERROR_TITLE'), err.message || this.translate.instant('PMDT17_SAVE_FAILED_MSG'));
      },
    });
  }

  onBack() {
    this.router.navigate(['/feature/pm/ma-ticket']);
  }
}
