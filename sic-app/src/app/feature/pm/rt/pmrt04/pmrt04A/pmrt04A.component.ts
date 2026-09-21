import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '../../../../../core/config/ai-models.config';

// src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.component.ts

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SicButtonComponent } from 'sic-ng';
import { SicVersionBadgeComponent } from '../../../../../core/component/sic-version-badge/sic-version-badge.component';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import { SicDatepickerComponent } from 'sic-ng';
import { SicInputComponent } from 'sic-ng';
import { SicTiptapEditorComponent } from '../../../../../core/component/sic-tiptap-editor/sic-tiptap-editor.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { DialogService } from '../../../../../core/services/dialog.service';
import { NavigationService } from '../../../../../core/services/navigation.service';
import { DateTimeUtil } from '../../../../../core/utils/datetime.util';
import { environment } from '../../../../../../environments/environment';
import { ApprovalService } from '../../../dt/pmdt03/approval.service';
import { Pmrt02Service } from '../../pmrt02/pmrt02.service';
import { Pmrt04AForm } from './pmrt04A.form';
import { ContractModel, Pmrt04APageData } from './pmrt04A.model';
import { Pmrt04AService, ContractSummary } from './pmrt04A.service';
import { SicEntitySummaryComponent, EntitySummaryCard } from '../../../../../core/component/sic-entity-summary/sic-entity-summary.component';
import { AiHistoryService, AiHistoryItem } from '../../../../../core/services/ai-history.service';
import { smartPatchFormAiDraft } from '../../../../../core/utils/ai-form-patch.util';
import { AiAttachmentPayload, filesToAiAttachments } from '../../../../../core/utils/ai-attachment.util';
import { tryAiAutoOpen } from '../../../../../core/utils/ai-navigator-deeplink.util';
import { SicAiAttachmentPickerComponent } from '../../../../../core/component/sic-ai-attachment-picker/sic-ai-attachment-picker.component';

