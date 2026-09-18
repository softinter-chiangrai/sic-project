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
import { SicCopyLinkComponent } from '../../../../../core/component/sic-copy-link/sic-copy-link.component';

import { ProjectModel } from './pmrt02A.model';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


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
    SicCopyLinkComponent,
    TranslateModule,
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

  formData!: SicFromData<any>;
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
    this.initForm();

    this.route.queryParams.subscribe((params) => {
      const mode = params['mode'];
      if (mode === 'view') {
        this.isViewOnly = true;
      }
      const customerId = params['customerId'];
      const customerName = params['customerName'] || '';
      if (customerId) {
        this.formData.patchValue({ customerId: customerId });
        if (customerName) {
          this.customerName.set(customerName);
        }
      }
    });

    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEdit = true;
        this.projectId = id;
        this.loadProject(id);
      }
    });

    this.loadFlows();
  }

  loadFlows() {
    this.isLoadingFlows = true;
    this.approvalService
      .getFlowsByDocumentType('PROJECT')
      .pipe(finalize(() => (this.isLoadingFlows = false)))
      .subscribe({
        next: (flows) => {
          this.flows = flows || [];
          if (!this.selectedFlowId && this.flows.length > 0 && !this.projectId) {
            this.selectedFlowId = this.flows[0].id;
            this.form.patchValue({ approvalFlowId: this.selectedFlowId });
          }
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

  initForm(): void {
    this.formData = new SicFromData<any>(this.fb.group({
      id: [null],
      projectCode: [null, [Validators.required, Validators.maxLength(30)]],
      projectName: [null, [Validators.required, Validators.maxLength(255)]],
      customerId: [null],
      contractId: [null],
      contractNo: [null],
      startDate: [null, [Validators.required]],
      plannedEndDate: [null, [Validators.required]],
      actualEndDate: [null],
      budgetManday: [null, [Validators.required, Validators.min(0)]],
      usedManday: [0, [Validators.min(0)]],
      status: ['Prospect', [Validators.required]],
      priority: ['Medium', [Validators.required]],
      description: [null],
      isActive: [true],
      approvalFlowId: [null],
    }));
  }

  loadProject(id: string) {
    this.isLoading = true;
    this.projectService
      .getById(id)
      .pipe(finalize(() => {
      this.isLoading = false;
      if (this.isViewOnly || this.isLocked) {
        this.form.disable();
      }
      this.formData.resetModel(this.form.getRawValue());
      this.cdr.detectChanges(); // ✅ บังคับอัปเดต View ทันที
    }))
      .subscribe({
        next: (data: ProjectModel) => {
          this.formData.patchValue(data);
          if (data.customerName) {
            this.customerName.set(data.customerName);
          }
          if (data.isApproved || data.isLocked || data.approvalStatus === 'APPROVED') {
            this.isLocked = true;
            this.isViewOnly = true;
          } else {
            this.isLocked = false;
            this.isViewOnly = this.router.url.includes('/view');
          }
          if (this.isViewOnly) {
            this.form.disable();
          } else {
            this.form.enable();
          }
          this.loadApprovalFlowForProject(id);
        },
        error: (err) => {
          console.error('Load project error:', err);
          this.dialog.error(this.translate.instant('PMRT02A_LOAD_ERROR_TITLE'), this.translate.instant('PMRT02A_LOAD_ERROR_MSG'));
          this.navigation.navigate(['/feature/pm/project']);
        },
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
    const data = this.form.getRawValue() as ProjectModel;

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
        this.dialog.error(this.translate.instant('PMRT02A_SAVE_ERROR_TITLE'), err.error?.message || this.translate.instant('PMRT02A_GENERIC_ERROR_MSG'));
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

  generateAiDraft(): void {
    if (this.isGeneratingAi()) return;

    this.isGeneratingAi.set(true);
    const targetId = this.projectId || this.form?.get('id')?.value || 'new';
    const currentCode = this.form?.get('projectCode')?.value;
    const currentName = this.form?.get('projectName')?.value;
    const customerId = this.form?.get('customerId')?.value;

    this.projectService.generateDraft({
      customerId: customerId || undefined,
      projectCode: currentCode || undefined,
      projectName: currentName || undefined,
      prompt: this.aiPrompt() || undefined,
      model: this.aiModel() || undefined,
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
    this.formData.patchValue({
      projectCode: draft.projectCode || this.form.get('projectCode')?.value,
      projectName: draft.projectName || this.form.get('projectName')?.value,
      description: draft.description || this.form.get('description')?.value,
      status: draft.status || this.form.get('status')?.value || 'Planning',
      startDate: draft.startDate || this.form.get('startDate')?.value,
      plannedEndDate: draft.endDate || draft.plannedEndDate || this.form.get('plannedEndDate')?.value,
    });
    this.form.markAsDirty();
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