@Component({
  selector: 'app-pmrt04a',
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
    SicDatepickerComponent,
    SicEntitySummaryComponent,
    TranslateModule,
    SicAiAttachmentPickerComponent,
  ],
  templateUrl: './pmrt04A.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pmrt04AComponent implements OnInit, CanComponentDeactivate {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public service = inject(Pmrt04AService);
  private approvalService = inject(ApprovalService);
  private dialog = inject(DialogService);
  private fb = inject(FormBuilder);
  private navigation = inject(NavigationService);
  private projectService = inject(Pmrt02Service);
  private cdr = inject(ChangeDetectorRef);
  private aiHistoryService = inject(AiHistoryService);
  private translate = inject(TranslateService);

  formData!: SicFromData<ContractModel>;
  get form(): FormGroup {
    return this.formData?.formGroup;
  }

  isEdit = false;
  isView = false;
  isLocked = false;
  contractId: string | null = null;
  isLoading = false;
  isSaving = false;

  // Context info
  customerId: string | null = null;
  customerName: string | null = null;
  projectId: string | null = null;
  projectName: string | null = null;

  // ===== Cross-Entity Summary =====
  summary = signal<ContractSummary | null>(null);
  summaryLoading = signal(false);

  summaryCards = computed<EntitySummaryCard[]>(() => {
    const s = this.summary();
    if (!s) return [];
    const projectId = this.projectId;
    const cards: EntitySummaryCard[] = [
      {
        icon: 'bi-flag',
        label: 'Milestone',
        value: `${s.milestones.completed}/${s.milestones.total}`,
        sublabel: this.translate.instant('PMRT04A_SUMMARY_COMPLETED_OF_TOTAL'),
        actionLabel: this.translate.instant('PMRT04A_SUMMARY_VIEW_PHASE'),
        action: () => this.navigation.navigate(['/feature/pm/phase'], { queryParams: { projectId } }),
      },
      {
        icon: 'bi-receipt',
        label: this.translate.instant('PMRT04A_SUMMARY_INVOICE_LABEL'),
        value: String(s.invoices.total),
        sublabel: s.invoices.pending > 0 ? this.translate.instant('PMRT04A_SUMMARY_INVOICE_PENDING', { count: s.invoices.pending }) : this.translate.instant('PMRT04A_SUMMARY_INVOICE_PAID_FULL'),
        variant: s.invoices.pending > 0 ? 'warning' : 'default',
        actionLabel: this.translate.instant('PMRT04A_SUMMARY_VIEW_INVOICE'),
        action: () => this.navigation.navigate(['/feature/pm/invoice'], { queryParams: { projectId } }),
      },
      {
        icon: 'bi-ticket-perforated',
        label: 'MA Ticket',
        value: String(s.maTickets.total),
        sublabel: s.maTickets.open > 0 ? this.translate.instant('PMRT04A_SUMMARY_MA_TICKET_OPEN', { count: s.maTickets.open }) : this.translate.instant('PMRT04A_SUMMARY_MA_TICKET_NONE_OPEN'),
        variant: s.maTickets.open > 0 ? 'warning' : 'default',
        actionLabel: this.translate.instant('PMRT04A_SUMMARY_VIEW_MA_TICKET'),
        action: () => this.navigation.navigate(['/feature/pm/ma-ticket'], { queryParams: { projectId } }),
      },
    ];

    if (s.daysUntilExpiry !== null) {
      const expiring = s.daysUntilExpiry <= 30;
      cards.push({
        icon: 'bi-clock-history',
        label: this.translate.instant('PMRT04A_SUMMARY_CONTRACT_AGE_LABEL'),
        value: s.daysUntilExpiry >= 0 ? this.translate.instant('PMRT04A_SUMMARY_DAYS_LEFT', { days: s.daysUntilExpiry }) : this.translate.instant('PMRT04A_SUMMARY_EXPIRED'),
        sublabel: expiring ? this.translate.instant('PMRT04A_SUMMARY_EXPIRING_SOON') : undefined,
        variant: s.daysUntilExpiry < 0 ? 'danger' : expiring ? 'warning' : 'default',
        actionLabel: this.contractId ? this.translate.instant('PMRT04A_SUMMARY_RENEW_CONTRACT') : undefined,
        action: this.contractId
          ? () => this.navigation.navigate(['/feature/pm/contract/renew', this.contractId!])
          : undefined,
      });
    }

    return cards;
  });

  // ===== AI Assistant =====
  showAiModal = signal(false);
  aiActiveTab = signal<'generate' | 'history'>('generate');
  isGeneratingAi = signal(false);
  aiModel = signal(DEFAULT_AI_MODEL);
  aiPrompt = signal('');
  aiContractType = signal('SOFTWARE_DEVELOPMENT');
  aiHistories = signal<AiHistoryItem<any>[]>([]);
  aiCurrentDraft = signal<any>(null);
  aiCurrentVersionNo = signal<number | null>(null);
  copiedId = signal<string | null>(null);
  aiAttachedFiles = signal<File[]>([]);

  aiModels = AI_MODEL_OPTIONS;

  get aiContractTypeOptions() {
    return [
      { value: 'SOFTWARE_DEVELOPMENT', label: this.translate.instant('PMRT04A_AI_CONTRACT_TYPE_SOFTWARE_DEV') },
      { value: 'MAINTENANCE_SUPPORT', label: this.translate.instant('PMRT04A_AI_CONTRACT_TYPE_MAINTENANCE') },
      { value: 'CONSULTING', label: this.translate.instant('PMRT04A_AI_CONTRACT_TYPE_CONSULTING') },
      { value: 'CLOUD_INFRASTRUCTURE', label: this.translate.instant('PMRT04A_AI_CONTRACT_TYPE_CLOUD') },
    ];
  }

  // Approval Integration
  selectedFlowId: string | null = null;
  apiGetApprovals = `${environment.apiBaseUrl}/api/pm/approvals/flows/document-type/CONTRACT`;

  isSaved = false;

  pageDirty = () => {
    if (this.isView || this.isSaved) {
      return false;
    }
    return this.formData?.isChanged ?? this.form?.dirty ?? false;
  };

  ngOnInit(): void {
    // resolver โหลดฟอร์ม + (ถ้าเป็นโหมดแก้ไข) ข้อมูลสัญญามาให้แล้ว — ไม่ต้องยิง HTTP ซ้ำ
    const page: Pmrt04APageData = this.route.snapshot.data['form'];
    this.formData = page.contractData;
    this.isEdit = page.isEdit;
    this.contractId = this.route.snapshot.paramMap.get('id');

    if (this.router.url.includes('/view')) {
      this.isView = true;
    }

    if (this.isEdit) {
      const data = this.formData.value;
      if (data.customerId) this.customerId = data.customerId;
      if (data.customerName) this.customerName = data.customerName;
      if (data.projectId) this.projectId = data.projectId;
      if (data.projectName) this.projectName = data.projectName;

      if (data.isLocked) {
        this.isLocked = true;
        this.isView = true;
      } else {
        this.isLocked = false;
      }
      if (this.isView) {
        this.form.disable();
      }
      if (this.contractId) {
        this.loadSummary(this.contractId);
      }
    }

    // รับ projectId และ customerId จาก queryParams
    this.route.queryParams.subscribe((params) => {
      if (params['mode'] === 'view') {
        this.isView = true;
      }
      const projectId = params['projectId'];
      if (projectId && !this.contractId) {
        this.projectId = projectId;
        this.projectService.getProject(projectId).subscribe({
          next: (project) => {
            this.customerId = project.customerId;
            this.customerName = project.customerName || null;
            this.projectName = project.projectName || null;
            // ✅ ใช้ formData.patchValue() — patch + re-snapshot อัตโนมัติ
            this.formData.patchValue({
              projectId,
              customerId: project.customerId,
              projectName: project.projectName,
              customerName: project.customerName,
            });
            if (this.isView) {
              this.form.disable();
            }
            this.cdr.detectChanges();
          },
          error: () => this.navigation.navigate(['/feature/pm/contract']),
        });
      }

      // Global AI Navigator ส่งผู้ใช้มาที่นี่พร้อมสั่งให้เปิด AI Draft Modal และกรอกข้อมูลทันที
      tryAiAutoOpen({
        params,
        router: this.router,
        route: this.route,
        moduleType: 'CONTRACT',
        canOpen: () => !this.contractId && !this.isView && !this.isLocked,
        setPrompt: (p) => this.aiPrompt.set(p),
        open: () => this.openAiAssist(),
        generate: () => this.generateAiDraft(),
      });
    });
  }

  loadContract(id: string) {
    this.isLoading = true;
    this.service
      .getContract(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (this.isView) {
            this.form.disable();
          }
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (data) => {
          if (data.customerId) {
            this.customerId = data.customerId;
          }
          if (data.customerName) {
            this.customerName = data.customerName;
          }
          if (data.projectId) {
            this.projectId = data.projectId;
          }
          if (data.projectName) {
            this.projectName = data.projectName;
          }
          // ✅ ใช้ formData.patchValue() — patch + re-snapshot ในครั้งเดียว
          this.formData.patchValue(data);
          if (data.isLocked) {
            this.isLocked = true;
            this.isView = true;
          } else {
            this.isLocked = false;
            this.isView = this.router.url.includes('/view');
          }
          if (this.isView) {
            this.form.disable();
          } else {
            this.form.enable();
          }
          this.cdr.detectChanges();
          this.loadSummary(id);
        },
        error: (error) => {
          console.error(this.translate.instant('PMRT04A_LOAD_FAILED_TITLE'), error);
          this.dialog.error(this.translate.instant('PMRT04A_LOAD_FAILED_TITLE'), this.translate.instant('PMRT04A_CONTRACT_NOT_FOUND_MSG'));
          this.navigation.navigate(['/feature/pm/contract']);
        },
      });
  }

  loadSummary(id: string): void {
    this.summaryLoading.set(true);
    this.service.getContractSummary(id).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.summaryLoading.set(false);
      },
      error: () => this.summaryLoading.set(false),
    });
  }

  onBack(): void {
    if (this.projectId) {
      this.navigation.navigate(['/feature/pm/contract'], {
        queryParams: { projectId: this.projectId },
      });
    } else if (this.customerId) {
      this.navigation.navigate(['/feature/pm/contract'], {
        queryParams: { customerId: this.customerId },
      });
    } else {
      this.navigation.navigate(['/feature/pm/contract']);
    }
  }

  requestChange(): void {
    this.navigation.navigate(['/feature/pm/change-request/new'], {
      queryParams: {
        projectId: this.projectId,
        targetType: 'CONTRACT',
        targetId: this.contractId,
        targetTitle: this.form.get('contractNo')?.value,
      },
    });
  }

  onApprovalStatusChange(event: any): void {
    if (event?.status && this.contractId) {
      this.loadContract(this.contractId);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn(this.translate.instant('PMRT04A_FORM_INVALID_TITLE'), this.translate.instant('PMRT04A_FORM_INVALID_MSG'));
      return;
    }


    this.isSaving = true;

    const data = { ...this.form.getRawValue() } as ContractModel;
    if (data.startDate) {
      data.startDate = DateTimeUtil.toInstantIsoString(data.startDate) || data.startDate;
    }
    if (data.endDate) {
      data.endDate = DateTimeUtil.toInstantIsoString(data.endDate) || data.endDate;
    }

    if (this.customerId) {
      data.customerId = this.customerId;
    } else {
      this.dialog.warn(this.translate.instant('PMRT04A_NO_CUSTOMER_DATA_TITLE'), this.translate.instant('PMRT04A_SELECT_CUSTOMER_FIRST_MSG'));
      this.isSaving = false;
      return;
    }

    this.service
      .save(data)
      .subscribe({
        next: (savedContractRes: any) => {
          this.isSaved = true;
          this.formData.resetModel(this.form.getRawValue());
          this.form.markAsPristine();

          const savedId =
            (typeof savedContractRes === 'string'
              ? savedContractRes
              : savedContractRes?.id) ||
            data.id ||
            this.contractId;

          // ถ้ามีการเลือกกระบวนการอนุมัติ ให้ส่งเข้า Approval Flow
          if (this.selectedFlowId && savedId) {
            this.approvalService
              .submitForApproval({
                documentType: 'CONTRACT',
                documentId: savedId,
                documentCode: data.contractNo,
                documentTitle: this.translate.instant('PMRT04A_APPROVAL_DOC_TITLE', { contractNo: data.contractNo }),
                flowId: this.selectedFlowId,
                comment: this.translate.instant('PMRT04A_SUBMIT_APPROVAL_COMMENT'),
              })
              .pipe(
                finalize(() => {
                  this.isSaving = false;
                  this.cdr.detectChanges();
                }),
              )
              .subscribe({
                next: () => {
                  this.dialog
                    .success(
                      this.translate.instant('PMRT04A_SAVE_SUCCESS_TITLE'),
                      this.translate.instant('PMRT04A_SAVE_SUCCESS_MSG', { contractNo: data.contractNo }),
                    )
                    .then(() => {
                      this.onBack();
                    });
                },
                error: (err) => {
                  console.error('Submit approval error:', err);
                  this.dialog
                    .success(
                      this.translate.instant('PMRT04A_SAVE_SUCCESS_TITLE'),
                      this.translate.instant('PMRT04A_SAVE_SUCCESS_MSG', { contractNo: data.contractNo }),
                    )
                    .then(() => {
                      this.onBack();
                    });
                },
              });
          } else {
            this.isSaving = false;
            this.cdr.detectChanges();
            this.dialog.success(this.translate.instant('PMRT04A_SAVE_SUCCESS_TITLE'), this.translate.instant('PMRT04A_SAVE_SUCCESS_GENERIC_MSG')).then(() => {
              this.onBack();
            });
          }
        },
        error: (error) => {
          this.isSaving = false;
          this.cdr.detectChanges();
          this.dialog.error(this.translate.instant('PMRT04A_SAVE_FAILED_TITLE'), error.error?.message || this.translate.instant('PMRT04A_SAVE_FAILED_MSG'));
        },
      });
  }

  // ===== AI Assistant Methods =====
  openAiAssist(): void {
    if (this.isLocked || this.isView) return;
    this.showAiModal.set(true);
    this.aiActiveTab.set('generate');
    this.loadAiHistory();
  }

  closeAiAssist(): void {
    this.showAiModal.set(false);
  }

  loadAiHistory(): void {
    const targetId = this.contractId || this.form?.get('id')?.value || 'new';
    this.aiHistories.set(this.aiHistoryService.getHistories('contract', targetId));
  }

  deleteAiHistory(id: string, event: Event): void {
    event.stopPropagation();
    this.dialog.confirm(this.translate.instant('PMRT04A_CONFIRM_DELETE_TITLE'), this.translate.instant('PMRT04A_CONFIRM_DELETE_HISTORY_MSG')).then((ok: boolean) => {
      if (ok) {
        const targetId = this.contractId || this.form?.get('id')?.value || 'new';
        this.aiHistoryService.deleteHistory('contract', targetId, id);
        this.loadAiHistory();
        this.cdr.detectChanges();
      }
    });
  }

  clearAllAiHistories(): void {
    this.dialog.confirm(this.translate.instant('PMRT04A_CONFIRM_CLEAR_HISTORY_TITLE'), this.translate.instant('PMRT04A_CONFIRM_CLEAR_HISTORY_MSG')).then((ok: boolean) => {
      if (ok) {
        const targetId = this.contractId || this.form?.get('id')?.value || 'new';
        this.aiHistoryService.clearHistories('contract', targetId);
        this.loadAiHistory();
        this.cdr.detectChanges();
      }
    });
  }

  async generateAiDraft(): Promise<void> {
    if (this.isGeneratingAi()) return;

    this.isGeneratingAi.set(true);
    const targetId = this.contractId || this.form?.get('id')?.value || 'new';
    const currentNo = this.form?.get('contractNo')?.value;
    const currentVal = this.form?.get('contractValue')?.value;

    let attachments: AiAttachmentPayload[] = [];
    if (this.aiAttachedFiles().length) {
      attachments = await filesToAiAttachments(this.aiAttachedFiles());
    }

    this.service.generateDraft({
      projectId: this.projectId || this.form?.get('projectId')?.value || undefined,
      customerId: this.customerId || this.form?.get('customerId')?.value || undefined,
      contractNo: currentNo || undefined,
      contractType: this.aiContractType() || this.form?.get('contractType')?.value || undefined,
      contractValue: currentVal ? Number(currentVal) : undefined,
      prompt: this.aiPrompt() || undefined,
      model: this.aiModel() || undefined,
      attachments,
    }).subscribe({
      next: (draft) => {
        this.isGeneratingAi.set(false);
        if (!draft || (!draft.contractNo && !draft.scopeSummary && !draft.paymentTerms)) {
          this.dialog.warn(this.translate.instant('PMRT04A_NO_DATA_FOUND_TITLE'), this.translate.instant('PMRT04A_AI_GENERATE_FAILED_MSG'));
          return;
        }

        const historyItem = this.aiHistoryService.addHistory(
          'contract',
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

        this.dialog.success(this.translate.instant('PMRT04A_AI_GENERATE_SUCCESS_TITLE'), this.translate.instant('PMRT04A_AI_GENERATE_SUCCESS_MSG', { version: historyItem.versionNo }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isGeneratingAi.set(false);
        console.error('AI contract generation error:', err);
        this.dialog.error(this.translate.instant('PMRT04A_ERROR_OCCURRED_TITLE'), err?.error?.message || err?.message || this.translate.instant('PMRT04A_AI_CONTENT_GENERATE_FAILED_MSG'));
        this.cdr.detectChanges();
      },
    });
  }

  private applyDraftToForm(draft: any): void {
    if (!draft) return;
    // Smart Preserve: กรอกเฉพาะช่องที่ผู้ใช้ยังไม่ได้กรอก ห้ามเขียนทับสิ่งที่ผู้ใช้พิมพ์ไว้แล้ว
    // และห้ามแตะ contractNo (ระบบเป็นผู้กำหนด)
    smartPatchFormAiDraft(
      this.form,
      {
        contractType: draft.contractType,
        contractValue: draft.contractValue !== undefined && draft.contractValue !== null ? Number(draft.contractValue) : undefined,
        paymentTerms: draft.paymentTerms,
        scopeSummary: draft.scopeSummary,
        startDate: draft.startDate,
        endDate: draft.endDate,
        signStatus: draft.signStatus,
      },
      ['id', 'contractNo'],
    );
  }

  pasteContractDraft(draft: any): void {
    if (this.isLocked || this.isView) {
      this.dialog.warn(this.translate.instant('PMRT04A_CANNOT_PROCEED_TITLE'), this.translate.instant('PMRT04A_DOC_VIEW_OR_LOCKED_MSG'));
      return;
    }
    if (!draft) {
      this.dialog.warn(this.translate.instant('PMRT04A_NO_DATA_FOUND_TITLE'), this.translate.instant('PMRT04A_NO_DATA_TO_PASTE_MSG'));
      return;
    }

    this.applyDraftToForm(draft);
    this.showAiModal.set(false);
    this.dialog.success(this.translate.instant('PMRT04A_PASTE_SUCCESS_TITLE'), this.translate.instant('PMRT04A_PASTE_SUCCESS_MSG'));
    this.cdr.detectChanges();
  }

  copyDraft(draft: any, historyId?: string): void {
    if (!draft) return;
    const text = typeof draft === 'string' ? draft : JSON.stringify(draft, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      this.copiedId.set(historyId || 'current');
      setTimeout(() => {
        this.copiedId.set(null);
        this.cdr.detectChanges();
      }, 2000);
      this.cdr.detectChanges();
    });
  }
}

